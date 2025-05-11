
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { EarnedBadge, Badge } from "@/services/gamificationService";

interface BadgeProgressProps {
  earnedBadges: EarnedBadge[];
  nextBadge?: {
    badge: Badge;
    progress: number;
    requiredValue: number;
  };
  isLoading?: boolean;
}

const BadgeProgress: React.FC<BadgeProgressProps> = ({ 
  earnedBadges, 
  nextBadge,
  isLoading = false 
}) => {
  // Get the most recent badge if available
  const recentBadge = earnedBadges.length > 0 ? earnedBadges[0] : null;
  
  if (isLoading) {
    return (
      <Card className="hover-grow mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Badge Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 w-full bg-gray-200 rounded mb-2"></div>
            <div className="h-2 w-full bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-grow mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-500" />
          Badge Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recently earned badge */}
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <h3 className="text-sm font-medium mb-2">Last Badge Earned</h3>
            {recentBadge ? (
              <>
                <div className="flex justify-center mb-2">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                <p className="font-medium">{recentBadge.badge?.name || "Unknown Badge"}</p>
                <p className="text-xs text-neutralgray">{recentBadge.badge?.description || ""}</p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-neutralgray">
                <Award className="h-10 w-10 text-gray-300 mb-2" />
                <p>Complete activities to earn your first badge!</p>
              </div>
            )}
          </div>

          {/* Next badge to unlock */}
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <h3 className="text-sm font-medium mb-2">Next Badge to Unlock</h3>
            {nextBadge ? (
              <>
                <div className="flex justify-center mb-2">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Award className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                <p className="font-medium">{nextBadge.badge.name}</p>
                <p className="text-xs text-neutralgray mb-2">{nextBadge.badge.description}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>
                      {nextBadge.progress} / {nextBadge.requiredValue}
                      {nextBadge.badge.subject === "English" || nextBadge.badge.subject === "Maths" ? " activities" : " stars"}
                    </span>
                  </div>
                  <Progress 
                    value={(nextBadge.progress / nextBadge.requiredValue) * 100} 
                    className="h-2 bg-blue-100" 
                    indicatorClassName="bg-blue-500"
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-neutralgray">
                <Star className="h-10 w-10 text-gray-300 mb-2" />
                <p>All badges unlocked! Amazing work!</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgeProgress;
