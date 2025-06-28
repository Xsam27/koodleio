
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Brain, Lightbulb, ThumbsUp } from 'lucide-react';
import { sendMessageToGeminiSocraticTutor, ConversationMessage, generateSessionId } from '@/services/aiService';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import VoiceInteraction from './VoiceInteraction';

interface SocraticTutorChatProps {
  childName: string;
  childAge?: number;
  keyStage?: string;
  subject?: string;
  lessonContext?: {
    lessonId: string;
    stepId: string;
    stepTitle: string;
    stepContent: string;
  };
  userId?: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'question' | 'guidance' | 'encouragement';
}

const SocraticTutorChat: React.FC<SocraticTutorChatProps> = ({
  childName,
  childAge = 7,
  keyStage = "KS1",
  subject,
  lessonContext,
  userId
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `Hi ${childName}! I'm Astro, your learning companion. Instead of giving you answers, I'll help you discover them yourself. What would you like to explore today? 🚀`,
      isUser: false,
      timestamp: new Date(),
      type: 'encouragement'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [sessionId] = useState(() => generateSessionId()); // Generate session ID once per component
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getMessageType = (text: string): 'question' | 'guidance' | 'encouragement' => {
    if (text.includes('?')) return 'question';
    if (text.includes('think') || text.includes('consider') || text.includes('What if')) return 'guidance';
    return 'encouragement';
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'question': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'guidance': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'encouragement': return <ThumbsUp className="h-4 w-4 text-green-500" />;
      default: return <Brain className="h-4 w-4 text-purple-500" />;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    try {
      const response = await sendMessageToGeminiSocraticTutor(
        userMessage.text,
        {
          name: childName,
          age: childAge,
          keyStage,
          subject
        },
        conversationHistory,
        lessonContext,
        userId,
        sessionId // Pass the session ID for conversation tracking
      );
      
      if (response.error) {
        console.error("Error from Gemini service:", response.error);
        toast({
          title: "Oops!",
          description: "I had trouble thinking. Let's try again!",
          variant: "destructive"
        });
      }
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        type: getMessageType(response.response)
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation history for context
      const newConversation: ConversationMessage = {
        message: userMessage.text,
        response: response.response,
        timestamp: response.timestamp || new Date().toISOString()
      };
      
      setConversationHistory(prev => [...prev.slice(-4), newConversation]);
      
      // Show response time if available (for debugging/analytics)
      if (response.responseTime && response.responseTime > 2000) {
        console.log(`Response took ${response.responseTime}ms`);
      }
      
    } catch (error) {
      console.error("Error in Socratic chat:", error);
      
      const fallbackMessage: Message = {
        id: `error-${Date.now()}`,
        text: "I'm having a little trouble right now. Can we try again?",
        isUser: false,
        timestamp: new Date(),
        type: 'encouragement'
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Astro - Your Socratic Learning Guide
          {isSpeaking && (
            <Badge variant="secondary" className="bg-white/20 text-xs">
              Speaking...
            </Badge>
          )}
        </CardTitle>
        {lessonContext && (
          <div className="text-sm bg-white/20 rounded p-2">
            <strong>Learning:</strong> {lessonContext.stepTitle}
          </div>
        )}
        <div className="text-xs bg-white/10 rounded p-1 text-center">
          Session: Learning Analytics Enabled
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.isUser 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                {!msg.isUser && (
                  <div className="flex items-center gap-2 mb-1">
                    {getMessageIcon(msg.type)}
                    <span className="text-xs font-medium text-gray-500">
                      {msg.type === 'question' ? 'Guiding Question' : 
                       msg.type === 'guidance' ? 'Think About This' : 
                       'Encouragement'}
                    </span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className={`text-xs mt-1 ${msg.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2">
                <div className="animate-pulse">Astro is thinking...</div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t p-4 space-y-3">
          <div className="flex justify-center">
            <VoiceInteraction onSpeakingChange={setIsSpeaking} />
          </div>
          
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts or ask a question..."
              className="flex-1 min-h-[80px] resize-none"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              {isLoading ? <Spinner size="sm" /> : 'Send'}
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Astro will guide you to discover answers through questions and thinking
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocraticTutorChat;
