
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Activity } from "@/types";

interface MultipleChoiceActivityProps {
  activity: Activity;
  onAnswer: (answer: string) => void;
  feedback: { isCorrect: boolean; message: string } | null;
}

const MultipleChoiceActivity = ({ activity, onAnswer, feedback }: MultipleChoiceActivityProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    onAnswer(option);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activity.options?.map((option) => (
          <Button
            key={option}
            variant={selectedOption === option ? "default" : "outline"}
            className={`p-4 h-auto text-lg font-medium rounded-xl transition-all hover-bright ${
              feedback?.isCorrect && selectedOption === option
                ? "bg-green-500 hover:bg-green-600"
                : feedback && !feedback.isCorrect && selectedOption === option
                ? "bg-red-100 border-red-200 text-red-500 hover:bg-red-200"
                : ""
            }`}
            onClick={() => handleOptionSelect(option)}
            disabled={feedback !== null}
          >
            {option}
          </Button>
        ))}
      </div>

      {activity.explanation && feedback && !feedback.isCorrect && (
        <div className="mt-4 bg-softblue/30 p-3 rounded-md text-sm">
          <p className="font-medium">Explanation:</p>
          <p>{activity.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceActivity;
