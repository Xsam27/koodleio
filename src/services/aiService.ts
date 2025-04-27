
import { supabase } from "@/integrations/supabase/client";

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
