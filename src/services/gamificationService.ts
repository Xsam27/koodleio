
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Subject } from "@/types";

// Types for our gamification data
export interface StarRecord {
  id: string;
  child_id: string;
  activity_id: string;
  amount: number;
  subject: Subject;
  reason: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  subject?: Subject | 'General';
  level: number;
}

export interface EarnedBadge {
  id: string;
  child_id: string;
  badge_id: string;
  badge?: Badge;
  earned_at: string;
}

export interface ChildLevel {
  id: string;
  child_id: string;
  current_level: number;
  current_title: string;
  total_stars: number;
  total_badges: number;
  english_level: number;
  maths_level: number;
  streak_days: number;
  longest_streak: number;
  last_activity_date?: string;
  updated_at: string;
}

// Difficulty type used throughout the application
export type Difficulty = 'easy' | 'medium' | 'hard';

// Helper function to convert numeric difficulty to string type
export function convertDifficultyToString(difficulty: number): Difficulty {
  switch(difficulty) {
    case 1:
      return 'easy';
    case 2:
      return 'medium';
    case 3:
    default:
      return 'hard';
  }
}

// Fetch stars for a specific child
export const fetchStarsForChild = async (childId: string): Promise<StarRecord[]> => {
  try {
    // Using 'any' type since we can't modify the Database types
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching stars:', error);
    toast({
      title: "Error fetching stars",
      description: error.message,
      variant: "destructive"
    });
    return [];
  }
};

// Fetch badges for a specific child
export const fetchEarnedBadgesForChild = async (childId: string): Promise<EarnedBadge[]> => {
  try {
    const { data, error } = await supabase
      .from('earned_badges')
      .select(`
        id,
        child_id,
        badge_id,
        earned_at,
        badge:badge_id(id, name, description, image_url, subject, level)
      `)
      .eq('child_id', childId)
      .order('earned_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching badges:', error);
    toast({
      title: "Error fetching badges",
      description: error.message,
      variant: "destructive"
    });
    return [];
  }
};

// Fetch level information for a specific child
export const fetchChildLevel = async (childId: string): Promise<ChildLevel | null> => {
  try {
    const { data, error } = await supabase
      .from('child_levels')
      .select('*')
      .eq('child_id', childId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is the "no rows returned" error
    return data;
  } catch (error: any) {
    console.error('Error fetching child level:', error);
    toast({
      title: "Error fetching level data",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};

// Award stars to a child for completing an activity
export const awardStarsToChild = async (
  childId: string, 
  activityId: string,
  amount: number,
  subject: Subject,
  reason: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('stars')
      .insert([
        {
          child_id: childId,
          activity_id: activityId,
          amount,
          subject,
          reason
        }
      ]);
    
    if (error) throw error;
    
    toast({
      title: "Stars Earned!",
      description: `You've earned ${amount} stars!`,
      variant: "default",
      className: "bg-yellow-100 border-yellow-300"
    });
    
    return true;
  } catch (error: any) {
    console.error('Error awarding stars:', error);
    toast({
      title: "Error awarding stars",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

// Check achievements and award badges
export const checkAndAwardBadges = async (childId: string): Promise<void> => {
  try {
    // Get child's current stats
    const [childLevel, stars, earnedBadges] = await Promise.all([
      fetchChildLevel(childId),
      fetchStarsForChild(childId),
      fetchEarnedBadgesForChild(childId)
    ]);

    if (!childLevel) return;
    
    // Get all badge types that haven't been earned yet
    const { data: availableBadges, error: badgeError } = await supabase
      .from('badge_types')
      .select('*');
    
    if (badgeError) throw badgeError;
    
    // Filter out already earned badges
    const earnedBadgeIds = earnedBadges.map(eb => eb.badge_id);
    const unearnedBadges = availableBadges?.filter(badge => !earnedBadgeIds.includes(badge.id)) || [];
    
    // Check each badge's requirements
    for (const badge of unearnedBadges) {
      let requirementMet = false;
      
      switch (badge.required_achievement) {
        case 'total_stars':
          requirementMet = childLevel.total_stars >= badge.required_value;
          break;
        case 'activities_completed':
          // Would need to check actual activity completion count
          // This is simplified for this example
          requirementMet = stars.length >= badge.required_value;
          break;
        case 'streak_days':
          requirementMet = childLevel.streak_days >= badge.required_value;
          break;
        case 'perfect_score':
          // Would need to check for 100% scores
          // This is simplified for this example
          const perfectScores = stars.filter(s => s.reason.includes('perfect score')).length;
          requirementMet = perfectScores >= badge.required_value;
          break;
        case 'subject_activities':
          // Would need to filter by subject
          // This is simplified for this example
          const mathStars = stars.filter(s => s.subject === 'Maths').length;
          const englishStars = stars.filter(s => s.subject === 'English').length;
          
          if (badge.subject === 'Maths') {
            requirementMet = mathStars >= badge.required_value;
          } else if (badge.subject === 'English') {
            requirementMet = englishStars >= badge.required_value;
          }
          break;
      }
      
      // Award badge if requirement is met
      if (requirementMet) {
        await supabase.from('earned_badges').insert({
          child_id: childId,
          badge_id: badge.id
        });
        
        toast({
          title: "New Badge Earned!",
          description: `Congratulations! You've earned the "${badge.name}" badge!`,
          variant: "default",
          className: "bg-purple-100 border-purple-300"
        });
      }
    }
  } catch (error: any) {
    console.error('Error checking achievements:', error);
  }
};

// Update child's learning streak
export const updateLearningStreak = async (childId: string): Promise<void> => {
  try {
    // Fetch current streak data
    const { data: streakData, error: streakError } = await supabase
      .from('child_levels')
      .select('streak_days, longest_streak, last_activity_date')
      .eq('child_id', childId)
      .single();
    
    if (streakError && streakError.code !== 'PGRST116') throw streakError;
    
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    let newStreak = 1;
    let newLongestStreak = streakData?.longest_streak || 0;
    
    // If there's existing streak data
    if (streakData) {
      const lastActivityDate = streakData.last_activity_date ? 
        new Date(streakData.last_activity_date).toISOString().split('T')[0] : 
        null;
      
      // Check if activity was already recorded today
      if (lastActivityDate === today) {
        // Already recorded today, no streak change
        return;
      }
      
      // Check if it's consecutive with the last activity (yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastActivityDate === yesterdayStr) {
        // Activity was yesterday, increase streak
        newStreak = (streakData.streak_days || 0) + 1;
      }
      
      // Update longest streak if current streak is longer
      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
      }
    }
    
    // Update or insert streak data
    const { error: updateError } = await supabase
      .from('child_levels')
      .upsert({
        child_id: childId,
        streak_days: newStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today
      }, {
        onConflict: 'child_id'
      });
    
    if (updateError) throw updateError;
    
    // If streak reached certain milestone, show toast
    if (newStreak === 3 || newStreak === 7 || newStreak === 14 || newStreak === 30) {
      toast({
        title: "Streak Milestone!",
        description: `Amazing! You've maintained a ${newStreak}-day learning streak!`,
        variant: "default",
        className: "bg-blue-100 border-blue-300"
      });
    }
  } catch (error: any) {
    console.error('Error updating learning streak:', error);
  }
};

// Complete a learning activity and process all rewards
export const completeActivity = async (
  childId: string,
  userId: string,
  activityId: string,
  subject: Subject,
  score: number,
  timeTaken: number,
  topic: string,
  difficulty: Difficulty
): Promise<void> => {
  try {
    // 1. Save activity result
    const { error: activityError } = await supabase
      .from('activity_results')
      .insert({
        user_id: userId,
        child_id: childId,
        activity_id: activityId,
        subject,
        score,
        time_taken: timeTaken,
        topic,
        difficulty
      });
    
    if (activityError) throw activityError;
    
    // 2. Award stars based on score
    let starsAwarded = 0;
    let reason = '';
    
    if (score >= 90) {
      starsAwarded = 5;
      reason = 'Excellent score';
    } else if (score >= 75) {
      starsAwarded = 4;
      reason = 'Great score';
    } else if (score >= 60) {
      starsAwarded = 3;
      reason = 'Good score';
    } else if (score >= 40) {
      starsAwarded = 2;
      reason = 'Decent effort';
    } else {
      starsAwarded = 1;
      reason = 'Completion';
    }
    
    // Perfect score bonus
    if (score === 100) {
      reason = 'perfect score';
    }
    
    await awardStarsToChild(childId, activityId, starsAwarded, subject, reason);
    
    // 3. Update streak
    await updateLearningStreak(childId);
    
    // 4. Check for badge awards
    await checkAndAwardBadges(childId);
    
  } catch (error: any) {
    console.error('Error completing activity:', error);
    toast({
      title: "Error saving activity results",
      description: error.message,
      variant: "destructive"
    });
  }
};

// Function to fetch learning insights from Supabase
export const fetchLearningInsights = async (childId: string) => {
  try {
    const { data: strengths, error: strengthsError } = await supabase
      .from('learning_insights')
      .select('*')
      .eq('child_id', childId)
      .eq('type', 'strength')
      .order('created_at', { ascending: false })
      .limit(10);
    
    const { data: weaknesses, error: weaknessesError } = await supabase
      .from('learning_insights')
      .select('*')
      .eq('child_id', childId)
      .eq('type', 'weakness')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (strengthsError) throw strengthsError;
    if (weaknessesError) throw weaknessesError;
    
    return { strengths: strengths || [], weaknesses: weaknesses || [] };
  } catch (error: any) {
    console.error('Error fetching learning insights:', error);
    return { strengths: [], weaknesses: [] };
  }
};

// Function to fetch recommended activities from Supabase
export const fetchRecommendedActivities = async (childId: string) => {
  try {
    const { data, error } = await supabase
      .from('recommended_activities')
      .select('*')
      .eq('child_id', childId)
      .eq('completed', false)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching recommended activities:', error);
    return [];
  }
};

// Function to fetch AI tutor tips from Supabase
export const fetchAITutorTip = async (childId: string) => {
  try {
    const { data, error } = await supabase
      .from('ai_tutor_tips')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error: any) {
    console.error('Error fetching AI tutor tip:', error);
    return null;
  }
};
