
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy, Award, Star, Calendar } from "lucide-react";
import { ChildLevel } from "@/services/gamificationService";

interface StreakTrackerProps {
  childLevel: ChildLevel | null;
  isLoading?: boolean;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({
  childLevel,
  isLoading = false
}) => {
  const currentStreak = childLevel?.streak_days || 0;
  const longestStreak = childLevel?.longest_streak || 0;
  const totalStars = childLevel?.total_stars || 0;
  const totalBadges = childLevel?.total_badges || 0;
  
  // Check if active today
  const isActiveToday = childLevel?.last_activity_date ? 
    new Date(childLevel.last_activity_date).toDateString() === new Date().toDateString() : 
    false;
  
  if (isLoading) {
    return (
      <Card className="hover-grow mb-6">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mb-2"></div>
                  <div className="h-5 w-8 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
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
