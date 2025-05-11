
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChildProfile, Subject } from "@/types";
import ProgressSection from "@/components/dashboard/ProgressSection";
import StreakTracker from "@/components/dashboard/StreakTracker";
import DailyTasks from "@/components/dashboard/DailyTasks";
import LearningInsights from "@/components/dashboard/LearningInsights";
import LevelProgressCard from "@/components/dashboard/LevelProgressCard";
import BadgesDisplay from "@/components/dashboard/BadgesDisplay";
import StarsDisplay from "@/components/dashboard/StarsDisplay";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchChildLevel, 
  fetchEarnedBadgesForChild, 
  fetchStarsForChild,
  ChildLevel,
  EarnedBadge,
  StarRecord
} from "@/services/gamificationService";

// Mock data for active child profile
const activeProfile: ChildProfile = {
  id: "1",
  name: "Emma",
  age: 7,
  keyStage: "KS1",
  avatarColor: "#9b87f5",
  progressData: {
    english: {
      overallScore: 78,
      topicsData: [
        { name: "Phonics", score: 85, totalActivities: 20, completedActivities: 17 },
        { name: "Reading", score: 75, totalActivities: 18, completedActivities: 13 },
        { name: "Writing", score: 68, totalActivities: 15, completedActivities: 10 }
      ],
      recentLessons: [
        { id: "e1", title: "Letter Sounds", subject: "English", date: new Date("2023-04-15"), score: 90, duration: 15, topicsCovered: ["Phonics"] },
        { id: "e2", title: "Simple Sentences", subject: "English", date: new Date("2023-04-17"), score: 75, duration: 20, topicsCovered: ["Writing"] }
      ],
      strengths: ["Letter recognition", "Basic reading"],
      weaknesses: ["Writing complete sentences"]
    },
    maths: {
      overallScore: 82,
      topicsData: [
        { name: "Counting", score: 90, totalActivities: 25, completedActivities: 22 },
        { name: "Addition", score: 80, totalActivities: 20, completedActivities: 16 },
        { name: "Shapes", score: 75, totalActivities: 15, completedActivities: 11 }
      ],
      recentLessons: [
        { id: "m1", title: "Numbers 1-20", subject: "Maths", date: new Date("2023-04-16"), score: 95, duration: 20, topicsCovered: ["Counting"] },
        { id: "m2", title: "Basic Addition", subject: "Maths", date: new Date("2023-04-18"), score: 85, duration: 25, topicsCovered: ["Addition"] }
      ],
      strengths: ["Number recognition", "Basic counting"],
      weaknesses: ["Subtraction"]
    },
    lastUpdated: new Date("2023-04-18")
  }
};

// Mock achievements data
const achievements = [
  { id: "a1", title: "First Lesson", icon: <StarIcon className="text-yellow-500" />, completed: true },
  { id: "a2", title: "Math Superstar", icon: <Award className="text-yellow-500" />, completed: true },
  { id: "a3", title: "Reading Champion", icon: <Crown className="text-yellow-500" />, completed: false },
  { id: "a4", title: "Word Wizard", icon: <BookOpen className="text-yellow-500" />, completed: false },
  { id: "a5", title: "Number Genius", icon: <Brain className="text-yellow-500" />, completed: false },
];

// Mock data for daily tasks
const dailyTasks = [
  { 
    id: "t1", 
    title: "Practice Phonics", 
    subject: "English" as Subject, 
    completed: true, 
    duration: 10,
    topic: "Phonics",
    difficulty: "easy" as const
  },
  { 
    id: "t2", 
    title: "Addition Worksheet", 
    subject: "Maths" as Subject, 
    completed: true, 
    duration: 15,
    topic: "Addition",
    difficulty: "medium" as const
  },
  { 
    id: "t3", 
    title: "Reading Exercise", 
    subject: "English" as Subject, 
    completed: false, 
    duration: 20,
    topic: "Reading",
    difficulty: "medium" as const
  },
  { 
    id: "t4", 
    title: "Shapes Quiz", 
    subject: "Maths" as Subject, 
    completed: false, 
    duration: 15,
    topic: "Shapes",
    difficulty: "hard" as const
  },
];

// Mock insights data
const insights = [
  { 
    area: "Phonics", 
    subject: "English" as Subject, 
    description: "Great at recognizing letter sounds", 
    type: "strength" as const
  },
  { 
    area: "Counting", 
    subject: "Maths" as Subject, 
    description: "Strong with numbers up to 50", 
    type: "strength" as const
  },
  { 
    area: "Writing", 
    subject: "English" as Subject, 
    description: "Needs practice forming complete sentences", 
    type: "weakness" as const
  },
  { 
    area: "Subtraction", 
    subject: "Maths" as Subject, 
    description: "Could improve with taking away numbers", 
    type: "weakness" as const
  },
];

// Mock AI recommended activities
const recommendedActivities = [
  {
    id: "ra1",
    title: "Sentence Structure Practice",
    subject: "English" as Subject,
    description: "Learn how to form complete sentences with proper structure",
    difficulty: "medium" as const,
    estimatedTime: 15
  },
  {
    id: "ra2",
    title: "Subtraction with Pictures",
    subject: "Maths" as Subject,
    description: "Visual approach to subtraction using everyday objects",
    difficulty: "easy" as const,
    estimatedTime: 10
  }
];

// AI personalized tip
const aiTip = {
  text: "Based on your recent activities, I notice you're making great progress with letter sounds. Try applying these in your reading exercises for even better results!",
  focusArea: "Sentence Structure",
  subject: "English" as Subject
};

// Import missing icons
import { Award, Star as StarIcon, Crown } from "lucide-react";

const ChildDashboard = () => {
  const [profile] = useState<ChildProfile>(activeProfile);
  const [childLevel, setChildLevel] = useState<ChildLevel | null>(null);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [stars, setStars] = useState<StarRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Fetch user and gamification data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Check for logged in user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // For demonstration purposes, we'll use the profile.id as childId
        // In a real app, you'd fetch the active child profile
        const childId = profile.id;
        
        // Fetch gamification data
        const [levelData, badgesData, starsData] = await Promise.all([
          fetchChildLevel(childId),
          fetchEarnedBadgesForChild(childId),
          fetchStarsForChild(childId)
        ]);
        
        setChildLevel(levelData);
        setBadges(badgesData);
        setStars(starsData);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [profile.id]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-6 bg-softgray/30">
        <div className="container mx-auto">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-softpurple to-softblue rounded-2xl p-6 mb-8 shadow-md pop-in">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center text-white font-bold text-2xl float"
                style={{ backgroundColor: profile.avatarColor }}
              >
                {profile.name.charAt(0)}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Hi, {profile.name}!</h1>
                <p className="text-lg">
                  {childLevel ? `Level ${childLevel.current_level} ${childLevel.current_title}` : 'Ready to learn something new today?'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Daily Tasks */}
              <DailyTasks 
                tasks={dailyTasks} 
                date={new Date()} 
                tasksCompleted={2}
                totalTasks={4}
              />
              
              {/* Learning Insights - Now connected to Supabase */}
              <LearningInsights 
                childId={profile.id}
                isLoading={isLoading}
              />
              
              {/* Badges Display - New Component */}
              <BadgesDisplay 
                badges={badges}
                isLoading={isLoading}
              />
            </div>
            
            <div className="space-y-6">
              {/* Streak & Level */}
              <div className="space-y-6">
                <StreakTracker 
                  childLevel={childLevel}
                  isLoading={isLoading}
                />
                
                <LevelProgressCard 
                  childLevel={childLevel}
                  isLoading={isLoading}
                />
                
                <StarsDisplay 
                  stars={stars}
                  totalStars={childLevel?.total_stars || 0}
                  isLoading={isLoading}
                />
              </div>
              
              {/* Subject Cards */}
              <Card className="overflow-hidden hover-grow">
                <div className="h-3 bg-gradient-to-r from-brightpurple to-primary"></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-full bg-softpurple flex items-center justify-center">
                      <BookOpen size={28} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-1">English</h2>
                      <p className="text-sm text-neutralgray">
                        {profile.progressData?.english.topicsData.reduce(
                          (sum, topic) => sum + topic.completedActivities,
                          0
                        )}{" "}
                        activities completed
                      </p>
                    </div>
                  </div>
                  
                  {profile.progressData && (
                    <ProgressSection 
                      subject="english"
                      progress={profile.progressData.english}
                      keyStage={profile.keyStage}
                    />
                  )}
                  
                  <Link to="/lesson/english">
                    <Button className="w-full rounded-full hover-grow">
                      <span className="flex items-center gap-1">
                        Continue English
                        <ArrowRight size={16} />
                      </span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover-grow">
                <div className="h-3 bg-gradient-to-r from-skyblue to-brightblue"></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-full bg-softblue flex items-center justify-center">
                      <Brain size={28} className="text-skyblue" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-1">Maths</h2>
                      <p className="text-sm text-neutralgray">
                        {profile.progressData?.maths.topicsData.reduce(
                          (sum, topic) => sum + topic.completedActivities,
                          0
                        )}{" "}
                        activities completed
                      </p>
                    </div>
                  </div>
                  
                  {profile.progressData && (
                    <ProgressSection 
                      subject="maths"
                      progress={profile.progressData.maths}
                      keyStage={profile.keyStage}
                    />
                  )}
                  
                  <Link to="/lesson/maths">
                    <Button className="w-full rounded-full hover-grow bg-skyblue hover:bg-brightblue">
                      <span className="flex items-center gap-1">
                        Continue Maths
                        <ArrowRight size={16} />
                      </span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChildDashboard;
