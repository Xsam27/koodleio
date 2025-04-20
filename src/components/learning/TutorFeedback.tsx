
import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TutorFeedbackProps {
  type: 'success' | 'error' | 'hint';
  message: string;
  className?: string;
}

const TutorFeedback: React.FC<TutorFeedbackProps> = ({ type, message, className }) => {
  return (
    <div className={cn(
      "flex items-center gap-2 p-3 rounded-lg animate-fade-in",
      type === 'success' && "bg-green-50 text-green-600 border border-green-100",
      type === 'error' && "bg-red-50 text-red-500 border border-red-100",
      type === 'hint' && "bg-yellow-50 text-yellow-600 border border-yellow-100",
      className
    )}>
      {type === 'success' && <CheckCircle2 className="h-5 w-5" />}
      {type === 'error' && <AlertCircle className="h-5 w-5" />}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default TutorFeedback;
