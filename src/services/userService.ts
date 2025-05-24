
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'admin';
  grade_level?: number;
}

export interface ChildProfile extends UserProfile {
  parent_id?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  awarded_at?: string;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  read: boolean;
  created_at: string;
}

// Fetch current user profile
export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: authUser } = await supabase.auth.getUser();
    
    if (!authUser || !authUser.user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Fetch child profiles for a parent
export const fetchChildProfiles = async (parentId: string): Promise<ChildProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('parent_child_relationships')
      .select(`
        child:child_id (
          id,
          name,
          email,
          role,
          grade_level
        )
      `)
      .eq('parent_id', parentId);
    
    if (error) throw error;
    
    // Extract the child data from the nested structure
    return data.map(item => ({ ...item.child, parent_id: parentId })) || [];
  } catch (error) {
    console.error('Error fetching child profiles:', error);
    toast({
      title: "Error fetching child profiles",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return [];
  }
};

// Add a child to a parent
export const addChildToParent = async (parentId: string, childEmail: string): Promise<boolean> => {
  try {
    // First check if the child exists
    const { data: childData, error: childError } = await supabase
      .from('users')
      .select('id')
      .eq('email', childEmail)
      .eq('role', 'student')
      .single();
    
    if (childError || !childData) {
      toast({
        title: "User not found",
        description: "No student account found with that email address.",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if relationship already exists
    const { data: existingRel, error: relError } = await supabase
      .from('parent_child_relationships')
      .select('id')
      .eq('parent_id', parentId)
      .eq('child_id', childData.id)
      .maybeSingle();
    
    if (relError && relError.code !== 'PGRST116') throw relError;
    
    if (existingRel) {
      toast({
        title: "Already connected",
        description: "This child is already connected to your account.",
      });
      return true;
    }
    
    // Create relationship
    const { error } = await supabase
      .from('parent_child_relationships')
      .insert({
        parent_id: parentId,
        child_id: childData.id
      });
    
    if (error) throw error;
    
    toast({
      title: "Child added",
      description: "The student has been successfully linked to your account.",
    });
    
    return true;
  } catch (error) {
    console.error('Error adding child to parent:', error);
    toast({
      title: "Error adding child",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return false;
  }
};

// Remove a child from a parent
export const removeChildFromParent = async (parentId: string, childId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('parent_child_relationships')
      .delete()
      .eq('parent_id', parentId)
      .eq('child_id', childId);
    
    if (error) throw error;
    
    toast({
      title: "Child removed",
      description: "The student has been unlinked from your account.",
    });
    
    return true;
  } catch (error) {
    console.error('Error removing child from parent:', error);
    toast({
      title: "Error removing child",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return false;
  }
};

// Fetch user badges
export const fetchUserBadges = async (userId: string): Promise<Badge[]> => {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        badge:badge_id (
          id,
          name,
          description,
          icon
        ),
        awarded_at
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return data.map(item => ({
      ...item.badge,
      awarded_at: item.awarded_at
    })) || [];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    toast({
      title: "Error fetching badges",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return [];
  }
};

// Fetch user streak
export const fetchUserStreak = async (userId: string): Promise<Streak | null> => {
  try {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user streak:', error);
    return null;
  }
};

// Fetch user notifications
export const fetchUserNotifications = async (userId: string, unreadOnly = false): Promise<Notification[]> => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (unreadOnly) {
      query = query.eq('read', false);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Schedule a reminder notification
export const scheduleReminder = async (
  userId: string, 
  title: string, 
  content: string, 
  scheduledFor: Date
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        content,
        type: 'reminder',
        read: false,
        scheduled_for: scheduledFor.toISOString()
      });
    
    if (error) throw error;
    
    toast({
      title: "Reminder scheduled",
      description: `Your reminder has been scheduled for ${scheduledFor.toLocaleString()}.`,
    });
    
    return true;
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    toast({
      title: "Error scheduling reminder",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return false;
  }
};
