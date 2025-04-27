
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Medal, Star, Trophy } from "lucide-react";
import { EarnedBadge } from "@/services/gamificationService";

interface BadgesDisplayProps {
  badges: EarnedBadge[];
  isLoading?: boolean;
}

const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ badges, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card className="hover-grow mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-pulse h-6 w-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group badges by level
  const badgesByLevel: Record<number, EarnedBadge[]> = {};
  badges.forEach(badge => {
    if (badge.badge) {
      const level = badge.badge.level || 1;
      if (!badgesByLevel[level]) {
        badgesByLevel[level] = [];
      }
      badgesByLevel[level].push(badge);
    }
  });

  // Get badge icon based on level
  const getBadgeIcon = (level: number) => {
    switch (level) {
      case 3:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-blue-500" />;
      default:
        return <Star className="h-5 w-5 text-purple-500" />;
    }
  };

  // Get badge style based on level
  const getBadgeStyle = (level: number) => {
    switch (level) {
      case 3:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-purple-100 text-purple-800 border-purple-300";
    }
  };

  return (
    <Card className="hover-grow mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Your Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(badgesByLevel).length === 0 ? (
          <div className="text-center py-6 text-neutralgray">
            <Award className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Complete activities to earn your first badge!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(badgesByLevel)
              .sort(([levelA], [levelB]) => Number(levelB) - Number(levelA))
              .map(([level, levelBadges]) => (
                <div key={level}>
                  <div className="flex items-center gap-2 mb-2">
                    {getBadgeIcon(Number(level))}
                    <h3 className="font-medium">
                      {Number(level) === 3 
                        ? "Gold Badges" 
                        : Number(level) === 2 
                          ? "Silver Badges" 
                          : "Bronze Badges"}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {levelBadges.map((earnedBadge) => (
                      <div 
                        key={earnedBadge.id}
                        className={`p-2 rounded-lg border text-center ${getBadgeStyle(Number(level))}`}
                      >
                        <div className="flex justify-center mb-1">
                          {getBadgeIcon(Number(level))}
                        </div>
                        <p className="font-medium text-sm">{earnedBadge.badge?.name}</p>
                        <p className="text-xs">{earnedBadge.badge?.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
        <div className="mt-4 text-center">
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            {badges.length} Badges Earned
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgesDisplay;
