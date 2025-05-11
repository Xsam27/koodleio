
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    // Get request body
    const { childId, childName, childAge, keyStage } = await req.json();
    
    if (!childId) {
      throw new Error("Missing childId parameter");
    }
    
    // Fetch child's recent activity results
    const { data: activityResults, error: activityError } = await supabaseClient
      .from('activity_results')
      .select('*')
      .eq('child_id', childId)
      .order('completed_at', { ascending: false })
      .limit(20);
    
    if (activityError) {
      throw activityError;
    }

    // If there are not enough activities, return early
    if (!activityResults || activityResults.length < 3) {
      return new Response(
        JSON.stringify({ message: "Not enough activity data to generate insights" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Prepare data for OpenAI
    const childData = {
      name: childName || "the child",
      age: childAge || 8,
      keyStage: keyStage || "KS2",
      recentActivities: activityResults
    };
    
    // Send to OpenAI
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an educational AI that analyzes children's learning data and provides insightful feedback.
            You need to identify 3 strengths and 3 areas for improvement based on their recent activities.
            Also suggest 2 specific activities they should try next.
            Format your response as JSON with the following structure:
            {
              "strengths": [
                {"area": "string", "subject": "English|Maths", "description": "string"}
              ],
              "weaknesses": [
                {"area": "string", "subject": "English|Maths", "description": "string"}
              ],
              "recommended_activities": [
                {"title": "string", "subject": "English|Maths", "description": "string", "difficulty": "easy|medium|hard", "estimated_time": number, "focus_area": "string"}
              ],
              "tutor_tip": {"text": "string", "focus_area": "string", "subject": "English|Maths"}
            }`
          },
          {
            role: "user",
            content: `Here is the learning data for ${childData.name}, age ${childData.age}, in ${childData.keyStage}:\n${JSON.stringify(childData.recentActivities)}\n\nPlease analyze this data and provide insights in the JSON format specified.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });
    
    const openAIData = await openAIResponse.json();
    
    if (!openAIData.choices || openAIData.choices.length === 0) {
      throw new Error("Failed to get response from OpenAI");
    }
    
    // Parse the AI response
    const aiResponseContent = openAIData.choices[0].message.content;
    const parsedAIResponse = JSON.parse(aiResponseContent);
    
    // Save insights to Supabase
    const { strengths, weaknesses, recommended_activities, tutor_tip } = parsedAIResponse;
    
    // Insert strengths
    if (strengths && strengths.length > 0) {
      await supabaseClient.from('learning_insights').insert(
        strengths.map((s: any) => ({
          child_id: childId,
          area: s.area,
          subject: s.subject,
          description: s.description,
          type: 'strength'
        }))
      );
    }
    
    // Insert weaknesses
    if (weaknesses && weaknesses.length > 0) {
      await supabaseClient.from('learning_insights').insert(
        weaknesses.map((w: any) => ({
          child_id: childId,
          area: w.area,
          subject: w.subject,
          description: w.description,
          type: 'weakness'
        }))
      );
    }
    
    // Insert recommended activities
    if (recommended_activities && recommended_activities.length > 0) {
      await supabaseClient.from('recommended_activities').insert(
        recommended_activities.map((a: any) => ({
          child_id: childId,
          title: a.title,
          subject: a.subject,
          description: a.description,
          difficulty: a.difficulty,
          estimated_time: a.estimated_time,
          focus_area: a.focus_area
        }))
      );
    }
    
    // Insert tutor tip
    if (tutor_tip) {
      await supabaseClient.from('ai_tutor_tips').insert({
        child_id: childId,
        text: tutor_tip.text,
        focus_area: tutor_tip.focus_area,
        subject: tutor_tip.subject
      });
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Learning insights generated successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in generate-learning-insights:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
