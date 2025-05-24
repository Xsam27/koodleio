
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import TutorChat from '@/components/TutorChat';
import { ChevronLeft, ChevronRight, Home, BookOpen, CheckCircle, Clock, HelpCircle } from 'lucide-react';
import { fetchLesson, fetchLessonProgress, updateLessonProgress, Lesson, LessonStep } from '@/services/lessonService';
import { toast } from '@/components/ui/use-toast';

interface LessonViewerProps {
  userId: string;
}

const LessonViewer: React.FC<LessonViewerProps> = ({ userId }) => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<{
    current_step: number;
    completed: boolean;
    score?: number;
    time_spent: number;
  }>({
    current_step: 0,
    completed: false,
    time_spent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showTutor, setShowTutor] = useState(false);
  
  // Effect to load lesson and progress data
  useEffect(() => {
    const loadData = async () => {
      if (!lessonId || !userId) return;
      
      setLoading(true);
      try {
        // Load lesson data
        const lessonData = await fetchLesson(lessonId);
        if (!lessonData) {
          toast({
            title: "Error",
            description: "Lesson not found",
            variant: "destructive",
          });
          navigate('/lessons');
          return;
        }
        
        setLesson(lessonData);
        
        // Load progress data
        const progressData = await fetchLessonProgress(userId, lessonId);
        if (progressData.length > 0) {
          setProgress({
            current_step: progressData[0].current_step || 0,
            completed: progressData[0].completed || false,
            score: progressData[0].score,
            time_spent: progressData[0].time_spent || 0,
          });
        } else {
          // Create initial progress record
          await updateLessonProgress(userId, lessonId, {
            current_step: 0,
            completed: false,
            time_spent: 0,
            last_accessed: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error loading lesson data:', error);
        toast({
          title: "Error",
          description: "Failed to load lesson",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    setStartTime(new Date());
    loadData();
    
    // Setup interval to save progress periodically (every 30 seconds)
    const interval = setInterval(saveTimeSpent, 30000);
    
    return () => {
      clearInterval(interval);
      saveTimeSpent();
    };
  }, [lessonId, userId, navigate]);
  
  const currentStep = lesson?.steps[progress.current_step] || null;
  
  const saveTimeSpent = async () => {
    if (!lessonId || !userId || !lesson) return;
    
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    setStartTime(now);
    
    const newTimeSpent = progress.time_spent + elapsed;
    setProgress(prev => ({ ...prev, time_spent: newTimeSpent }));
    
    // Save to database
    await updateLessonProgress(userId, lessonId, {
      current_step: progress.current_step,
      completed: progress.completed,
      time_spent: newTimeSpent,
      last_accessed: new Date().toISOString()
    });
  };
  
  const handleNextStep = async () => {
    if (!lesson || !lessonId) return;
    
    await saveTimeSpent();
    
    const isLastStep = progress.current_step >= lesson.steps.length - 1;
    
    if (isLastStep) {
      // Complete lesson
      const updatedProgress = {
        current_step: progress.current_step,
        completed: true,
        time_spent: progress.time_spent,
        last_accessed: new Date().toISOString()
      };
      
      setProgress(prev => ({ ...prev, completed: true }));
      await updateLessonProgress(userId, lessonId, updatedProgress);
      
      toast({
        title: "Lesson completed!",
        description: "Congratulations on completing this lesson.",
        variant: "default",
      });
    } else {
      // Move to next step
      const nextStep = progress.current_step + 1;
      
      const updatedProgress = {
        current_step: nextStep,
        completed: false,
        time_spent: progress.time_spent,
        last_accessed: new Date().toISOString()
      };
      
      setProgress(prev => ({ ...prev, current_step: nextStep }));
      await updateLessonProgress(userId, lessonId, updatedProgress);
    }
  };
  
  const handlePreviousStep = async () => {
    if (!lesson || !lessonId) return;
    if (progress.current_step <= 0) return;
    
    await saveTimeSpent();
    
    const prevStep = progress.current_step - 1;
    
    const updatedProgress = {
      current_step: prevStep,
      completed: progress.completed,
      time_spent: progress.time_spent,
      last_accessed: new Date().toISOString()
    };
    
    setProgress(prev => ({ ...prev, current_step: prevStep }));
    await updateLessonProgress(userId, lessonId, updatedProgress);
  };
  
  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  
  if (!lesson || !currentStep) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Lesson not found</h2>
        <p className="text-muted-foreground mb-6">
          The lesson you are looking for does not exist or has been removed.
        </p>
        <Button onClick={() => navigate('/lessons')}>
          Back to Lessons
        </Button>
      </div>
    );
  }
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins % 60}m`;
    }
    
    return `${mins}m`;
  };
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            <Home className="h-4 w-4 mr-1" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/lessons">Lessons</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink>{lesson.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      {/* Lesson Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Grade {lesson.grade_level}
            </Badge>
            <div className="flex items-center text-muted-foreground text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(progress.time_spent)}
              {lesson.estimated_duration && (
                <span className="ml-1"> / ~{lesson.estimated_duration}m</span>
              )}
            </div>
            {progress.completed && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" /> Completed
              </Badge>
            )}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTutor(!showTutor)}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          {showTutor ? "Hide Tutor" : "Ask Tutor"}
        </Button>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            Step {progress.current_step + 1} of {lesson.steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(((progress.current_step + 1) / lesson.steps.length) * 100)}% Complete
          </span>
        </div>
        <Progress 
          value={((progress.current_step + 1) / lesson.steps.length) * 100} 
          className="h-2" 
        />
      </div>
      
      {/* AI Tutor Chat */}
      {showTutor && (
        <div className="mb-6">
          <TutorChat 
            userId={userId}
            lessonContext={{
              lessonId,
              stepId: currentStep.id,
              stepTitle: currentStep.title,
              stepContent: currentStep.content,
            }}
          />
        </div>
      )}
      
      {/* Lesson Step Content */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">{currentStep.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {currentStep.type === 'text' && (
              <div dangerouslySetInnerHTML={{ __html: currentStep.content }}></div>
            )}
            
            {currentStep.type === 'video' && (
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={currentStep.media || ''}
                  title={currentStep.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            
            {currentStep.type === 'quiz' && (
              <div className="space-y-4">
                {/* Simplified quiz display - would be more interactive in a real implementation */}
                {currentStep.quizQuestions?.map((q, i) => (
                  <div key={i} className="border p-4 rounded-md">
                    <p className="font-medium mb-2">{q.question}</p>
                    <div className="space-y-2">
                      {q.options?.map((option, j) => (
                        <div 
                          key={j} 
                          className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                          <input type="radio" id={`q${i}-opt${j}`} name={`question-${i}`} />
                          <label htmlFor={`q${i}-opt${j}`}>{option}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {currentStep.type === 'interactive' && (
              <div className="text-center py-6">
                <BookOpen className="h-12 w-12 mx-auto mb-2 text-primary/50" />
                <p>Interactive content would be displayed here</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={progress.current_step <= 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button onClick={handleNextStep}>
            {progress.current_step >= (lesson.steps?.length - 1) ? (
              progress.completed ? 'Completed' : 'Complete Lesson'
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LessonViewer;
