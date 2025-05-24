
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface LessonStep {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'quiz' | 'interactive';
  media?: string;
  quizQuestions?: {
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
  }[];
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  subject_id: string;
  grade_level: number;
  estimated_duration?: number;
  steps: LessonStep[];
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id?: string;
  user_id: string;
  lesson_id: string;
  current_step: number;
  completed: boolean;
  score?: number;
  time_spent?: number;
  last_accessed: string;
}

// Fetch available lessons
export const fetchLessons = async (subjectId?: string, gradeLevel?: number): Promise<Lesson[]> => {
  try {
    let query = supabase.from('lessons').select('*');
    
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    
    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    toast({
      title: "Error fetching lessons",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return [];
  }
};

// Fetch a single lesson by ID
export const fetchLesson = async (lessonId: string): Promise<Lesson | null> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        subject:subject_id(title)
      `)
      .eq('id', lessonId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    toast({
      title: "Error fetching lesson",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return null;
  }
};

// Create a new lesson
export const createLesson = async (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .insert(lesson)
      .select('id')
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Lesson created",
      description: `"${lesson.title}" has been created successfully.`,
    });
    
    return data?.id || null;
  } catch (error) {
    console.error('Error creating lesson:', error);
    toast({
      title: "Error creating lesson",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return null;
  }
};

// Update an existing lesson
export const updateLesson = async (id: string, updates: Partial<Lesson>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lessons')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
    
    toast({
      title: "Lesson updated",
      description: "The lesson has been updated successfully."
    });
    
    return true;
  } catch (error) {
    console.error('Error updating lesson:', error);
    toast({
      title: "Error updating lesson",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return false;
  }
};

// Delete a lesson
export const deleteLesson = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast({
      title: "Lesson deleted",
      description: "The lesson has been deleted successfully."
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting lesson:', error);
    toast({
      title: "Error deleting lesson",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return false;
  }
};

// Fetch lesson progress for a user
export const fetchLessonProgress = async (userId: string, lessonId?: string): Promise<LessonProgress[]> => {
  try {
    let query = supabase
      .from('lesson_progress')
      .select(`
        *,
        lesson:lesson_id (title, subject_id, steps, grade_level)
      `)
      .eq('user_id', userId);
    
    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    toast({
      title: "Error fetching progress",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return [];
  }
};

// Update lesson progress
export const updateLessonProgress = async (
  userId: string, 
  lessonId: string, 
  progress: Partial<LessonProgress>
): Promise<boolean> => {
  try {
    // Check if progress record exists
    const { data: existingProgress, error: fetchError } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    
    if (existingProgress) {
      // Update existing record
      const { error } = await supabase
        .from('lesson_progress')
        .update({
          ...progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id);
      
      if (error) throw error;
    } else {
      // Create new record
      const { error } = await supabase
        .from('lesson_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          current_step: progress.current_step || 0,
          completed: progress.completed || false,
          score: progress.score,
          time_spent: progress.time_spent || 0,
          last_accessed: new Date().toISOString()
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    toast({
      title: "Error updating progress",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return false;
  }
};

// Generate a progress report for a user
export const generateProgressReport = async (userId: string, studentId: string): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-progress-report', {
      body: { userId, studentId }
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error generating progress report:', error);
    toast({
      title: "Error generating report",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return null;
  }
};
