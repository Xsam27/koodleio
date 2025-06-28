
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Download, BookOpen, MessageSquare, Award, ChartBar } from 'lucide-react';
import { fetchLessonProgress, LessonProgress } from '@/services/lessonService';
import { fetchUserMessages } from '@/services/tutorService';
import { fetchUserBadges, fetchUserStreak } from '@/services/userService';
import { generateProgressReport } from '@/services/tutorService';
import LevelProgressCard from '@/components/dashboard/LevelProgressCard';
import BadgesDisplay from '@/components/dashboard/BadgesDisplay';
import StreakTracker from '@/components/dashboard/StreakTracker';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface StudentProgressDashboardProps {
  userId: string;
  studentId?: string; // If parent is viewing child's progress
  userName?: string;
}

// Define proper interface for subject progress data
interface SubjectProgressData {
  total: number;
  completed: number;
  timeSpent: number;
}

interface ProgressReportData {
  student: {
    name: string;
    email: string;
    gradeLevel: number;
  };
  progress: {
    lessonsCompleted: number;
    totalLessons: number;
    subjects: Record<string, SubjectProgressData>;
    recentLessons: any[];
  };
  interaction: {
    totalMessages: number;
    messagesLast30Days: number;
    totalTimeSpent: number;
  };
  achievements: {
    badgesEarned: number;
    badges: any[];
    streak: { current_streak: number; longest_streak: number };
  };
}

// Define interface for badges display
interface EarnedBadge {
  id: string;
  badge: {
    name: string;
    description: string;
    icon: string;
  };
  earned_at: string;
  badge_id: string;
  child_id: string;
}

// Define interface for subject data
interface SubjectCompletion {
  name: string;
  total: number;
  completed: number;
  timeSpent: number;
}

// Extended interface for lesson progress with nested data
interface ExtendedLessonProgress extends LessonProgress {
  lesson?: {
    title?: string;
    subject?: {
      title?: string;
    };
    subject_id?: string;
  };
}

const StudentProgressDashboard: React.FC<StudentProgressDashboardProps> = ({ 
  userId, 
  studentId,
  userName
}) => {
  const [loading, setLoading] = useState(true);
  const [lessonProgress, setLessonProgress] = useState<ExtendedLessonProgress[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // We'll use the studentId if provided (for parent view), otherwise use userId (for student view)
  const targetUserId = studentId || userId;
  const displayName = userName || 'Your';
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Fetch all data in parallel
        const [progressData, messagesData, badgesData, streakData] = await Promise.all([
          fetchLessonProgress(targetUserId),
          fetchUserMessages(targetUserId, 100),
          fetchUserBadges(targetUserId),
          fetchUserStreak(targetUserId),
        ]);
        
        setLessonProgress(progressData as ExtendedLessonProgress[]);
        setMessages(messagesData);
        setBadges(badgesData);
        setStreak(streakData);
      } catch (error) {
        console.error('Error loading student progress data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load progress data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [targetUserId]);
  
  const handleDownloadReport = async () => {
    setReportLoading(true);
    
    try {
      const reportData: ProgressReportData = await generateProgressReport(userId, targetUserId);
      if (!reportData) {
        throw new Error('Failed to generate report data');
      }
      
      // Create PDF using jsPDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Title
      doc.setFontSize(20);
      doc.text('Learning Progress Report', pageWidth / 2, 20, { align: 'center' });
      
      // Student info
      doc.setFontSize(14);
      doc.text(`Student: ${reportData.student.name}`, 20, 40);
      doc.text(`Grade Level: ${reportData.student.gradeLevel || 'Not specified'}`, 20, 50);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
      
      // Overview stats
      doc.setFontSize(16);
      doc.text('Learning Overview', 20, 80);
      
      doc.setFontSize(12);
      doc.text(`Lessons Completed: ${reportData.progress.lessonsCompleted} of ${reportData.progress.totalLessons}`, 30, 90);
      doc.text(`Questions Asked: ${reportData.interaction.totalMessages}`, 30, 100);
      doc.text(`Badges Earned: ${reportData.achievements.badgesEarned}`, 30, 110);
      doc.text(`Current Learning Streak: ${reportData.achievements.streak?.current_streak || 0} days`, 30, 120);
      doc.text(`Total Study Time: ${Math.round((reportData.interaction.totalTimeSpent || 0) / 60)} minutes`, 30, 130);
      
      // Subject breakdown
      doc.setFontSize(16);
      doc.text('Subject Progress', 20, 150);
      
      let yPos = 160;
      Object.entries(reportData.progress.subjects).forEach(([subject, data]: [string, SubjectProgressData]) => {
        const completionPercentage = data.total > 0 
          ? Math.round((data.completed / data.total) * 100) 
          : 0;
          
        doc.setFontSize(14);
        doc.text(`${subject}`, 30, yPos);
        
        doc.setFontSize(12);
        doc.text(`Completed: ${data.completed}/${data.total} (${completionPercentage}%)`, 40, yPos + 10);
        doc.text(`Time Spent: ${Math.round(data.timeSpent / 60)} minutes`, 40, yPos + 20);
        
        yPos += 30;
        
        // Add new page if we're running out of space
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // Add new page for badges
      doc.addPage();
      
      doc.setFontSize(16);
      doc.text('Achievements', 20, 20);
      
      if (reportData.achievements.badges.length > 0) {
        yPos = 30;
        
        reportData.achievements.badges.forEach((badge, index) => {
          doc.setFontSize(14);
          doc.text(`${index + 1}. ${badge.badge.name}`, 30, yPos);
          
          doc.setFontSize(12);
          doc.text(`${badge.badge.description}`, 40, yPos + 10);
          doc.text(`Earned on: ${new Date(badge.awarded_at).toLocaleDateString()}`, 40, yPos + 20);
          
          yPos += 30;
          
          // Add new page if we're running out of space
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }
        });
      } else {
        doc.setFontSize(12);
        doc.text('No badges earned yet.', 30, 30);
      }
      
      // Save the PDF
      const fileName = `progress_report_${reportData.student.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: 'Success',
        description: 'Progress report downloaded',
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: 'Error',
        description: 'Failed to download progress report',
        variant: 'destructive',
      });
    } finally {
      setReportLoading(false);
    }
  };
  
  // Calculate completion rates for subjects
  const subjectCompletion = React.useMemo(() => {
    const subjects: Record<string, SubjectCompletion> = {};
    
    lessonProgress.forEach(progress => {
      const subjectTitle = progress.lesson?.subject?.title || 'Unknown';
      
      if (!subjects[subjectTitle]) {
        subjects[subjectTitle] = {
          total: 0,
          completed: 0,
          name: subjectTitle,
          timeSpent: 0
        };
      }
      
      subjects[subjectTitle].total += 1;
      if (progress.completed) {
        subjects[subjectTitle].completed += 1;
      }
      subjects[subjectTitle].timeSpent += (progress.time_spent || 0);
    });
    
    return Object.values(subjects);
  }, [lessonProgress]);
  
  // Process message data for insights
  const messageData = React.useMemo(() => {
    // Group messages by date
    const messagesByDate: Record<string, number> = {};
    
    messages.forEach(msg => {
      const date = new Date(msg.timestamp).toISOString().split('T')[0];
      messagesByDate[date] = (messagesByDate[date] || 0) + 1;
    });
    
    // Last 7 days of activity
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      return {
        date: new Date(dateString).toLocaleDateString(undefined, { weekday: 'short' }),
        count: messagesByDate[dateString] || 0,
        fullDate: dateString
      };
    }).reverse();
    
    return last7Days;
  }, [messages]);
  
  if (loading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{displayName} Learning Progress</h2>
          <p className="text-muted-foreground">
            Track learning achievements and academic growth
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleDownloadReport} 
          disabled={reportLoading}
        >
          {reportLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download Report
        </Button>
      </div>
      
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Lessons Completed</p>
                <p className="text-2xl font-bold">
                  {lessonProgress.filter(p => p.completed).length}
                </p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Questions Asked</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-full">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
                <p className="text-2xl font-bold">{badges.length}</p>
              </div>
              <div className="bg-yellow-50 p-2 rounded-full">
                <Award className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{streak?.current_streak || 0} days</p>
              </div>
              <div className="bg-green-50 p-2 rounded-full">
                <ChartBar className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Progress Tabs */}
      <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Level Progress */}
            <LevelProgressCard 
              childLevel={{
                id: targetUserId,
                child_id: targetUserId,
                current_level: Math.floor(
                  (lessonProgress.filter(p => p.completed).length / 5) + 
                  (badges.length / 3) + 
                  (Math.min(messages.length, 50) / 10)
                ) + 1,
                current_title: "Learner",
                english_level: 1,
                maths_level: 1,
                total_stars: lessonProgress.filter(p => p.completed).length * 5 + badges.length * 10,
                total_badges: badges.length,
                streak_days: streak?.current_streak || 0,
                longest_streak: streak?.longest_streak || 0,
                updated_at: new Date().toISOString()
              }} 
            />
            
            {/* Recent Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={messageData}>
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" name="Questions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Streak Tracker */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Learning Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <StreakTracker
                  currentStreak={streak?.current_streak || 0}
                  longestStreak={streak?.longest_streak || 0}
                  totalStars={lessonProgress.filter(p => p.completed).length * 5 + badges.length * 10}
                  totalBadges={badges.length}
                  isActiveToday={streak?.last_activity_date ? 
                    new Date(streak.last_activity_date).toDateString() === new Date().toDateString() : 
                    false}
                />
              </CardContent>
            </Card>
            
            {/* Subject Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subject Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  {subjectCompletion.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subjectCompletion}
                          dataKey="total"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          label={(entry) => entry.name}
                        >
                          {subjectCompletion.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'][index % 5]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} lessons`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">No subject data yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="subjects" className="space-y-4">
          {subjectCompletion.length > 0 ? (
            subjectCompletion.map((subject, index) => {
              const completionPercentage = subject.total > 0 
                ? Math.round((subject.completed / subject.total) * 100) 
                : 0;
                
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">{subject.name}</h3>
                      <span className="text-sm px-2 py-1 bg-primary/10 rounded-full font-medium">
                        {completionPercentage}% Complete
                      </span>
                    </div>
                    
                    <Progress value={completionPercentage} className="h-2 mb-2" />
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{subject.completed} of {subject.total} lessons completed</span>
                    </div>
                    
                    {/* List lessons for this subject */}
                    <div className="mt-4 space-y-2">
                      {lessonProgress
                        .filter(progress => progress.lesson?.subject?.title === subject.name)
                        .map((progress, i) => (
                          <div 
                            key={progress.id} 
                            className={`p-3 rounded-md ${
                              progress.completed 
                                ? 'bg-green-50 border border-green-100' 
                                : 'bg-gray-50 border border-gray-100'
                            }`}
                          >
                            <div className="flex justify-between">
                              <div className="flex items-center">
                                {progress.completed ? (
                                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="h-5 w-5 rounded-full bg-gray-300 mr-2"></div>
                                )}
                                <span>{progress.lesson?.title}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {progress.score ? `Score: ${progress.score}%` : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">No Lessons Started Yet</h3>
                <p className="text-muted-foreground">
                  Start learning to see your progress in different subjects
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4">
          <BadgesDisplay badges={badges.map(b => ({
            id: b.id,
            badge: b.badge,
            earned_at: b.awarded_at,
            badge_id: b.badge_id,
            child_id: targetUserId
          }))} />
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.slice(0, 10).map((msg, index) => (
                <div key={index} className="border-b pb-3 last:border-0">
                  <p className="font-medium">{msg.message}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {msg.response.substring(0, 100)}...
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No Questions Yet</h3>
                  <p className="text-muted-foreground">
                    Start asking questions to the AI tutor
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProgressDashboard;
