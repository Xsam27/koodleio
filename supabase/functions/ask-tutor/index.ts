
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

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
    const { userId, question, subjectId } = await req.json()

    if (!userId || !question) {
      throw new Error('Missing required fields: userId and/or question')
    }

    // Get the JWT from the authorization header
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw new Error('Missing authorization token')
    }

    // Get user information from Supabase
    const userResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/users?id=eq.${userId}`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
        'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data')
    }

    const userData = await userResponse.json()
    
    if (!userData.length) {
      throw new Error('User not found')
    }

    const user = userData[0]
    const gradeLevel = user.grade_level || 5 // Default to grade 5 if not specified

    // Fetch subject data if subjectId is provided
    let subjectData = null
    if (subjectId) {
      const subjectResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/subjects?id=eq.${subjectId}`, {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        },
      })

      if (subjectResponse.ok) {
        const subjects = await subjectResponse.json()
        if (subjects.length) {
          subjectData = subjects[0]
        }
      }
    }

    // Fetch past messages for context (last 5)
    const pastMessagesResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/messages?user_id=eq.${userId}&order=timestamp.desc&limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        },
      }
    )

    const pastMessages = pastMessagesResponse.ok ? await pastMessagesResponse.json() : []

    // Build the prompt based on grade level and subject
    let systemPrompt = `You are a friendly AI tutor for a student in Grade ${gradeLevel}.`
    
    // Add subject context if available
    if (subjectData) {
      systemPrompt += ` You are helping with ${subjectData.title}.`
      if (subjectData.content_outline) {
        systemPrompt += ` The curriculum covers: ${JSON.stringify(subjectData.content_outline)}.`
      }
    }
    
    // Add age-appropriate instructions
    if (gradeLevel <= 3) {
      systemPrompt += ` Explain concepts in a very simple and fun way. Use examples and emojis to make it engaging for a young child.`
    } else if (gradeLevel <= 8) {
      systemPrompt += ` Use clear examples and occasional emojis to make your explanations engaging.`
    } else {
      systemPrompt += ` Provide detailed explanations with relevant examples.`
    }

    // Build message history
    const messageHistory = pastMessages.map(msg => [
      { role: 'user', content: msg.message },
      { role: 'assistant', content: msg.response }
    ]).flat().reverse()

    // Call OpenAI API
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',  // Using the more affordable but capable model
        messages: [
          { role: 'system', content: systemPrompt },
          ...messageHistory,
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${openAIResponse.status}`)
    }

    const openAIData = await openAIResponse.json()
    const tutorResponse = openAIData.choices[0].message.content

    // Save the message and response in the database
    const insertResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
        'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: userId,
        message: question,
        response: tutorResponse,
        subject_id: subjectId || null,
      }),
    })

    if (!insertResponse.ok) {
      console.error('Failed to save message:', await insertResponse.text())
    }

    return new Response(JSON.stringify({ response: tutorResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in ask-tutor function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
