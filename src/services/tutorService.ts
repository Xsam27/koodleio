
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Subject } from "@/types";

// Rate limit tracking
const REQUEST_LIMIT = 10;
const REQUEST_INTERVAL = 60 * 1000; // 1 minute
const requestCounts: Record<string, { count: number, resetTime: number }> = {};

// Check if user has exceeded rate limit
const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  
  if (!requestCounts[userId]) {
    requestCounts[userId] = { count: 0, resetTime: now + REQUEST_INTERVAL };
  }
  
  // Reset counter if time elapsed
  if (now > requestCounts[userId].resetTime) {
    requestCounts[userId] = { count: 0, resetTime: now + REQUEST_INTERVAL };
  }
  
  // Increment counter
  requestCounts[userId].count++;
  
  // Check if limit exceeded
  return requestCounts[userId].count <= REQUEST_LIMIT;
};

export interface TutorResponse {
  response: string;
  error?: string;
}

export const askTutor = async (
  userId: string,
  question: string,
  subjectId?: string
): Promise<TutorResponse> => {
  try {
    // Check rate limit
    if (!checkRateLimit(userId)) {
      return { 
        response: "I'm sorry, you've asked too many questions too quickly. Please wait a moment before asking another question.",
        error: "Rate limit exceeded"
      };
    }

    const { data, error } = await supabase.functions.invoke('ask-tutor', {
      body: {
        userId,
        question,
        subjectId
      }
    });
    
    if (error) throw error;
    
    return data as TutorResponse;
  } catch (error) {
    console.error("Error asking tutor:", error);
    toast({
      title: "Error asking tutor",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive"
    });
    return { 
      response: "I'm sorry, I couldn't process your question right now. Please try again later.",
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export interface ProgressData {
  activity: string;
  score?: number;
  timeSpent?: number;
}

export const saveProgress = async (
  userId: string,
  data: ProgressData,
  subjectId?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('save-progress', {
      body: {
        userId,
        subjectId,
        activity: data.activity,
        score: data.score,
        timeSpent: data.timeSpent
      }
    });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error saving progress:", error);
    toast({
      title: "Error saving progress",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive"
    });
    return false;
  }
};

export const fetchUserMessages = async (
  userId: string,
  limit = 10
): Promise<{ message: string; response: string; timestamp: string }[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('message, response, timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast({
      title: "Error fetching message history",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive"
    });
    return [];
  }
};

export const fetchSubjects = async (gradeLevel?: number): Promise<{ id: string; title: string }[]> => {
  try {
    let query = supabase.from('subjects').select('id, title');
    
    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }
};
