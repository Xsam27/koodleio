
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type TutorOptions = {
  tone?: 'friendly' | 'encouraging' | 'simplified';
  simplifiedMode?: boolean;
  lessonContext?: {
    lessonId: string;
    stepId: string;
    stepTitle: string;
    stepContent: string;
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get OpenAI API key 
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('Missing OpenAI API key');
    }

    // Parse request body
    const { userId, question, subjectId, options } = await req.json();

    if (!userId || !question) {
      throw new Error('Missing required fields: userId, question');
    }

    // Get user info for personalization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, grade_level')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
    }

    // Get subject info if provided
    let subjectInfo = null;
    if (subjectId) {
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('title, grade_level, content_outline')
        .eq('id', subjectId)
        .single();

      if (!subjectError && subjectData) {
        subjectInfo = subjectData;
      }
    }

    // Build the system prompt based on options
    let systemPrompt = `You are an AI tutor named Koodle, designed to help students learn effectively. 
Be concise but thorough in your responses.`;
    
    // Add personalization
    if (userData) {
      systemPrompt += `\nYou are assisting ${userData.name}, a student in grade ${userData.grade_level || 'school'}.`;
    }
    
    // Add subject context
    if (subjectInfo) {
      systemPrompt += `\nThe student is asking about ${subjectInfo.title} (Grade ${subjectInfo.grade_level}).`;
      
      if (subjectInfo.content_outline) {
        systemPrompt += `\nRelevant curriculum information: ${JSON.stringify(subjectInfo.content_outline)}`;
      }
    }
    
    // Add tone preferences
    if (options?.tone) {
      switch (options.tone) {
        case 'encouraging':
          systemPrompt += `\nUse an encouraging and supportive tone to boost the student's confidence. Offer praise for their efforts and guide them with positive reinforcement.`;
          break;
        case 'simplified':
          systemPrompt += `\nExplain concepts in simple terms, using analogies and examples appropriate for their grade level. Avoid complex terminology.`;
          break;
        case 'friendly':
        default:
          systemPrompt += `\nUse a friendly, conversational tone while remaining educational and informative.`;
          break;
      }
    }
    
    // Add "explain like I'm 5" mode
    if (options?.simplifiedMode) {
      systemPrompt += `\nVERY IMPORTANT: Explain everything as if teaching a 5-year-old, with extremely simple language, short sentences, and relatable examples.`;
    }
    
    // Add lesson context if available
    if (options?.lessonContext) {
      systemPrompt += `\n
The student is currently working on a lesson with the following details:
- Lesson Step: "${options.lessonContext.stepTitle}"
- Content: "${options.lessonContext.stepContent.substring(0, 500)}${options.lessonContext.stepContent.length > 500 ? '...' : ''}"

Tailor your response to this specific learning context.`;
    }
    
    // Create the messages array
    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: question
      }
    ];

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using upgraded model per requirements
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const openAIData = await openAIResponse.json();
    const response = openAIData.choices[0].message.content;

    // Store the message and response in the database
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        message: question,
        response: response,
        subject_id: subjectId || null,
        timestamp: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting message:', insertError);
      // Continue execution even if there's an error storing the message
    }

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ask-tutor function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
