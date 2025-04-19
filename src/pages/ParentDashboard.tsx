
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, UserCircle, BookOpen, BarChart3, Award, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChildProfile } from "@/types";

// Mock data for child profiles
const mockChildProfiles: ChildProfile[] = [
  {
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
  },
  {
    id: "2",
    name: "Jack",
    age: 10,
    keyStage: "KS2",
    avatarColor: "#33C3F0",
    progressData: {
      english: {
        overallScore: 72,
        topicsData: [
          { name: "Grammar", score: 68, totalActivities: 22, completedActivities: 15 },
          { name: "Comprehension", score: 75, totalActivities: 20, completedActivities: 15 },
          { name: "Spelling", score: 65, totalActivities: 25, completedActivities: 16 }
        ],
        recentLessons: [
          { id: "e2", title: "Using Punctuation", subject: "English", date: new Date("2023-04-14"), score: 70, duration: 25, topicsCovered: ["Grammar", "Writing"] }
        ],
        strengths: ["Reading comprehension", "Creative writing"],
        weaknesses: ["Spelling", "Grammar rules"]
      },
      maths: {
        overallScore: 68,
        topicsData: [
          { name: "Multiplication", score: 72, totalActivities: 30, completedActivities: 22 },
          { name: "Division", score: 65, totalActivities: 25, completedActivities: 16 },
          { name: "Fractions", score: 60, totalActivities: 20, completedActivities: 12 }
        ],
        recentLessons: [
          { id: "m2", title: "Fractions Basics", subject: "Maths", date: new Date("2023-04-15"), score: 65, duration: 30, topicsCovered: ["Fractions"] }
        ],
        strengths: ["Addition and subtraction", "Times tables up to 5"],
        weaknesses: ["Fractions", "Word problems"]
      },
      lastUpdated: new Date("2023-04-15")
    }
  }
];

const ParentDashboard = () => {
  const [profiles, setProfiles] = useState<ChildProfile[]>(mockChildProfiles);
  
  // Format date to display in a readable format
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isParent={true} />
      
      <main className="flex-1 py-8 px-6 bg-softgray/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Parent Dashboard</h1>
              <p className="text-neutralgray">Manage your children's learning journey</p>
            </div>
            <Button className="rounded-full hover-grow">
              <Link to="/add-profile" className="flex items-center gap-2">
                <PlusCircle size={18} />
                <span>Add Child Profile</span>
              </Link>
            </Button>
          </div>
          
          {/* Child Profiles Section */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserCircle size={20} />
              Child Profiles
            </h2>
            
            {profiles.length === 0 ? (
              <Card className="bg-white p-8 text-center">
                <CardContent className="pt-6">
                  <p className="text-neutralgray mb-4">No child profiles yet. Add your first profile to get started!</p>
                  <Button variant="outline" className="rounded-full hover-grow">
                    <Link to="/add-profile" className="flex items-center gap-2">
                      <PlusCircle size={18} />
                      <span>Add Child Profile</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                  <Card key={profile.id} className="hover-grow overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-brightpurple to-skyblue"></div>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className="h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: profile.avatarColor }}
                        >
                          {profile.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{profile.name}</h3>
                          <p className="text-sm text-neutralgray">
                            Age: {profile.age} • {profile.keyStage}
                          </p>
                        </div>
                      </div>
                      
                      {profile.progressData && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-softpurple/30 rounded-lg p-3 text-center">
                            <p className="text-xs text-neutralgray mb-1">English</p>
                            <p className="text-xl font-semibold">{profile.progressData.english.overallScore}%</p>
                          </div>
                          <div className="bg-softblue/30 rounded-lg p-3 text-center">
                            <p className="text-xs text-neutralgray mb-1">Maths</p>
                            <p className="text-xl font-semibold">{profile.progressData.maths.overallScore}%</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Link to={`/profile/${profile.id}`}>
                          <Button variant="outline" size="sm" className="rounded-full text-sm">
                            View Profile
                          </Button>
                        </Link>
                        <p className="text-xs text-neutralgray">
                          Last activity:{" "}
                          {profile.progressData
                            ? formatDate(profile.progressData.lastUpdated)
                            : "No activity yet"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add Profile Card */}
                <Card className="hover-grow border-dashed border-2 border-neutralgray/30 flex items-center justify-center min-h-[220px]">
                  <CardContent className="pt-6 text-center">
                    <Link to="/add-profile" className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-softpurple/30 flex items-center justify-center">
                        <PlusCircle size={28} className="text-primary" />
                      </div>
                      <span className="text-primary font-medium">Add Child Profile</span>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>
          
          {/* Weekly Summary Section */}
          {profiles.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Weekly Summary
              </h2>
              
              <Tabs defaultValue={profiles[0].id} className="w-full">
                <TabsList className="mb-4">
                  {profiles.map((profile) => (
                    <TabsTrigger key={profile.id} value={profile.id} className="rounded-full">
                      {profile.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {profiles.map((profile) => (
                  <TabsContent key={profile.id} value={profile.id}>
                    <Card>
                      <CardContent className="pt-6">
                        {profile.progressData ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* English Summary */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <BookOpen size={18} className="text-primary" />
                                  <h3 className="font-semibold">English Progress</h3>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span>Overall Score</span>
                                    <span className="font-medium">{profile.progressData.english.overallScore}%</span>
                                  </div>
                                  <div className="h-2 bg-softpurple/30 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-primary to-skyblue"
                                      style={{ width: `${profile.progressData.english.overallScore}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Award size={16} className="text-yellow-500" />
                                    <span className="text-sm font-medium">Strengths</span>
                                  </div>
                                  <ul className="list-disc list-inside text-sm text-neutralgray">
                                    {profile.progressData.english.strengths.map((strength, index) => (
                                      <li key={index}>{strength}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <div className="text-sm font-medium mb-2">Areas to Improve</div>
                                  <ul className="list-disc list-inside text-sm text-neutralgray">
                                    {profile.progressData.english.weaknesses.map((weakness, index) => (
                                      <li key={index}>{weakness}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              
                              {/* Maths Summary */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <BookOpen size={18} className="text-skyblue" />
                                  <h3 className="font-semibold">Maths Progress</h3>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span>Overall Score</span>
                                    <span className="font-medium">{profile.progressData.maths.overallScore}%</span>
                                  </div>
                                  <div className="h-2 bg-softblue/30 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-skyblue to-brightblue"
                                      style={{ width: `${profile.progressData.maths.overallScore}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Award size={16} className="text-yellow-500" />
                                    <span className="text-sm font-medium">Strengths</span>
                                  </div>
                                  <ul className="list-disc list-inside text-sm text-neutralgray">
                                    {profile.progressData.maths.strengths.map((strength, index) => (
                                      <li key={index}>{strength}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <div className="text-sm font-medium mb-2">Areas to Improve</div>
                                  <ul className="list-disc list-inside text-sm text-neutralgray">
                                    {profile.progressData.maths.weaknesses.map((weakness, index) => (
                                      <li key={index}>{weakness}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            
                            {/* Recent Lessons */}
                            <div>
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Star size={16} className="text-yellow-500" />
                                Recent Lessons
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...profile.progressData.english.recentLessons, ...profile.progressData.maths.recentLessons]
                                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                                  .slice(0, 4)
                                  .map((lesson) => (
                                    <div key={lesson.id} className="bg-white rounded-lg p-3 border border-muted shadow-sm">
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-sm">{lesson.title}</h4>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          lesson.subject === "English" ? "bg-softpurple" : "bg-softblue"
                                        }`}>
                                          {lesson.subject}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-xs text-neutralgray">
                                        <span>{formatDate(lesson.date)}</span>
                                        <span>Score: {lesson.score}%</span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-neutralgray mb-4">No activity data available yet.</p>
                            <p className="text-sm">Encourage {profile.name} to complete some lessons to see progress reports.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ParentDashboard;
