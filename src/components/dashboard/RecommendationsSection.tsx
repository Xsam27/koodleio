
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, Brain, ArrowRight, Star } from "lucide-react";
import { Subject } from "@/types";
import { Link } from "react-router-dom";

interface RecommendedActivity {
  id: string;
  title: string;
  subject: Subject;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  completionBadge?: string;
}

interface RecommendationsSectionProps {
  activities: RecommendedActivity[];
  isLoading?: boolean;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ 
  activities, 
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="hover-grow mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Your Next Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="hover-grow mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Your Next Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-neutralgray">
            <p>All caught up! Check back soon for new activities.</p>
            <div className="mt-4">
              <Button asChild size="sm" className="rounded-full">
                <Link to="/lesson/english">Explore Lessons</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSubjectIcon = (subject: Subject) => {
    switch (subject) {
      case "English":
        return <BookOpen className="h-5 w-5 text-primary" />;
      case "Maths":
      default:
        return <Brain className="h-5 w-5 text-skyblue" />;
    }
  };

  const getSubjectColor = (subject: Subject) => {
    switch (subject) {
      case "English":
        return "bg-softpurple text-primary";
      case "Maths":
      default:
        return "bg-softblue text-skyblue";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Easy";
      case "medium":
        return "Medium";
      case "hard":
        return "Challenging";
      default:
        return "Medium";
    }
  };

  return (
    <Card className="hover-grow mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Your Next Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="border rounded-lg p-3 hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full ${getSubjectColor(activity.subject)} flex items-center justify-center`}>
                    {getSubjectIcon(activity.subject)}
                  </div>
                  <div>
                    <h3 className="font-medium">{activity.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-neutralgray">
                      <span>{activity.subject}</span>
                      <span className="h-1 w-1 rounded-full bg-neutralgray"></span>
                      <span>{getDifficultyLabel(activity.difficulty)}</span>
                      <span className="h-1 w-1 rounded-full bg-neutralgray"></span>
                      <span>{activity.estimatedTime} mins</span>
                    </div>
                  </div>
                </div>
                {activity.completionBadge && (
                  <div className="bg-yellow-100 rounded-full p-1 text-yellow-700">
                    <Award size={16} />
                  </div>
                )}
              </div>
              <p className="text-sm text-neutralgray mb-3">{activity.description}</p>
              <div className="flex justify-between items-center">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                >
                  <Link to={`/lesson/${activity.subject.toLowerCase()}/${activity.id}`}>
                    <span className="flex items-center gap-1">
                      Start Activity
                      <ArrowRight size={12} />
                    </span>
                  </Link>
                </Button>
                {activity.completionBadge && (
                  <div className="flex items-center text-xs gap-1 text-neutralgray">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>Earn {activity.completionBadge} badge</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsSection;
