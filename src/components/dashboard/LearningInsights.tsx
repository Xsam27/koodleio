
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Lightbulb, Book, Calculator, Brain, Target } from "lucide-react";
import { Subject } from "@/types";
import { 
  fetchLearningInsights, 
  fetchRecommendedActivities, 
  fetchAITutorTip 
} from "@/services/gamificationService";

interface Insight {
  area: string;
  subject: Subject;
  description: string;
  type: 'strength' | 'weakness';
  id?: string;
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
  id?: string;
}

interface LearningInsightsProps {
  childId: string;
  insights?: Insight[];
  recommendedActivities?: RecommendedActivity[];
  aiTip?: AITip;
  isLoading?: boolean;
}

const LearningInsights: React.FC<LearningInsightsProps> = ({ 
  childId,
  insights: initialInsights, 
  recommendedActivities: initialActivities, 
  aiTip: initialTip,
  isLoading: externalLoading = false
}) => {
  const [insights, setInsights] = useState<Insight[]>(initialInsights || []);
  const [recommendedActivities, setRecommendedActivities] = useState<RecommendedActivity[]>(
    initialActivities || []
  );
  const [aiTip, setAiTip] = useState<AITip>(
    initialTip || { text: "Focus on practicing regularly to improve your skills." }
  );
  const [isLoading, setIsLoading] = useState<boolean>(externalLoading);

  useEffect(() => {
    const fetchData = async () => {
      if (!childId) return;
      
      setIsLoading(true);
      try {
        // Fetch insights
        const insightsData = await fetchLearningInsights(childId);
        const formattedInsights: Insight[] = [
          ...insightsData.strengths.map(s => ({
            id: s.id,
            area: s.area,
            subject: s.subject as Subject,
            description: s.description,
            type: 'strength' as const
          })),
          ...insightsData.weaknesses.map(w => ({
            id: w.id,
            area: w.area,
            subject: w.subject as Subject,
            description: w.description,
            type: 'weakness' as const
          }))
        ];
        
        // Fetch recommended activities
        const activitiesData = await fetchRecommendedActivities(childId);
        const formattedActivities: RecommendedActivity[] = activitiesData.map(a => ({
          id: a.id,
          title: a.title,
          subject: a.subject as Subject,
          description: a.description,
          difficulty: a.difficulty as 'easy' | 'medium' | 'hard',
          estimatedTime: a.estimated_time
        }));
        
        // Fetch AI tutor tip
        const tipData = await fetchAITutorTip(childId);
        const formattedTip: AITip = tipData ? {
          id: tipData.id,
          text: tipData.text,
          focusArea: tipData.focus_area,
          subject: tipData.subject as Subject | undefined
        } : {
          text: "Focus on practicing regularly to improve your skills."
        };
        
        setInsights(formattedInsights);
        setRecommendedActivities(formattedActivities);
        setAiTip(formattedTip);
      } catch (error) {
        console.error("Error fetching learning data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch data if we didn't get initial data from props
    if ((!initialInsights || !initialActivities) && childId) {
      fetchData();
    }
  }, [childId, initialInsights, initialActivities, initialTip]);

  const strengths = insights.filter(insight => insight.type === 'strength');
  const weaknesses = insights.filter(insight => insight.type === 'weakness');
  
  const getSubjectIcon = (subject: Subject) => {
    return subject === 'English' ? 
      <Book className="h-4 w-4 text-primary" /> : 
      <Calculator className="h-4 w-4 text-skyblue" />;
  };

  if (isLoading) {
    return (
      <Card className="hover-grow mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Learning Insights
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="p-4 bg-gray-100 rounded-lg">
                  <div className="h-5 w-24 bg-gray-200 rounded mb-3"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="flex items-start gap-2">
                        <div className="mt-1 h-2 w-2 bg-gray-200 rounded-full"></div>
                        <div className="w-full">
                          <div className="h-4 w-3/4 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 w-full bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
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
              {strengths.length > 0 ? strengths.map((strength, index) => (
                <li key={strength.id || index} className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 bg-green-500 rounded-full shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm">{strength.area}</p>
                      {getSubjectIcon(strength.subject)}
                    </div>
                    <p className="text-xs text-neutralgray">{strength.description}</p>
                  </div>
                </li>
              )) : (
                <li className="text-sm text-neutralgray">
                  Complete more activities to identify your strengths!
                </li>
              )}
            </ul>
          </div>
          
          {/* Areas to Improve */}
          <div className="p-4 bg-amber-50 rounded-lg">
            <h3 className="text-amber-700 font-medium mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Areas to Improve
            </h3>
            
            <ul className="space-y-2">
              {weaknesses.length > 0 ? weaknesses.map((weakness, index) => (
                <li key={weakness.id || index} className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 bg-amber-500 rounded-full shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm">{weakness.area}</p>
                      {getSubjectIcon(weakness.subject)}
                    </div>
                    <p className="text-xs text-neutralgray">{weakness.description}</p>
                  </div>
                </li>
              )) : (
                <li className="text-sm text-neutralgray">
                  Complete more activities to identify areas for improvement!
                </li>
              )}
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
                <li key={activity.id || index} className="flex items-start gap-2 p-2 bg-white rounded border border-purple-100">
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
