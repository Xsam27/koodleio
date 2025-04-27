
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Lightbulb } from "lucide-react";

interface Insight {
  area: string;
  subject: 'English' | 'Maths';
  description: string;
  type: 'strength' | 'weakness';
}

interface LearningInsightsProps {
  insights: Insight[];
}

const LearningInsights: React.FC<LearningInsightsProps> = ({ insights }) => {
  const strengths = insights.filter(insight => insight.type === 'strength');
  const weaknesses = insights.filter(insight => insight.type === 'weakness');
  
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
                    <p className="font-medium text-sm">{strength.area}</p>
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
                    <p className="font-medium text-sm">{weakness.area}</p>
                    <p className="text-xs text-neutralgray">{weakness.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-blue-700 text-sm">
            <span className="font-medium">Tutor tip:</span> Focus on practicing letter sounds this week to improve your reading skills.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningInsights;
