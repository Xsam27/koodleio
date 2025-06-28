
import { supabase } from "@/integrations/supabase/client";
import { EarnedBadge, StarRecord } from "@/services/gamificationService";

export const generateLearningInsights = async (
  childId: string,
  childName: string,
  childAge: number,
  keyStage: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-learning-insights', {
      body: {
        childId,
        childName,
        childAge,
        keyStage
      }
    });
    
    if (error) throw error;
    
    console.log("AI insights generated:", data);
    return true;
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return false;
  }
};

export interface TutorAIResponse {
  response: string;
  conversationId?: string;
  timestamp?: string;
  responseTime?: number;
  error?: string;
}

export interface ConversationMessage {
  message: string;
  response: string;
  timestamp: string;
}

// Generate a unique session ID for tracking conversation sessions
export const generateSessionId = (): string => {
  return crypto.randomUUID();
};

export const sendMessageToGeminiSocraticTutor = async (
  message: string,
  childInfo: {
    name: string;
    age?: number;
    keyStage?: string;
    recentStars?: StarRecord[];
    badges?: EarnedBadge[];
    streak?: number;
    subject?: string;
  },
  conversationHistory?: ConversationMessage[],
  lessonContext?: {
    lessonId: string;
    stepId: string;
    stepTitle: string;
    stepContent: string;
  },
  userId?: string,
  sessionId?: string
): Promise<TutorAIResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-socratic-tutor', {
      body: {
        message,
        childName: childInfo.name,
        childAge: childInfo.age || 7,
        keyStage: childInfo.keyStage || "KS1",
        subject: childInfo.subject || null,
        conversationHistory: conversationHistory || [],
        lessonContext: lessonContext || null,
        userId: userId || null,
        sessionId: sessionId || generateSessionId()
      }
    });
    
    if (error) throw error;
    
    return data as TutorAIResponse;
  } catch (error) {
    console.error("Error sending message to Gemini Socratic tutor:", error);
    return { 
      response: "I'm having trouble thinking right now. Can we try again in a moment?",
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Legacy function for backward compatibility
export const sendMessageToTutorAI = async (
  message: string,
  childInfo: {
    name: string;
    age?: number;
    keyStage?: string;
    recentStars?: StarRecord[];
    badges?: EarnedBadge[];
    streak?: number;
    subject?: string;
  }
): Promise<TutorAIResponse> => {
  return sendMessageToGeminiSocraticTutor(message, childInfo);
};

// Analytics functions for tutor conversations
export const getTutorAnalytics = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('tutor_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('conversation_date', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching tutor analytics:", error);
    return [];
  }
};

export const getConversationHistory = async (
  userId: string, 
  limit: number = 50
): Promise<ConversationMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('tutor_conversations')
      .select('user_message, ai_response, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data?.map(row => ({
      message: row.user_message,
      response: row.ai_response,
      timestamp: row.created_at
    })) || [];
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return [];
  }
};
