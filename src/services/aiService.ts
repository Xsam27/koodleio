
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
  error?: string;
}

export interface ConversationMessage {
  message: string;
  response: string;
  timestamp: string;
}

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
  userId?: string
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
        userId: userId || null
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
