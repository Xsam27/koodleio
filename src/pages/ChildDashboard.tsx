
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChildProfile } from "@/types";
import ProgressSection from "@/components/dashboard/ProgressSection";
import StreakTracker from "@/components/dashboard/StreakTracker";
import DailyTasks from "@/components/dashboard/DailyTasks";
import LearningInsights from "@/components/dashboard/LearningInsights";
import LevelProgressCard from "@/components/dashboard/LevelProgressCard";

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
  { id: "a1", title: "First Lesson", icon: <Star className="text-yellow-500" />, completed: true },
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
    subject: "English", 
    completed: true, 
    duration: 10,
    topic: "Phonics",
    difficulty: "easy" 
  },
  { 
    id: "t2", 
    title: "Addition Worksheet", 
    subject: "Maths", 
    completed: true, 
    duration: 15,
    topic: "Addition",
    difficulty: "medium" 
  },
  { 
    id: "t3", 
    title: "Reading Exercise", 
    subject: "English", 
    completed: false, 
    duration: 20,
    topic: "Reading",
    difficulty: "medium" 
  },
  { 
    id: "t4", 
    title: "Shapes Quiz", 
    subject: "Maths", 
    completed: false, 
    duration: 15,
    topic: "Shapes",
    difficulty: "hard" 
  },
];

// Mock insights data
const insights = [
  { 
    area: "Phonics", 
    subject: "English", 
    description: "Great at recognizing letter sounds", 
    type: "strength" 
  },
  { 
    area: "Counting", 
    subject: "Maths", 
    description: "Strong with numbers up to 50", 
    type: "strength" 
  },
  { 
    area: "Writing", 
    subject: "English", 
    description: "Needs practice forming complete sentences", 
    type: "weakness" 
  },
  { 
    area: "Subtraction", 
    subject: "Maths", 
    description: "Could improve with taking away numbers", 
    type: "weakness" 
  },
];

// Import missing icons
import { Award, Star, Crown } from "lucide-react";

const ChildDashboard = () => {
  const [profile] = useState<ChildProfile>(activeProfile);
  
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
                <p className="text-lg">Ready to learn something new today?</p>
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
              
              {/* Learning Insights */}
              <LearningInsights insights={insights} />
            </div>
            
            <div className="space-y-6">
              {/* Streak & Level */}
              <div className="space-y-6">
                <StreakTracker 
                  currentStreak={5}
                  longestStreak={12}
                  totalStars={42}
                  totalBadges={3}
                  lastActive={new Date()}
                />
                
                <LevelProgressCard 
                  currentLevel={3}
                  levelName="Explorer"
                  progress={65}
                  pointsToNextLevel={45}
                  totalPoints={180}
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
