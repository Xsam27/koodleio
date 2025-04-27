
import { Progress } from "@/components/ui/progress";
import { SubjectProgress, TopicProgress } from "@/types";
import { BookOpen, Brain } from "lucide-react";

interface ProgressSectionProps {
  subject: 'english' | 'maths';
  progress: SubjectProgress;
  keyStage: string;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ subject, progress, keyStage }) => {
  const isEnglish = subject === 'english';
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
          isEnglish ? "bg-softpurple" : "bg-softblue"
        }`}>
          {isEnglish ? (
            <BookOpen size={20} className="text-primary" />
          ) : (
            <Brain size={20} className="text-skyblue" />
          )}
        </div>
        <div>
          <h3 className="font-medium">{isEnglish ? "English" : "Maths"} Progress</h3>
          <p className="text-sm text-neutralgray">
            {progress.overallScore}% mastery
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        {progress.topicsData.map((topic, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span>{topic.name}</span>
              <span className="font-medium">
                {topic.completedActivities}/{topic.totalActivities} activities
              </span>
            </div>
            <Progress 
              value={topic.score} 
              className={`h-2 ${isEnglish ? "bg-softpurple/30" : "bg-softblue/30"}`}
              indicatorClassName={isEnglish 
                ? "bg-gradient-to-r from-brightpurple to-primary" 
                : "bg-gradient-to-r from-skyblue to-brightblue"
              }
            />
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs bg-gray-100 py-1 px-3 rounded-full">
          {keyStage} {isEnglish ? "English" : "Maths"}
        </span>
        <span className="text-xs text-neutralgray">
          Updated {new Date().toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default ProgressSection;
