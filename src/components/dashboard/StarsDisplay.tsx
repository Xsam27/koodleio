
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Star as StarType } from "@/services/gamificationService";

interface StarsDisplayProps {
  stars: StarType[];
  totalStars: number;
  isLoading?: boolean;
}

const StarsDisplay: React.FC<StarsDisplayProps> = ({ 
  stars, 
  totalStars,
  isLoading = false 
}) => {
  // Group stars by subject
  const starsBySubject: Record<string, number> = stars.reduce((acc, star) => {
    if (!acc[star.subject]) {
      acc[star.subject] = 0;
    }
    acc[star.subject] += star.amount;
    return acc;
  }, {} as Record<string, number>);

  const recentStars = stars.slice(0, 5);
  
  if (isLoading) {
    return (
      <Card className="hover-grow mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5" />
            Your Stars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
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
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Your Stars
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center p-2 bg-yellow-100 rounded-full mb-2">
            <Star className="h-10 w-10 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold">{totalStars}</p>
          <p className="text-sm text-neutralgray">Total Stars Earned</p>
        </div>
        
        {Object.keys(starsBySubject).length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Stars by Subject</h4>
            <div className="space-y-2">
              {Object.entries(starsBySubject).map(([subject, amount]) => (
                <div key={subject} className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className={`h-3 w-3 rounded-full ${
                      subject === 'English' ? 'bg-primary' : 'bg-skyblue'
                    }`}></div>
                    <span>{subject}</span>
                  </div>
                  <span className="font-medium">{amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {recentStars.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recently Earned</h4>
            <ul className="space-y-1">
              {recentStars.map((star) => (
                <li key={star.id} className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className={`text-xs font-medium px-1.5 rounded ${
                      star.subject === 'English' 
                        ? 'bg-softpurple text-primary' 
                        : 'bg-softblue text-skyblue'
                    }`}>
                      {star.subject}
                    </div>
                    <span className="text-neutralgray">{star.reason}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">{star.amount}</span>
                    <Star className="h-3 w-3 text-yellow-500 ml-1" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {stars.length === 0 && (
          <div className="text-center text-neutralgray">
            <p>Complete activities to earn stars!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StarsDisplay;
