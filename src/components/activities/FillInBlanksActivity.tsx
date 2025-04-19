
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity } from "@/types";

interface FillInBlanksActivityProps {
  activity: Activity;
  onAnswer: (answer: string) => void;
  feedback: { isCorrect: boolean; message: string } | null;
}

const FillInBlanksActivity = ({ activity, onAnswer, feedback }: FillInBlanksActivityProps) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onAnswer(answer);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            className={`text-lg p-4 h-14 rounded-xl ${
              feedback?.isCorrect
                ? "border-green-500 bg-green-50"
                : feedback
                ? "border-red-300 bg-red-50"
                : ""
            }`}
            disabled={feedback !== null}
            autoFocus
          />
        </div>

        {!feedback && (
          <Button
            type="submit"
            className="w-full rounded-xl py-6 text-lg"
            disabled={answer.trim() === ""}
          >
            Check Answer
          </Button>
        )}
      </form>

      {activity.explanation && feedback && !feedback.isCorrect && (
        <div className="mt-4 bg-softblue/30 p-3 rounded-md text-sm">
          <p className="font-medium">Hint:</p>
          <p>{activity.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default FillInBlanksActivity;
