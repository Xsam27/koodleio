
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Subject } from "@/types";
import { Difficulty } from "@/services/gamificationService";

export interface RecommendedActivity {
  id: string;
  title: string;
  subject: Subject;
  description: string;
  difficulty: Difficulty;
  estimatedTime: number;
  completionBadge?: string;
  score?: number;
  user_id?: string;
  child_id?: string;
  created_at?: string;
}

export interface NextBadgeProgress {
  badge: {
    id: string;
    name: string;
    description: string;
    image_url?: string;
    subject?: Subject | 'General';
    level: number;
  };
  progress: number;
  requiredValue: number;
}

// Fetch recommended activities for a child
export const fetchRecommendedActivities = async (childId: string): Promise<RecommendedActivity[]> => {
  try {
    const { data, error } = await supabase
      .from('recommended_activities')
      .select('*')
      .eq('child_id', childId)
      .order('score', { ascending: false })
      .limit(3);
    
    if (error) throw error;
    return data as RecommendedActivity[] || [];
  } catch (error: any) {
    console.error('Error fetching recommended activities:', error);
    toast({
      title: "Error fetching recommendations",
      description: error.message,
      variant: "destructive"
    });
    return [];
  }
};

// Fetch next badge to unlock
export const fetchNextBadgeToUnlock = async (childId: string): Promise<NextBadgeProgress | null> => {
  try {
    // Get all earned badges for this child
    const { data: earnedBadges, error: badgeError } = await supabase
      .from('earned_badges')
      .select('badge_id')
      .eq('child_id', childId);
    
    if (badgeError) throw badgeError;
    
    // Get all badge types
    const { data: allBadges, error: allBadgesError } = await supabase
      .from('badge_types')
      .select('*')
      .order('required_value', { ascending: true });
    
    if (allBadgesError) throw allBadgesError;
    
    // Filter out badges the child already has
    const earnedBadgeIds = earnedBadges?.map(eb => eb.badge_id) || [];
    const unearnedBadges = allBadges?.filter(badge => !earnedBadgeIds.includes(badge.id)) || [];
    
    if (unearnedBadges.length === 0) {
      return null; // All badges unlocked
    }
    
    // Get child's stats for progress calculation
    const { data: childLevel, error: childLevelError } = await supabase
      .from('child_levels')
      .select('*')
      .eq('child_id', childId)
      .single();
    
    if (childLevelError && childLevelError.code !== 'PGRST116') throw childLevelError;
    
    // Find the next badge to unlock (the one with lowest requirements not yet earned)
    const nextBadge = unearnedBadges[0];
    
    // Calculate progress based on badge requirement type
    let progress = 0;
    
    if (nextBadge && childLevel) {
      switch (nextBadge.required_achievement) {
        case 'total_stars':
          progress = childLevel.total_stars || 0;
          break;
        case 'streak_days':
          progress = childLevel.streak_days || 0;
          break;
        case 'subject_activities':
          // For subject-specific activities, we'd need to count completed activities
          // This is a simplified version
          if (nextBadge.subject === 'English') {
            progress = childLevel.english_level || 0;
          } else if (nextBadge.subject === 'Maths') {
            progress = childLevel.maths_level || 0;
          }
          break;
        default:
          progress = 0;
      }
      
      return {
        badge: nextBadge,
        progress: progress,
        requiredValue: nextBadge.required_value
      };
    }
    
    return null;
  } catch (error: any) {
    console.error('Error fetching next badge to unlock:', error);
    return null;
  }
};
