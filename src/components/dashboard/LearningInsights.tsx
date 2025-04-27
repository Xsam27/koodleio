
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Lightbulb, Book, Calculator, Brain, Target } from "lucide-react";
import { Subject } from "@/types";

interface Insight {
  area: string;
  subject: Subject;
  description: string;
  type: 'strength' | 'weakness';
}

interface RecommendedActivity {
  id: string;
  title: string;
  subject: Subject;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
}

interface AITip {
  text: string;
  focusArea?: string;
  subject?: Subject;
}

interface LearningInsightsProps {
  insights: Insight[];
  recommendedActivities?: RecommendedActivity[];
  aiTip?: AITip;
}

const LearningInsights: React.FC<LearningInsightsProps> = ({ 
  insights, 
  recommendedActivities = [], 
  aiTip = { text: "Focus on practicing regularly to improve your skills." }
}) => {
  const strengths = insights.filter(insight => insight.type === 'strength');
  const weaknesses = insights.filter(insight => insight.type === 'weakness');
  
  const getSubjectIcon = (subject: Subject) => {
    return subject === 'English' ? 
      <Book className="h-4 w-4 text-primary" /> : 
      <Calculator className="h-4 w-4 text-skyblue" />;
  };
  
  return (
    <Card className="hover-grow mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Learning Insights
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-green-700 font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Strengths
            </h3>
            
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 bg-green-500 rounded-full shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm">{strength.area}</p>
                      {getSubjectIcon(strength.subject)}
                    </div>
                    <p className="text-xs text-neutralgray">{strength.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Areas to Improve */}
          <div className="p-4 bg-amber-50 rounded-lg">
            <h3 className="text-amber-700 font-medium mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Areas to Improve
            </h3>
            
            <ul className="space-y-2">
              {weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 bg-amber-500 rounded-full shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm">{weakness.area}</p>
                      {getSubjectIcon(weakness.subject)}
                    </div>
                    <p className="text-xs text-neutralgray">{weakness.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* AI Recommended Activities */}
        {recommendedActivities.length > 0 && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <h3 className="text-purple-700 font-medium mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              AI Recommended Activities
            </h3>
            
            <ul className="space-y-3">
              {recommendedActivities.slice(0, 2).map((activity, index) => (
                <li key={index} className="flex items-start gap-2 p-2 bg-white rounded border border-purple-100">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    {activity.subject === 'English' ? 
                      <Book className="h-4 w-4 text-primary" /> : 
                      <Calculator className="h-4 w-4 text-skyblue" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-neutralgray mb-1">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${
                        activity.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        activity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {activity.difficulty}
                      </span>
                      <span className="text-neutralgray">{activity.estimatedTime} min</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Tutor Tip */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Brain className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-1">AI Tutor Tip</h4>
            <p className="text-sm text-blue-700">
              {aiTip.text}
              {aiTip.focusArea && (
                <span className="block mt-1 font-medium">
                  Focus on: {aiTip.focusArea} {aiTip.subject && `in ${aiTip.subject}`}
                </span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningInsights;
