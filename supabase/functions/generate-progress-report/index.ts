
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { userId, studentId } = await req.json();
    
    // Verify access rights (user must be the student or their parent)
    if (userId !== studentId) {
      // Check if user is parent of the student
      const { data: parentRelation, error: parentError } = await supabase
        .from('parent_child_relationships')
        .select('*')
        .eq('parent_id', userId)
        .eq('child_id', studentId)
        .single();
      
      if (parentError || !parentRelation) {
        return new Response(JSON.stringify({ error: "Unauthorized access" }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('*')
      .eq('id', studentId)
      .single();
    
    if (studentError || !student) {
      throw new Error("Student not found");
    }

    // Get lesson progress
    const { data: lessonProgress, error: progressError } = await supabase
      .from('lesson_progress')
      .select(`
        *,
        lesson:lesson_id (title, subject_id, grade_level),
        subject:lesson(subject:subject_id(title))
      `)
      .eq('user_id', studentId);
      
    if (progressError) {
      throw progressError;
    }
    
    // Get tutor interactions
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', studentId)
      .order('timestamp', { ascending: false })
      .limit(100);
      
    if (messagesError) {
      throw messagesError;
    }
    
    // Get badges
    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badge_id (name, description, icon)
      `)
      .eq('user_id', studentId);
    
    if (badgesError) {
      throw badgesError;
    }
    
    // Get streak data
    const { data: streak, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', studentId)
      .single();
    
    // Format report data
    const reportData = {
      student: {
        name: student.name,
        email: student.email,
        gradeLevel: student.grade_level,
      },
      progress: {
        lessonsCompleted: lessonProgress?.filter(p => p.completed).length || 0,
        totalLessons: lessonProgress?.length || 0,
        subjects: {} as Record<string, { total: number; completed: number; timeSpent: number }>,
        recentLessons: lessonProgress?.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        ).slice(0, 5),
      },
      interaction: {
        totalMessages: messages?.length || 0,
        messagesLast30Days: messages?.filter(m => 
          new Date(m.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length || 0,
        totalTimeSpent: lessonProgress?.reduce((total, curr) => total + (curr.time_spent || 0), 0) || 0,
      },
      achievements: {
        badgesEarned: badges?.length || 0,
        badges: badges || [],
        streak: streak || { current_streak: 0, longest_streak: 0 },
      },
      generatedAt: new Date().toISOString(),
    };
    
    // Process subjects data
    if (lessonProgress) {
      const subjects: Record<string, { total: number; completed: number; timeSpent: number }> = {};
      lessonProgress.forEach(progress => {
        const subjectTitle = progress.subject?.subject?.title || 'Unknown';
        if (!subjects[subjectTitle]) {
          subjects[subjectTitle] = {
            total: 0,
            completed: 0,
            timeSpent: 0
          };
        }
        subjects[subjectTitle].total += 1;
        if (progress.completed) {
          subjects[subjectTitle].completed += 1;
        }
        subjects[subjectTitle].timeSpent += progress.time_spent || 0;
      });
      reportData.progress.subjects = subjects;
    }
    
    return new Response(JSON.stringify(reportData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error generating progress report:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
