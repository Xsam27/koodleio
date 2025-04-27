
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy, Award, Star, Calendar } from "lucide-react";

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  totalStars: number;
  totalBadges: number;
  lastActive: Date;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({
  currentStreak,
  longestStreak,
  totalStars,
  totalBadges,
  lastActive
}) => {
  const isActiveToday = lastActive.toDateString() === new Date().toDateString();
  
  return (
    <Card className="hover-grow mb-6">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-3">Learning Streak</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col items-center text-center p-2">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 ${
              isActiveToday ? "bg-orange-100" : "bg-gray-100"
            }`}>
              <Flame size={24} className={isActiveToday ? "text-orange-500" : "text-gray-400"} />
            </div>
            <span className="text-xl font-bold">{currentStreak}</span>
            <span className="text-xs text-neutralgray">Current Streak</span>
          </div>
          
          <div className="flex flex-col items-center text-center p-2">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Trophy size={24} className="text-blue-500" />
            </div>
            <span className="text-xl font-bold">{longestStreak}</span>
            <span className="text-xs text-neutralgray">Best Streak</span>
          </div>
          
          <div className="flex flex-col items-center text-center p-2">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
              <Star size={24} className="text-yellow-500" />
            </div>
            <span className="text-xl font-bold">{totalStars}</span>
            <span className="text-xs text-neutralgray">Stars Earned</span>
          </div>
          
          <div className="flex flex-col items-center text-center p-2">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <Award size={24} className="text-purple-500" />
            </div>
            <span className="text-xl font-bold">{totalBadges}</span>
            <span className="text-xs text-neutralgray">Badges</span>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <p className="text-sm">
            {isActiveToday ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                You've practiced today! Great job keeping your streak!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 text-orange-500">
                <Calendar size={16} />
                Practice today to keep your streak going!
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakTracker;
