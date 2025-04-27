
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActivityResult {
  id: string;
  user_id: string;
  child_id: string;
  activity_id: string;
  subject: string;
  score: number;
  time_taken: number;
  topic: string;
  difficulty: string;
  completed_at: string;
}

interface InsightRequest {
  childId: string;
  childName: string;
  childAge: number;
  keyStage: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childId, childName, childAge, keyStage }: InsightRequest = await req.json();
    
    // Fetch recent activity results for the child from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    
    const activityResponse = await fetch(
      `${supabaseUrl}/rest/v1/activity_results?child_id=eq.${childId}&order=completed_at.desc&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!activityResponse.ok) {
      throw new Error(`Error fetching activity data: ${activityResponse.statusText}`);
    }
    
    const activityResults: ActivityResult[] = await activityResponse.json();
    
    if (activityResults.length === 0) {
      // If no activities yet, generate some generic recommendations
      return new Response(
        JSON.stringify({ message: 'No activity data available for insights generation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Analyze the activity data to extract patterns
    const mathsActivities = activityResults.filter(a => a.subject === 'Maths');
    const englishActivities = activityResults.filter(a => a.subject === 'English');
    
    const avgMathScore = mathsActivities.length > 0 
      ? mathsActivities.reduce((sum, a) => sum + a.score, 0) / mathsActivities.length 
      : 0;
    
    const avgEnglishScore = englishActivities.length > 0 
      ? englishActivities.reduce((sum, a) => sum + a.score, 0) / englishActivities.length 
      : 0;
    
    // Group by topics to find strengths and weaknesses
    const topicScores: Record<string, { total: number, count: number, subject: string }> = {};
    
    activityResults.forEach(activity => {
      if (!topicScores[activity.topic]) {
        topicScores[activity.topic] = { total: 0, count: 0, subject: activity.subject };
      }
      topicScores[activity.topic].total += activity.score;
      topicScores[activity.topic].count += 1;
    });
    
    const topicAverages = Object.entries(topicScores).map(([topic, data]) => ({
      topic,
      averageScore: data.total / data.count,
      subject: data.subject
    }));
    
    // Sort to find strengths and weaknesses
    const sortedTopics = [...topicAverages].sort((a, b) => b.averageScore - a.averageScore);
    
    const strengths = sortedTopics.slice(0, 2);
    const weaknesses = sortedTopics.reverse().slice(0, 2);
    
    // Use OpenAI to generate personalized insights
    const prompt = `
      Generate learning insights for a ${childAge}-year-old student named ${childName} in ${keyStage} based on their recent learning activities.
      
      Recent performance:
      - Math average score: ${avgMathScore.toFixed(1)}%
      - English average score: ${avgEnglishScore.toFixed(1)}%
      - Strengths: ${strengths.map(s => `${s.topic} (${s.subject}, ${s.averageScore.toFixed(1)}%)`).join(', ')}
      - Areas for improvement: ${weaknesses.map(w => `${w.topic} (${w.subject}, ${w.averageScore.toFixed(1)}%)`).join(', ')}
      
      Please provide:
      1. Two specific strengths with detailed explanations (limit 20 words each)
      2. Two specific areas to improve with detailed explanations (limit 20 words each)
      3. Two recommended learning activities with brief descriptions and difficulty levels (easy/medium/hard)
      4. One personalized tutor tip related to their current progress
      
      Format the response as a JSON object with the following structure:
      {
        "strengths": [
          {"area": "Topic", "subject": "English or Maths", "description": "Explanation of strength"},
          {"area": "Topic", "subject": "English or Maths", "description": "Explanation of strength"}
        ],
        "weaknesses": [
          {"area": "Topic", "subject": "English or Maths", "description": "Explanation of area to improve"},
          {"area": "Topic", "subject": "English or Maths", "description": "Explanation of area to improve"}
        ],
        "recommendedActivities": [
          {"title": "Activity Title", "subject": "English or Maths", "description": "Brief description", "difficulty": "easy/medium/hard", "estimatedTime": time in minutes},
          {"title": "Activity Title", "subject": "English or Maths", "description": "Brief description", "difficulty": "easy/medium/hard", "estimatedTime": time in minutes}
        ],
        "tutorTip": {
          "text": "Personalized tip text",
          "focusArea": "Specific focus area",
          "subject": "English or Maths (optional)"
        }
      }
    `;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an educational AI that analyzes learning data and provides personalized insights for young students.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    const insightsText = openAIData.choices[0].message.content;
    
    // Parse the JSON response from OpenAI
    const insights = JSON.parse(insightsText);
    
    // Store insights in Supabase
    
    // 1. Delete previous insights for this child (to avoid accumulation)
    await fetch(
      `${supabaseUrl}/rest/v1/learning_insights?child_id=eq.${childId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
      }
    );
    
    // 2. Store new strengths
    for (const strength of insights.strengths) {
      await fetch(
        `${supabaseUrl}/rest/v1/learning_insights`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            child_id: childId,
            area: strength.area,
            subject: strength.subject,
            description: strength.description,
            type: 'strength'
          }),
        }
      );
    }
    
    // 3. Store new weaknesses
    for (const weakness of insights.weaknesses) {
      await fetch(
        `${supabaseUrl}/rest/v1/learning_insights`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            child_id: childId,
            area: weakness.area,
            subject: weakness.subject,
            description: weakness.description,
            type: 'weakness'
          }),
        }
      );
    }
    
    // 4. Delete previous recommended activities
    await fetch(
      `${supabaseUrl}/rest/v1/recommended_activities?child_id=eq.${childId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
      }
    );
    
    // 5. Store new recommended activities
    for (const activity of insights.recommendedActivities) {
      await fetch(
        `${supabaseUrl}/rest/v1/recommended_activities`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            child_id: childId,
            title: activity.title,
            subject: activity.subject,
            description: activity.description,
            difficulty: activity.difficulty,
            estimated_time: activity.estimatedTime,
            focus_area: activity.title.split(' ')[0], // Simple extraction of focus area
          }),
        }
      );
    }
    
    // 6. Store AI tutor tip
    await fetch(
      `${supabaseUrl}/rest/v1/ai_tutor_tips?child_id=eq.${childId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
      }
    );
    
    await fetch(
      `${supabaseUrl}/rest/v1/ai_tutor_tips`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          child_id: childId,
          text: insights.tutorTip.text,
          focus_area: insights.tutorTip.focusArea,
          subject: insights.tutorTip.subject
        }),
      }
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Learning insights generated and stored successfully',
        insights
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in generate-learning-insights function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
