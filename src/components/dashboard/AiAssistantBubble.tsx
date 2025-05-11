
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, MinusCircle, BrainCircuit, ChevronDown, ChevronUp } from "lucide-react";
import VoiceInteraction from "@/components/learning/VoiceInteraction";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRecord } from "@/services/gamificationService";

interface AiAssistantBubbleProps {
  childName: string;
  recentStars?: StarRecord[];
  streak?: number;
  recentBadge?: {
    name: string;
    description: string;
  };
}

const AiAssistantBubble: React.FC<AiAssistantBubbleProps> = ({
  childName,
  recentStars,
  streak,
  recentBadge
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<{text: string; isUser: boolean}[]>([
    { text: `Hi ${childName}! I'm your learning assistant. How can I help you today?`, isUser: false },
  ]);
  const [inputValue, setInputValue] = useState("");

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const expandChat = () => {
    setIsMinimized(false);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      // Add user message
      setMessages([...messages, { text: inputValue, isUser: true }]);
      
      // Simulate AI response - in production, this would call the AI endpoint
      setTimeout(() => {
        let response = "I'm thinking about how to help you with that. Give me a moment...";
        
        if (inputValue.toLowerCase().includes("star") || inputValue.toLowerCase().includes("point")) {
          response = `You've earned ${recentStars?.length || 0} stars recently. Keep up the great work!`;
        } else if (inputValue.toLowerCase().includes("streak")) {
          response = `Your current learning streak is ${streak || 0} days. Amazing consistency!`;
        } else if (inputValue.toLowerCase().includes("badge")) {
          response = recentBadge 
            ? `Your most recent badge is "${recentBadge.name}"! ${recentBadge.description}` 
            : "You haven't earned any badges yet. Complete activities to earn your first one!";
        } else if (inputValue.toLowerCase().includes("help")) {
          response = "I can help you with your learning journey! You can ask me about your stars, badges, or what to learn next.";
        } else if (inputValue.toLowerCase().includes("learn") || inputValue.toLowerCase().includes("next")) {
          response = "I recommend trying the Phonics activity in English. It matches your current progress level!";
        }
        
        setMessages(prev => [...prev, { text: response, isUser: false }]);
      }, 1000);
      
      setInputValue("");
    }
  };

  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className={`mb-2 w-80 overflow-hidden transition-all duration-300 shadow-lg ${
          isMinimized ? 'h-16' : 'h-96'
        }`}>
          <div className="flex items-center justify-between bg-gradient-to-r from-primary to-indigo-600 p-3 text-white">
            <div className="flex items-center gap-2">
              <BrainCircuit size={18} />
              <span className="font-medium">Tutor Assistant</span>
              {isSpeaking && (
                <Badge variant="secondary" className="bg-white/20 text-xs">
                  Speaking...
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {isMinimized ? (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={expandChat}>
                  <ChevronUp size={16} />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={minimizeChat}>
                  <ChevronDown size={16} />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={toggleChat}>
                <X size={16} />
              </Button>
            </div>
          </div>
          
          {!isMinimized && (
            <>
              <div className="flex-1 p-3 overflow-y-auto bg-white h-64">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`mb-3 ${msg.isUser ? 'text-right' : ''}`}
                  >
                    <div 
                      className={`inline-block rounded-lg px-3 py-2 max-w-[80%] ${
                        msg.isUser 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-white border-t">
                <div className="flex mb-2">
                  <VoiceInteraction onSpeakingChange={handleSpeakingChange} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything..."
                    className="flex-1 border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button 
                    size="sm" 
                    className="rounded-full"
                    onClick={handleSend}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
      
      <Button
        onClick={toggleChat}
        className="rounded-full h-12 w-12 shadow-lg bg-gradient-to-r from-primary to-indigo-600"
        aria-label="Open AI tutor chat"
      >
        <MessageCircle size={24} />
      </Button>
    </div>
  );
};

export default AiAssistantBubble;
