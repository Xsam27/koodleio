
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
    const { userId, subjectId, activity, score, timeSpent } = await req.json()

    if (!userId || !activity) {
      throw new Error('Missing required fields: userId and activity')
    }

    // Get the JWT from the authorization header
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw new Error('Missing authorization token')
    }

    // Update user preferences with activity progress
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
    const preferences = user.preferences || {}
    
    // Update progress data
    if (!preferences.progress) {
      preferences.progress = {}
    }
    
    if (!preferences.progress[subjectId || 'general']) {
      preferences.progress[subjectId || 'general'] = {
        activities: [],
        totalScore: 0,
        totalTimeSpent: 0,
      }
    }
    
    const subjectProgress = preferences.progress[subjectId || 'general']
    
    // Add activity
    subjectProgress.activities.push({
      activity,
      score: score || 0,
      timeSpent: timeSpent || 0,
      timestamp: new Date().toISOString(),
    })
    
    // Update totals
    subjectProgress.totalScore = (subjectProgress.totalScore || 0) + (score || 0)
    subjectProgress.totalTimeSpent = (subjectProgress.totalTimeSpent || 0) + (timeSpent || 0)
    
    // Update user preferences
    const updateResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
        'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        preferences: preferences,
        updated_at: new Date().toISOString(),
      }),
    })

    if (!updateResponse.ok) {
      throw new Error('Failed to update user progress')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in save-progress function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
