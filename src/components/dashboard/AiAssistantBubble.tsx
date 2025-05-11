
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, MinusCircle, BrainCircuit, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRecord, EarnedBadge } from "@/services/gamificationService";
import { sendMessageToTutorAI } from "@/services/aiService";
import { Spinner } from "@/components/ui/spinner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import VoiceInteraction from "@/components/learning/VoiceInteraction";

interface AiAssistantBubbleProps {
  childName: string;
  childAge?: number;
  keyStage?: string;
  recentStars?: StarRecord[];
  streak?: number;
  badges?: EarnedBadge[];
  subject?: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AiAssistantBubble: React.FC<AiAssistantBubbleProps> = ({
  childName,
  childAge = 7,
  keyStage = "KS1",
  recentStars = [],
  streak = 0,
  badges = [],
  subject
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "welcome",
      text: `Hi ${childName}! I'm your tutor Astro. How can I help you today?`, 
      isUser: false,
      timestamp: new Date()
    },
  ]);

  const { toast } = useToast();
  
  // Reference to auto-scroll to bottom
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

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
    setTimeout(scrollToBottom, 100);
  };

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      setIsLoading(true);
      
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        text: inputValue.trim(),
        isUser: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputValue("");
      
      try {
        // Send to AI and get response
        const response = await sendMessageToTutorAI(
          userMessage.text,
          {
            name: childName,
            age: childAge,
            keyStage,
            recentStars,
            badges,
            streak,
            subject
          }
        );
        
        if (response.error) {
          console.error("Error from AI service:", response.error);
          toast({
            title: "Oops!",
            description: "I had trouble thinking. Let's try again!",
            variant: "destructive"
          });
        }
        
        // Add AI response
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          text: response.response,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error("Error in AI chat:", error);
        
        // Add fallback message if something goes wrong
        const fallbackMessage: Message = {
          id: `error-${Date.now()}`,
          text: "Sorry, I'm having a little trouble right now. Can we try again?",
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
  };

  return (
    <>
      {/* Mobile chat (Sheet component for small screens) */}
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-lg bg-gradient-to-r from-primary to-indigo-600"
              aria-label="Open AI tutor chat"
            >
              <MessageCircle size={24} />
            </Button>
          </SheetTrigger>
          
          <SheetContent className="w-full h-[80vh] p-0 flex flex-col">
            <div className="flex items-center justify-between bg-gradient-to-r from-primary to-indigo-600 p-3 text-white">
              <div className="flex items-center gap-2">
                <BrainCircuit size={18} />
                <span className="font-medium">Astro - Your Tutor</span>
                {isSpeaking && (
                  <Badge variant="secondary" className="bg-white/20 text-xs">
                    Speaking...
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto bg-white">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
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
                  <div className="text-xs text-gray-500 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-pulse">Thinking</div>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
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
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isLoading}
                />
                <Button 
                  size="sm" 
                  className="rounded-full flex items-center gap-1"
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                >
                  {isLoading ? <Spinner size="sm" /> : <Send size={16} />}
                  Send
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop chat bubble */}
      <div className="hidden sm:block fixed bottom-4 right-4 z-50 flex flex-col items-end">
        {isOpen && (
          <Card className={`mb-2 w-80 overflow-hidden transition-all duration-300 shadow-lg ${
            isMinimized ? 'h-16' : 'h-[450px]'
          }`}>
            <div className="flex items-center justify-between bg-gradient-to-r from-primary to-indigo-600 p-3 text-white">
              <div className="flex items-center gap-2">
                <BrainCircuit size={18} />
                <span className="font-medium">Astro - Your Tutor</span>
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
                <div className="flex-1 p-3 overflow-y-auto bg-white h-[320px]">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
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
                      <div className="text-xs text-gray-500 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="animate-pulse">Thinking</div>
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
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
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="flex-1 border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      disabled={isLoading}
                    />
                    <Button 
                      size="sm" 
                      className="rounded-full flex items-center gap-1"
                      onClick={handleSend}
                      disabled={isLoading || !inputValue.trim()}
                    >
                      {isLoading ? <Spinner size="sm" /> : <Send size={16} />}
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
    </>
  );
};

export default AiAssistantBubble;
