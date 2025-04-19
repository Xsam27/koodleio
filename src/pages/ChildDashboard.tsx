
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Star, Award, Crown, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChildProfile } from "@/types";

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
        { id: "e1", title: "Letter Sounds", subject: "English", date: new Date("2023-04-15"), score: 90, duration: 15, topicsCovered: ["Phonics"] }
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
        { id: "m1", title: "Numbers 1-20", subject: "Maths", date: new Date("2023-04-16"), score: 95, duration: 20, topicsCovered: ["Counting"] }
      ],
      strengths: ["Number recognition", "Basic counting"],
      weaknesses: ["Subtraction"]
    },
    lastUpdated: new Date("2023-04-16")
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
          
          {/* Subject Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* English Card */}
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
                  <div className="mb-6">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">{profile.progressData.english.overallScore}%</span>
                    </div>
                    <div className="h-2.5 bg-softpurple/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-brightpurple"
                        style={{ width: `${profile.progressData.english.overallScore}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-neutralgray mb-6">
                  Continue learning about letters, words, reading, and writing!
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-softpurple py-1 px-3 rounded-full">
                    {profile.keyStage} English
                  </span>
                  <Link to="/lesson/english">
                    <Button className="rounded-full hover-grow">
                      <span className="flex items-center gap-1">
                        Start English
                        <ArrowRight size={16} />
                      </span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            {/* Maths Card */}
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
                  <div className="mb-6">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">{profile.progressData.maths.overallScore}%</span>
                    </div>
                    <div className="h-2.5 bg-softblue/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-skyblue to-brightblue"
                        style={{ width: `${profile.progressData.maths.overallScore}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-neutralgray mb-6">
                  Learn about numbers, shapes, counting, and simple math problems!
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-softblue py-1 px-3 rounded-full">
                    {profile.keyStage} Maths
                  </span>
                  <Link to="/lesson/maths">
                    <Button className="rounded-full hover-grow bg-skyblue hover:bg-brightblue">
                      <span className="flex items-center gap-1">
                        Start Maths
                        <ArrowRight size={16} />
                      </span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Achievements Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award size={20} className="text-yellow-500" />
              Your Achievements
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id}
                  className={`text-center p-4 hover-grow ${
                    !achievement.completed ? "opacity-50" : ""
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col items-center">
                      <div className={`
                        h-14 w-14 rounded-full flex items-center justify-center mb-3
                        ${achievement.completed ? "bg-yellow-100" : "bg-gray-100"}
                      `}>
                        {achievement.icon}
                      </div>
                      <p className="text-sm font-medium">{achievement.title}</p>
                      <p className="text-xs text-neutralgray mt-1">
                        {achievement.completed ? "Completed" : "Not yet earned"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
          
          {/* Recent Activity Section */}
          {profile.progressData && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                Recent Lessons
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...profile.progressData.english.recentLessons, ...profile.progressData.maths.recentLessons]
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .slice(0, 3)
                  .map((lesson) => (
                    <Card key={lesson.id} className="overflow-hidden hover-grow">
                      <div className={`h-2 ${
                        lesson.subject === "English" 
                          ? "bg-gradient-to-r from-brightpurple to-primary" 
                          : "bg-gradient-to-r from-skyblue to-brightblue"
                      }`}></div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium">{lesson.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            lesson.subject === "English" ? "bg-softpurple" : "bg-softblue"
                          }`}>
                            {lesson.subject}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Score</span>
                            <span>{lesson.score}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                lesson.subject === "English"
                                  ? "bg-primary"
                                  : "bg-skyblue"
                              }`}
                              style={{ width: `${lesson.score}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-neutralgray">
                          <span>
                            {lesson.date.toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short"
                            })}
                          </span>
                          <span>{lesson.duration} mins</span>
                          <span>{lesson.topicsCovered.join(", ")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChildDashboard;
