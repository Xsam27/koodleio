
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ChildLevel } from "@/services/gamificationService";

interface LevelProgressCardProps {
  childLevel: ChildLevel | null;
  isLoading?: boolean;
}

const LevelProgressCard: React.FC<LevelProgressCardProps> = ({
  childLevel,
  isLoading = false
}) => {
  // Calculate progress to next level (example calculation - adjust as needed)
  const calculateProgress = () => {
    if (!childLevel) return 0;
    
    const currentLevel = childLevel.current_level;
    const nextLevelThreshold = currentLevel * 20; // 20 stars per level
    const previousLevelThreshold = (currentLevel - 1) * 20;
    
    const starsForThisLevel = childLevel.total_stars - previousLevelThreshold;
    const starsNeededForNextLevel = nextLevelThreshold - previousLevelThreshold;
    
    return Math.min(100, Math.round((starsForThisLevel / starsNeededForNextLevel) * 100));
  };

  const progress = calculateProgress();
  const pointsToNextLevel = childLevel 
    ? (childLevel.current_level * 20) - childLevel.total_stars 
    : 0;

  if (isLoading) {
    return (
      <Card className="hover-grow mb-6">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-full bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="h-2.5 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-grow mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-lg">Your Learning Level</h3>
          <span className="text-xs bg-gray-100 py-1 px-3 rounded-full">
            {childLevel?.total_stars || 0} total stars
          </span>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center">
            <Crown size={28} className="text-yellow-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">Level {childLevel?.current_level || 1}</span>
              <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                {childLevel?.current_title || "New Learner"}
              </span>
            </div>
            <p className="text-sm text-neutralgray">
              {pointsToNextLevel > 0 ? `${pointsToNextLevel} stars until Level ${(childLevel?.current_level || 1) + 1}` : 'Maximum level reached!'}
            </p>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to next level</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2.5 bg-yellow-100"
            indicatorClassName="bg-gradient-to-r from-yellow-400 to-yellow-600" 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelProgressCard;
