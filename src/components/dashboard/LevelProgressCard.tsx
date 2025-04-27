
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LevelProgressCardProps {
  currentLevel: number;
  levelName: string;
  progress: number;
  pointsToNextLevel: number;
  totalPoints: number;
}

const LevelProgressCard: React.FC<LevelProgressCardProps> = ({
  currentLevel,
  levelName,
  progress,
  pointsToNextLevel,
  totalPoints
}) => {
  return (
    <Card className="hover-grow mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-lg">Your Learning Level</h3>
          <span className="text-xs bg-gray-100 py-1 px-3 rounded-full">
            {totalPoints} total points
          </span>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center">
            <Crown size={28} className="text-yellow-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">Level {currentLevel}</span>
              <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                {levelName}
              </span>
            </div>
            <p className="text-sm text-neutralgray">
              {pointsToNextLevel} points until Level {currentLevel + 1}
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
