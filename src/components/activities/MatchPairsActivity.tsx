
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity } from "@/types";

interface MatchPairsActivityProps {
  activity: Activity;
  onAnswer: (answer: string[]) => void;
  feedback: { isCorrect: boolean; message: string } | null;
}

interface PairItem {
  id: string;
  value: string;
  isSelected: boolean;
  isMatched: boolean;
}

const MatchPairsActivity = ({ activity, onAnswer, feedback }: MatchPairsActivityProps) => {
  const [items, setItems] = useState<PairItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PairItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  
  // Initialize items when activity changes
  useEffect(() => {
    if (activity.options && activity.options.length > 0) {
      const initialItems = activity.options.map((option, index) => ({
        id: index.toString(),
        value: option,
        isSelected: false,
        isMatched: false
      }));
      
      // Shuffle the items
      const shuffledItems = [...initialItems].sort(() => Math.random() - 0.5);
      setItems(shuffledItems);
    }
  }, [activity]);
  
  const handleItemClick = (item: PairItem) => {
    // Don't allow clicking on already matched items
    if (item.isMatched) return;
    
    // If no item is selected, select this one
    if (!selectedItem) {
      setItems(prevItems => 
        prevItems.map(i => 
          i.id === item.id ? { ...i, isSelected: true } : i
        )
      );
      setSelectedItem(item);
      return;
    }
    
    // Don't allow selecting the same item twice
    if (selectedItem.id === item.id) return;
    
    // Check if the selected items form a pair based on their positions in the original array
    const isLeftSidePair = Number(selectedItem.id) < activity.options!.length / 2;
    const isRightSidePair = Number(item.id) >= activity.options!.length / 2;
    
    const leftValue = isLeftSidePair ? selectedItem.value : item.value;
    const rightValue = isRightSidePair ? item.value : selectedItem.value;
    
    // Create a pair string for checking
    let pair: string;
    
    // This is a simplified approach. In a real app, you'd have a more robust matching logic
    // For example, matching "A" with "a", or number 1 with "one"
    if (isLeftSidePair && isRightSidePair) {
      pair = `${leftValue}-${rightValue}`;
      
      // Check if it's a correct match
      const isCorrectMatch = (Array.isArray(activity.correctAnswer) 
        ? activity.correctAnswer 
        : [activity.correctAnswer.toString()]
      ).includes(pair);
      
      if (isCorrectMatch) {
        // Mark both items as matched
        setItems(prevItems => 
          prevItems.map(i => 
            i.id === selectedItem.id || i.id === item.id
              ? { ...i, isMatched: true, isSelected: false }
              : i
          )
        );
        
        // Add to matched pairs
        setMatchedPairs(prev => [...prev, pair]);
        
        // Check if all pairs are matched
        if (matchedPairs.length + 1 === activity.options!.length / 2) {
          // All pairs matched
          onAnswer(matchedPairs);
        }
      } else {
        // Not a match, reset selections
        setTimeout(() => {
          setItems(prevItems => 
            prevItems.map(i => ({ ...i, isSelected: false }))
          );
        }, 500);
      }
    } else {
      // Reset selections if items are from the same side
      setTimeout(() => {
        setItems(prevItems => 
          prevItems.map(i => ({ ...i, isSelected: false }))
        );
      }, 500);
    }
    
    // Reset selected item
    setSelectedItem(null);
  };
  
  // Group items into left and right sides
  const leftItems = items.filter((_, index) => index < items.length / 2);
  const rightItems = items.filter((_, index) => index >= items.length / 2);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Left side items */}
        <div className="space-y-2">
          {leftItems.map((item) => (
            <Card
              key={item.id}
              className={`p-3 cursor-pointer transition-all ${
                item.isMatched
                  ? "bg-green-100 border-green-300"
                  : item.isSelected
                  ? "bg-primary text-white"
                  : "hover:bg-muted"
              }`}
              onClick={() => !feedback && handleItemClick(item)}
            >
              {item.value}
            </Card>
          ))}
        </div>
        
        {/* Right side items */}
        <div className="space-y-2">
          {rightItems.map((item) => (
            <Card
              key={item.id}
              className={`p-3 cursor-pointer transition-all ${
                item.isMatched
                  ? "bg-green-100 border-green-300"
                  : item.isSelected
                  ? "bg-primary text-white"
                  : "hover:bg-muted"
              }`}
              onClick={() => !feedback && handleItemClick(item)}
            >
              {item.value}
            </Card>
          ))}
        </div>
      </div>
      
      {/* Submit button for when all pairs are manually matched */}
      {matchedPairs.length > 0 && matchedPairs.length === activity.options!.length / 2 && !feedback && (
        <Button
          onClick={() => onAnswer(matchedPairs)}
          className="w-full mt-4"
        >
          Check Answers
        </Button>
      )}
    </div>
  );
};

export default MatchPairsActivity;
