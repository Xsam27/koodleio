
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { 
      message, 
      childName, 
      childAge, 
      keyStage, 
      subject, 
      conversationHistory,
      lessonContext,
      userId 
    } = await req.json();

    // Create Socratic tutoring prompt
    const socraticPrompt = `You are Astro, a Socratic AI tutor for ${childName}, age ${childAge}, studying ${keyStage} level.

CORE PRINCIPLES:
- Use the Socratic method: guide learning through questions, don't give direct answers
- Be encouraging, patient, and age-appropriate
- Break complex problems into smaller, manageable steps
- Use analogies and examples suitable for a ${childAge}-year-old
- Celebrate thinking process, not just correct answers

CONVERSATION CONTEXT:
Subject: ${subject || 'General learning'}
${lessonContext ? `Current lesson: ${lessonContext.stepTitle} - ${lessonContext.stepContent}` : ''}

SOCRATIC APPROACH:
1. Ask guiding questions that help the child discover the answer
2. If they're stuck, provide a smaller hint or ask a simpler question
3. Encourage them to explain their thinking
4. Use "What do you think would happen if...?" type questions
5. Connect new learning to things they already know

RESPONSE GUIDELINES:
- Keep responses to 2-3 sentences maximum
- Use encouraging language: "Great thinking!", "That's an interesting idea!", "Let's explore that together!"
- If they make an error, ask questions to help them self-correct
- Use emojis sparingly but appropriately for their age
- Never give the complete answer directly - guide them to discover it

Student's message: "${message}"

Previous conversation context: ${conversationHistory ? JSON.stringify(conversationHistory.slice(-4)) : 'None'}

Respond as Astro using the Socratic method:`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: socraticPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const response = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                    "I'm having trouble thinking right now. Can you ask me that again?";

    // Store the conversation in Supabase if userId is provided
    if (userId) {
      try {
        await supabase
          .from('tutor_conversations')
          .insert({
            user_id: userId,
            child_name: childName,
            user_message: message,
            ai_response: response,
            subject: subject,
            key_stage: keyStage,
            lesson_context: lessonContext,
            created_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error storing conversation:', error);
        // Don't fail the request if storage fails
      }
    }

    console.log('Gemini Socratic Response:', response);

    return new Response(
      JSON.stringify({ 
        response,
        conversationId: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in gemini-socratic-tutor function:', error);
    
    return new Response(
      JSON.stringify({ 
        response: "I'm having a little trouble thinking right now. Can we try again in a moment?",
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
