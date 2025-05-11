
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
  error?: string;
}

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
  try {
    const { data, error } = await supabase.functions.invoke('tutor-ai-chat', {
      body: {
        message,
        childName: childInfo.name,
        childAge: childInfo.age || 7,
        keyStage: childInfo.keyStage || "KS1",
        recentStars: childInfo.recentStars || [],
        badges: childInfo.badges || [],
        streak: childInfo.streak || 0,
        subject: childInfo.subject || null
      }
    });
    
    if (error) throw error;
    
    return data as TutorAIResponse;
  } catch (error) {
    console.error("Error sending message to tutor AI:", error);
    return { 
      response: "Sorry, I'm having trouble thinking right now. Can we try again in a moment?",
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
