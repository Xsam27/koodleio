
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Volume2,
  Star 
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { Activity, Subject } from "@/types";
import MultipleChoiceActivity from "@/components/activities/MultipleChoiceActivity";
import FillInBlanksActivity from "@/components/activities/FillInBlanksActivity";
import MatchPairsActivity from "@/components/activities/MatchPairsActivity";

// Mock lesson data for KS1 English
const ks1EnglishActivities: Activity[] = [
  {
    id: "eng-1",
    type: "multiple-choice",
    difficulty: 1,
    question: "Which letter makes the 'sss' sound?",
    options: ["A", "B", "S", "T"],
    correctAnswer: "S",
    topic: "Phonics",
    keyStage: "KS1",
    subjectArea: "English"
  },
  {
    id: "eng-2",
    type: "fill-in-blanks",
    difficulty: 1,
    question: "Complete the sentence: The cat is ___ the mat.",
    correctAnswer: ["on"],
    hint: "Think about where the cat is positioned.",
    topic: "Reading",
    keyStage: "KS1",
    subjectArea: "English"
  },
  {
    id: "eng-3",
    type: "match-pairs",
    difficulty: 2,
    question: "Match each capital letter with its lowercase letter.",
    options: ["A", "B", "C", "D", "a", "b", "c", "d"],
    correctAnswer: ["A-a", "B-b", "C-c", "D-d"],
    topic: "Letters",
    keyStage: "KS1",
    subjectArea: "English"
  },
  {
    id: "eng-4",
    type: "multiple-choice",
    difficulty: 2,
    question: "Which of these is a verb (an action word)?",
    options: ["Cat", "Run", "Big", "House"],
    correctAnswer: "Run",
    explanation: "A verb is an action word. 'Run' is something you can do.",
    topic: "Grammar",
    keyStage: "KS1",
    subjectArea: "English"
  },
  {
    id: "eng-5",
    type: "fill-in-blanks",
    difficulty: 1,
    question: "Fill in the blank with the correct word: I can see a red ___.",
    correctAnswer: ["car", "bus", "ball", "toy", "hat", "pen", "box"],
    hint: "It can be any red object - there are many correct answers!",
    topic: "Vocabulary",
    keyStage: "KS1",
    subjectArea: "English"
  }
];

// Mock lesson data for KS1 Maths
const ks1MathsActivities: Activity[] = [
  {
    id: "math-1",
    type: "multiple-choice",
    difficulty: 1,
    question: "What number comes after 5?",
    options: ["4", "5", "6", "7"],
    correctAnswer: "6",
    topic: "Counting",
    keyStage: "KS1",
    subjectArea: "Maths"
  },
  {
    id: "math-2",
    type: "fill-in-blanks",
    difficulty: 1,
    question: "2 + 3 = ___",
    correctAnswer: ["5"],
    topic: "Addition",
    keyStage: "KS1",
    subjectArea: "Maths"
  },
  {
    id: "math-3",
    type: "multiple-choice",
    difficulty: 2,
    question: "Which shape has 4 sides?",
    options: ["Circle", "Triangle", "Square", "Oval"],
    correctAnswer: "Square",
    topic: "Shapes",
    keyStage: "KS1",
    subjectArea: "Maths"
  },
  {
    id: "math-4",
    type: "fill-in-blanks",
    difficulty: 2,
    question: "10 - 4 = ___",
    correctAnswer: ["6"],
    topic: "Subtraction",
    keyStage: "KS1",
    subjectArea: "Maths"
  },
  {
    id: "math-5",
    type: "match-pairs",
    difficulty: 2,
    question: "Match each number with the correct number of dots.",
    options: ["1", "2", "3", "4", "•", "••", "•••", "••••"],
    correctAnswer: ["1-•", "2-••", "3-•••", "4-••••"],
    topic: "Number Recognition",
    keyStage: "KS1",
    subjectArea: "Maths"
  }
];

const LessonPage = () => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);

  // Initialize based on subject parameter
  useEffect(() => {
    if (subject?.toLowerCase() === "english") {
      setActivities(ks1EnglishActivities);
    } else if (subject?.toLowerCase() === "maths") {
      setActivities(ks1MathsActivities);
    } else {
      // Default to English if no valid subject specified
      setActivities(ks1EnglishActivities);
    }
  }, [subject]);

  useEffect(() => {
    // Update progress when activities or current index changes
    if (activities.length > 0) {
      setProgress(((currentActivityIndex) / activities.length) * 100);
    }
  }, [currentActivityIndex, activities.length]);

  const currentActivity = activities[currentActivityIndex];

  const checkAnswer = (activityId: string, answer: string | string[]) => {
    setAnswers({ ...answers, [activityId]: answer });
    
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;
    
    let isCorrect = false;
    
    if (activity.type === "multiple-choice") {
      isCorrect = answer === activity.correctAnswer;
    } else if (activity.type === "fill-in-blanks") {
      const normAnswer = typeof answer === "string" ? answer.trim().toLowerCase() : answer;
      const normCorrect = Array.isArray(activity.correctAnswer) 
        ? activity.correctAnswer.map(a => a.trim().toLowerCase()) 
        : [activity.correctAnswer.toString().trim().toLowerCase()];
        
      if (Array.isArray(normAnswer)) {
        // For activities where answer is an array
        isCorrect = normAnswer.every((ans, index) => 
          normCorrect.includes(ans) || normCorrect[index] === ans
        );
      } else {
        // For activities where answer is a string
        isCorrect = normCorrect.includes(normAnswer);
      }
    } else if (activity.type === "match-pairs") {
      // For matching pairs, the answer should match all correct pairs
      const correctPairs = new Set(Array.isArray(activity.correctAnswer) 
        ? activity.correctAnswer 
        : [activity.correctAnswer]);
      
      const answerPairs = new Set(Array.isArray(answer) ? answer : [answer]);
      
      isCorrect = (
        correctPairs.size === answerPairs.size && 
        [...correctPairs].every(pair => answerPairs.has(pair))
      );
    }
    
    setFeedback({
      isCorrect,
      message: isCorrect 
        ? ["Great job!", "Excellent!", "Well done!", "Perfect!", "Amazing!"][Math.floor(Math.random() * 5)]
        : "Oops, that's not quite right. Try again!"
    });
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      // Simulate a voiceover encouragement
      console.log("Voice feedback:", "Great job! You got it right!");
    }
    
    // After feedback, automatically move to next question after a delay (if correct)
    if (isCorrect) {
      setTimeout(() => {
        moveToNextActivity();
      }, 2000);
    }
  };

  const moveToNextActivity = () => {
    setFeedback(null);
    setShowHint(false);
    
    if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex(prev => prev + 1);
    } else {
      // Lesson complete
      setLessonComplete(true);
    }
  };

  const moveToPrevActivity = () => {
    setFeedback(null);
    setShowHint(false);
    
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex(prev => prev - 1);
    }
  };

  const restartLesson = () => {
    setCurrentActivityIndex(0);
    setAnswers({});
    setFeedback(null);
    setShowHint(false);
    setLessonComplete(false);
    setScore(0);
    setProgress(0);
  };

  const finishLesson = () => {
    navigate("/child-dashboard");
  };

  // Toggle hint visibility
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  // Mock function for voice-over
  const playVoiceOver = () => {
    console.log("Playing voice over for:", currentActivity?.question);
    alert("Voice narration: " + currentActivity?.question);
  };

  const renderActivity = () => {
    if (!currentActivity) return null;
    
    switch (currentActivity.type) {
      case "multiple-choice":
        return (
          <MultipleChoiceActivity
            activity={currentActivity}
            onAnswer={(answer) => checkAnswer(currentActivity.id, answer)}
            feedback={feedback && currentActivity.id === feedback.isCorrect.toString() ? feedback : null}
          />
        );
      case "fill-in-blanks":
        return (
          <FillInBlanksActivity
            activity={currentActivity}
            onAnswer={(answer) => checkAnswer(currentActivity.id, answer)}
            feedback={feedback && currentActivity.id === feedback.isCorrect.toString() ? feedback : null}
          />
        );
      case "match-pairs":
        return (
          <MatchPairsActivity
            activity={currentActivity}
            onAnswer={(answer) => checkAnswer(currentActivity.id, answer)}
            feedback={feedback && currentActivity.id === feedback.isCorrect.toString() ? feedback : null}
          />
        );
      default:
        return <p>Activity type not supported.</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-6 bg-softgray/30">
        <div className="container mx-auto max-w-4xl">
          {/* Lesson Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              {subject?.toLowerCase() === "english" ? (
                <div className="bg-softpurple h-10 w-10 rounded-full flex items-center justify-center">
                  <BookOpen size={20} className="text-primary" />
                </div>
              ) : (
                <div className="bg-softblue h-10 w-10 rounded-full flex items-center justify-center">
                  <Brain size={20} className="text-skyblue" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold">
                  {subject === "english" ? "English Lesson" : "Maths Lesson"}
                </h1>
                <p className="text-sm text-neutralgray">
                  Key Stage 1 • {currentActivityIndex + 1} of {activities.length} activities
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/child-dashboard")}
              className="text-neutralgray"
            >
              <ChevronLeft size={16} className="mr-1" />
              Back to Dashboard
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progress} className="h-2.5" />
          </div>
          
          {lessonComplete ? (
            // Lesson Complete View
            <Card className="overflow-hidden bounce-in">
              <div className="h-3 bg-gradient-to-r from-primary to-brightpurple"></div>
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center celebrate">
                      <Star size={40} className="text-yellow-500" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {score}
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Great Job!</h2>
                <p className="text-lg text-neutralgray mb-4">
                  You completed the {subject} lesson with a score of {score} out of {activities.length}.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={restartLesson}
                    className="rounded-full"
                  >
                    Try Again
                  </Button>
                  <Button
                    size="lg"
                    onClick={finishLesson}
                    className="rounded-full"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Activity View
            <div className="space-y-6">
              {currentActivity && (
                <Card className="overflow-hidden pop-in">
                  <div className={`h-2 ${
                    subject?.toLowerCase() === "english"
                      ? "bg-gradient-to-r from-brightpurple to-primary"
                      : "bg-gradient-to-r from-skyblue to-brightblue"
                  }`}></div>
                  <CardContent className="p-6">
                    {/* Activity Topic */}
                    <div className="mb-4 flex justify-between items-center">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        subject?.toLowerCase() === "english" ? "bg-softpurple" : "bg-softblue"
                      }`}>
                        {currentActivity.topic}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={playVoiceOver}
                          className="h-8 w-8 rounded-full"
                          title="Read aloud"
                        >
                          <Volume2 size={16} />
                        </Button>
                        
                        {currentActivity.hint && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleHint}
                            className={`h-8 w-8 rounded-full ${showHint ? "bg-primary/10" : ""}`}
                            title="Show hint"
                          >
                            <HelpCircle size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Activity Question */}
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">{currentActivity.question}</h2>
                      
                      {/* Hint */}
                      {showHint && currentActivity.hint && (
                        <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 mt-2 text-sm flex items-start gap-2">
                          <HelpCircle size={16} className="text-yellow-500 mt-0.5" />
                          <p>{currentActivity.hint}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Render the appropriate activity component */}
                    {renderActivity()}
                    
                    {/* Feedback Message */}
                    {feedback && (
                      <div className={`mt-4 p-3 rounded-md text-center animate-bounce-in ${
                        feedback.isCorrect
                          ? "bg-green-50 text-green-600 border border-green-100"
                          : "bg-red-50 text-red-500 border border-red-100"
                      }`}>
                        <div className="flex items-center justify-center gap-2">
                          {feedback.isCorrect ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            <XCircle size={18} />
                          )}
                          <p>{feedback.message}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={moveToPrevActivity}
                  disabled={currentActivityIndex === 0}
                  className="rounded-full"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {activities.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        index === currentActivityIndex
                          ? subject?.toLowerCase() === "english"
                            ? "bg-primary"
                            : "bg-skyblue"
                          : "bg-gray-200"
                      }`}
                    ></div>
                  ))}
                </div>
                
                {feedback?.isCorrect ? (
                  <Button
                    onClick={moveToNextActivity}
                    className="rounded-full animate-pulse"
                  >
                    {currentActivityIndex < activities.length - 1 ? (
                      <>
                        Next
                        <ChevronRight size={16} className="ml-1" />
                      </>
                    ) : (
                      "Complete Lesson"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={moveToNextActivity}
                    variant="outline"
                    className="rounded-full"
                  >
                    Skip
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LessonPage;
