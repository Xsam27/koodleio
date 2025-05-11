
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const { 
      message, 
      childName, 
      childAge = 7,
      keyStage = "KS1", 
      recentStars = [],
      badges = [], 
      streak = 0,
      subject = null
    } = await req.json()

    // Build the system prompt based on the child's data
    const systemPrompt = `You are a friendly, encouraging AI tutor named Astro for a ${childAge}-year-old child named ${childName} in ${keyStage}.
    
Current stats:
- Learning streak: ${streak} days
- Recent stars earned: ${recentStars.length} stars
- Badges earned: ${badges.length} badges
${badges.length > 0 ? `- Latest badge: ${badges[0].badge?.name}` : ''}
${subject ? `- Currently focused on: ${subject}` : ''}

Your role is to:
1. Be very encouraging and friendly, speaking at the appropriate level for the child's age.
2. Provide short, concise answers suitable for a young child's attention span.
3. When they ask about stars, badges, or their progress, give them specific information.
4. If they're stuck or need help, offer simple guidance and encouragement.
5. Always maintain a positive, supportive tone.
6. Be sure to occasionally praise their achievements (like their streak or recent stars).

Keep responses under 3 sentences unless they're asking for specific help.`

    console.log("System prompt:", systemPrompt)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: message 
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;
    
    return new Response(JSON.stringify({ 
      response: assistantMessage,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in tutor-ai-chat:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
