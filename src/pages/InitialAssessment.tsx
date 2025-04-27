
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { BookOpen, Brain, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Activity } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// Mock assessment questions
const englishQuestions: Activity[] = [
  {
    id: "eq1",
    type: "multiple-choice",
    difficulty: 1,
    question: "Which letter makes the 'b' sound?",
    options: ["p", "b", "d", "q"],
    correctAnswer: "b",
    topic: "Phonics",
    keyStage: "KS1",
    subjectArea: "English"
  },
  {
    id: "eq2",
    type: "multiple-choice",
    difficulty: 1,
    question: "Which of these is a complete sentence?",
    options: [
      "The dog ran",
      "Running fast",
      "Big tree",
      "Happy and excited"
    ],
    correctAnswer: "The dog ran",
    topic: "Grammar",
    keyStage: "KS1",
    subjectArea: "English"
  },
  {
    id: "eq3",
    type: "multiple-choice",
    difficulty: 2,
    question: "What punctuation mark should end this sentence: 'What is your name'",
    options: [".", ",", "!", "?"],
    correctAnswer: "?",
    topic: "Punctuation",
    keyStage: "KS1",
    subjectArea: "English"
  },
  {
    id: "eq4",
    type: "multiple-choice",
    difficulty: 2,
    question: "Which word is spelled correctly?",
    options: ["becuse", "because", "becaus", "becawse"],
    correctAnswer: "because",
    topic: "Spelling",
    keyStage: "KS1",
    subjectArea: "English"
  },
  {
    id: "eq5",
    type: "multiple-choice",
    difficulty: 3,
    question: "Which of these is a noun?",
    options: ["run", "happy", "tree", "quickly"],
    correctAnswer: "tree",
    topic: "Grammar",
    keyStage: "KS1",
    subjectArea: "English"
  }
];

const mathsQuestions: Activity[] = [
  {
    id: "mq1",
    type: "multiple-choice",
    difficulty: 1,
    question: "What number comes after 10?",
    options: ["9", "10", "11", "12"],
    correctAnswer: "11",
    topic: "Counting",
    keyStage: "KS1",
    subjectArea: "Maths"
  },
  {
    id: "mq2",
    type: "multiple-choice",
    difficulty: 1,
    question: "What is 3 + 5?",
    options: ["7", "8", "9", "10"],
    correctAnswer: "8",
    topic: "Addition",
    keyStage: "KS1",
    subjectArea: "Maths"
  },
  {
    id: "mq3",
    type: "multiple-choice",
    difficulty: 2,
    question: "What is 10 - 4?",
    options: ["4", "5", "6", "7"],
    correctAnswer: "6",
    topic: "Subtraction",
    keyStage: "KS1",
    subjectArea: "Maths"
  },
  {
    id: "mq4",
    type: "multiple-choice",
    difficulty: 2,
    question: "How many sides does a square have?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
    topic: "Shapes",
    keyStage: "KS1",
    subjectArea: "Maths"
  },
  {
    id: "mq5",
    type: "multiple-choice",
    difficulty: 3,
    question: "What is 3 × 2?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "6",
    topic: "Multiplication",
    keyStage: "KS1",
    subjectArea: "Maths"
  }
];

const InitialAssessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); // 0: intro, 1-5: English questions, 6-10: Maths questions, 11: results
  const [subject, setSubject] = useState<'English' | 'Maths'>('English');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [englishScore, setEnglishScore] = useState(0);
  const [mathsScore, setMathsScore] = useState(0);
  
  const totalSteps = 11;
  const progress = (currentStep / totalSteps) * 100;
  
  const handleNext = () => {
    // If finishing English section
    if (currentStep === 5) {
      // Calculate English score
      let score = 0;
      englishQuestions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) {
          score++;
        }
      });
      setEnglishScore(score);
      setSubject('Maths');
    }
    
    // If finishing Maths section
    if (currentStep === 10) {
      // Calculate Maths score
      let score = 0;
      mathsQuestions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) {
          score++;
        }
      });
      setMathsScore(score);
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  const handlePrevious = () => {
    if (currentStep === 6) {
      setSubject('English');
    }
    setCurrentStep(prev => prev - 1);
  };
  
  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleFinish = () => {
    // In a real app, we'd save the assessment results to the user's profile
    navigate('/child-dashboard');
  };
  
  // Helper function to get current question
  const getCurrentQuestion = () => {
    if (currentStep >= 1 && currentStep <= 5) {
      return englishQuestions[currentStep - 1];
    } else if (currentStep >= 6 && currentStep <= 10) {
      return mathsQuestions[currentStep - 6];
    }
    return null;
  };
  
  // Current question
  const currentQuestion = getCurrentQuestion();
  
  const renderContent = () => {
    // Intro screen
    if (currentStep === 0) {
      return (
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-4">Welcome to your Learning Assessment</h1>
              <p className="text-neutralgray">
                Let's find out what you already know so we can create a perfect learning plan for you!
              </p>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-4 p-4 bg-softpurple/20 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-softpurple flex items-center justify-center shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-medium">English Assessment</h2>
                  <p className="text-sm text-neutralgray">5 questions to test your reading and writing skills</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-softblue/20 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-softblue flex items-center justify-center shrink-0">
                  <Brain className="h-6 w-6 text-skyblue" />
                </div>
                <div>
                  <h2 className="font-medium">Maths Assessment</h2>
                  <p className="text-sm text-neutralgray">5 questions to test your number and shape skills</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleNext} className="px-8">
                Start Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="mt-4 text-sm text-neutralgray">
                This will take about 5-10 minutes to complete
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Results screen
    if (currentStep === 11) {
      const totalScore = englishScore + mathsScore;
      const maxScore = englishQuestions.length + mathsQuestions.length;
      const percentage = Math.round((totalScore / maxScore) * 100);
      
      return (
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Assessment Complete!</h1>
              <p className="text-neutralgray">
                Great job! We've learned about your current skills and knowledge.
              </p>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{percentage}%</div>
                <p className="text-sm text-neutralgray">Overall Score</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-softpurple/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <h2 className="font-medium">English</h2>
                    </div>
                    <span className="font-bold">{englishScore}/{englishQuestions.length}</span>
                  </div>
                  <Progress 
                    value={(englishScore / englishQuestions.length) * 100} 
                    className="h-2 bg-softpurple/30"
                    indicatorClassName="bg-primary" 
                  />
                </div>
                
                <div className="p-4 bg-softblue/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-skyblue" />
                      <h2 className="font-medium">Maths</h2>
                    </div>
                    <span className="font-bold">{mathsScore}/{mathsQuestions.length}</span>
                  </div>
                  <Progress 
                    value={(mathsScore / mathsQuestions.length) * 100} 
                    className="h-2 bg-softblue/30"
                    indicatorClassName="bg-skyblue" 
                  />
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <p className="text-sm">
                  Based on your results, we'll create a personalized learning plan for you. You're ready to start learning!
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleFinish} className="px-8">
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Question screens
    if (currentQuestion) {
      return (
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {subject === 'English' ? (
                  <BookOpen className="h-5 w-5 text-primary" />
                ) : (
                  <Brain className="h-5 w-5 text-skyblue" />
                )}
                <h2 className="font-semibold text-lg">{subject} Assessment</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Question {subject === 'English' ? currentStep : currentStep - 5} of 5</span>
                <span className="text-xs bg-gray-100 py-1 px-3 rounded-full">
                  {currentQuestion.topic}
                </span>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-6">{currentQuestion.question}</h3>
              
              <RadioGroup 
                value={answers[currentQuestion.id] || ''} 
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                className="space-y-4"
              >
                {currentQuestion.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${idx}`} />
                    <Label htmlFor={`option-${idx}`} className="text-base">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-6 bg-softgray/30">
        <div className="container mx-auto">
          {/* Progress bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>Assessment Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2" 
              indicatorClassName={`${
                subject === 'English'
                  ? "bg-gradient-to-r from-brightpurple to-primary"
                  : "bg-gradient-to-r from-skyblue to-brightblue"
              }`}
            />
          </div>
          
          {renderContent()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InitialAssessment;
