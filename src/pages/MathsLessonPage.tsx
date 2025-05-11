import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Activity, ChildProfile } from "@/types";
import { Check, ChevronRight, Star, HelpCircle, Home, Brain } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import CameraView from '@/components/learning/CameraView';
import VoiceInteraction from '@/components/learning/VoiceInteraction';
import { completeActivity, convertDifficultyToString } from "@/services/gamificationService";
import { supabase } from "@/integrations/supabase/client";

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

const mathActivities: Activity[] = [
  {
    id: "math1",
    type: "multiple-choice",
    difficulty: 1,
    question: "How many apples are there? 🍎🍎🍎",
    options: ["2", "3", "4", "5"],
    correctAnswer: "3",
    topic: "Counting",
    keyStage: "KS1",
    subjectArea: "Maths",
    hint: "Count each apple one by one"
  },
  {
    id: "math2",
    type: "multiple-choice",
    difficulty: 1,
    question: "What comes after 5? 1, 2, 3, 4, 5, __",
    options: ["4", "6", "7", "8"],
    correctAnswer: "6",
    topic: "Counting",
    keyStage: "KS1",
    subjectArea: "Maths",
    hint: "Think about counting up from 5"
  },
  {
    id: "math3",
    type: "multiple-choice",
    difficulty: 1,
    question: "2 + 3 = ?",
    options: ["4", "5", "6", "7"],
    correctAnswer: "5",
    topic: "Addition",
    keyStage: "KS1",
    subjectArea: "Maths",
    hint: "Try counting on your fingers"
  },
  {
    id: "math4",
    type: "multiple-choice",
    difficulty: 2,
    question: "Which shape has 4 equal sides? ⬜ 🔷 ⬛ 🔶",
    options: ["Triangle", "Square", "Rectangle", "Circle"],
    correctAnswer: "Square",
    topic: "Shapes",
    keyStage: "KS1",
    subjectArea: "Maths",
    hint: "A square has all sides the same length"
  },
  {
    id: "math5",
    type: "multiple-choice",
    difficulty: 2,
    question: "5 - 2 = ?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "3",
    topic: "Subtraction",
    keyStage: "KS1",
    subjectArea: "Maths",
    hint: "Start with 5 and take away 2"
  }
];

const MathsLessonPage = () => {
  const navigate = useNavigate();
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const currentActivity = mathActivities[currentActivityIndex];
  
  // Add a useEffect to get the user ID on component mount
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    getUserId();
  }, []);
  
  useEffect(() => {
    const progressPercentage = (currentActivityIndex / mathActivities.length) * 100;
    setLessonProgress(progressPercentage);
  }, [currentActivityIndex]);
  
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    
    const correct = answer === currentActivity.correctAnswer;
    setIsAnswerCorrect(correct);
    
    if (correct) {
      setScore(prevScore => prevScore + (currentActivity.difficulty * 10));
      toast({
        title: "Correct! 🎉",
        description: "Well done! You got it right!",
      });

      // Record activity completion with Supabase if user is logged in
      if (userId) {
        try {
          completeActivity(
            activeProfile.id,
            userId,
            currentActivity.id,
            currentActivity.subjectArea,
            100, // Perfect score
            Math.floor(Math.random() * 60) + 30, // Random time between 30-90 seconds
            currentActivity.topic,
            convertDifficultyToString(currentActivity.difficulty) // Convert numeric difficulty to string
          );
        } catch (error) {
          console.error("Error recording activity completion:", error);
        }
      }
    } else {
      toast({
        title: "Not quite right 🤔",
        description: "Let's try again or check the hint!",
        variant: "destructive"
      });
      
      // Record failed attempt with lower score if user is logged in
      if (userId) {
        try {
          completeActivity(
            activeProfile.id,
            userId,
            currentActivity.id,
            currentActivity.subjectArea,
            50, // Lower score for incorrect answer
            Math.floor(Math.random() * 60) + 60, // Longer time for incorrect answers
            currentActivity.topic,
            convertDifficultyToString(currentActivity.difficulty) // Convert numeric difficulty to string
          );
        } catch (error) {
          console.error("Error recording activity completion:", error);
        }
      }
    }
  };
  
  const handleNextActivity = () => {
    if (isAnswerCorrect) {
      if (currentActivityIndex < mathActivities.length - 1) {
        setCurrentActivityIndex(prevIndex => prevIndex + 1);
        setSelectedAnswer(null);
        setIsAnswerCorrect(null);
        setShowHint(false);
        
        const starsToAdd = !showHint ? currentActivity.difficulty : 1;
        setStarsEarned(prev => prev + starsToAdd);
      } else {
        setIsLessonComplete(true);
        setStarsEarned(prev => prev + 3);
        toast({
          title: "Lesson Complete! 🌟",
          description: `You earned ${starsEarned + 3} stars in this lesson!`,
        });
      }
    } else {
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
    }
  };
  
  const handleHintToggle = () => {
    setShowHint(!showHint);
  };
  
  const handleFinishLesson = () => {
    navigate("/child-dashboard");
  };
  
  const renderActivityContent = () => {
    if (isLessonComplete) {
      return (
        <div className="text-center py-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold">Great Job, {activeProfile.name}!</h2>
            <p className="text-lg">You completed today's Maths lesson</p>
            
            <div className="flex items-center gap-2 mt-4">
              <div className="text-3xl text-yellow-500">
                <Star fill="currentColor" />
              </div>
              <span className="text-xl font-bold">{starsEarned} Stars Earned</span>
            </div>
            
            <div className="bg-softblue/20 p-6 rounded-xl mt-6 max-w-md">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Brain className="text-skyblue" size={20} />
                Today's Progress
              </h3>
              <p className="mb-4">You did really well with counting and shapes!</p>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>Score</span>
                    <span className="font-medium">{score} points</span>
                  </div>
                  <Progress value={Math.min(score/150 * 100, 100)} className="h-2 bg-softblue/30" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>Activities Completed</span>
                    <span className="font-medium">{mathActivities.length}/{mathActivities.length}</span>
                  </div>
                  <Progress value={100} className="h-2 bg-softblue/30" />
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Button 
                size="lg" 
                className="rounded-full bg-gradient-to-r from-skyblue to-brightblue hover:opacity-90"
                onClick={handleFinishLesson}
              >
                Back to Dashboard
                <Home size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div 
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold float"
              style={{ backgroundColor: activeProfile.avatarColor }}
            >
              {activeProfile.name.charAt(0)}
            </div>
            <span className="font-medium">{activeProfile.name}'s Maths</span>
          </div>
          <div className="flex items-center gap-4">
            <CameraView onCameraToggle={(isOn) => console.log('Camera is:', isOn ? 'on' : 'off')} />
            <VoiceInteraction onSpeakingChange={setIsAISpeaking} />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm mb-1">
            <span>Lesson Progress</span>
            <span>{currentActivityIndex + 1}/{mathActivities.length}</span>
          </div>
          <Progress value={lessonProgress} className="h-2 bg-softblue/30" />
        </div>
        
        <Card className="overflow-hidden animate-fade-in">
          <div className="h-2 bg-gradient-to-r from-skyblue to-brightblue"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Topic: {currentActivity.topic}
                </div>
                <h3 className="text-xl font-bold mb-2">{currentActivity.question}</h3>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={handleHintToggle}
                >
                  <HelpCircle size={16} />
                </Button>
              </div>
            </div>
            
            {showHint && (
              <div className="bg-yellow-50 p-3 rounded-lg mb-6 text-sm animate-fade-in">
                <p className="font-medium">Hint:</p>
                <p>{currentActivity.hint}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {currentActivity.options?.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === option 
                    ? isAnswerCorrect 
                      ? "default" 
                      : "destructive" 
                    : "outline"}
                  className={`h-auto py-3 px-4 text-left justify-start ${
                    selectedAnswer === option && isAnswerCorrect 
                      ? "bg-green-500 hover:bg-green-600" 
                      : ""
                  }`}
                  onClick={() => !selectedAnswer && handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                >
                  {selectedAnswer === option && isAnswerCorrect && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {selectedAnswer && (
          <div className="flex justify-end">
            <Button 
              onClick={handleNextActivity}
              className="rounded-full bg-gradient-to-r from-skyblue to-brightblue"
              disabled={!isAnswerCorrect}
            >
              {isAnswerCorrect ? 
                currentActivityIndex < mathActivities.length - 1 ? 
                  "Next Question" : "Finish Lesson" 
                : "Try Again"}
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-6 bg-softgray/30">
        <div className="container mx-auto max-w-2xl">
          {renderActivityContent()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MathsLessonPage;
