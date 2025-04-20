import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, HelpCircle, RefreshCw, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { RealtimeChat } from '@/utils/RealtimeAudio';
import TutorAvatar from './TutorAvatar';
import TutorFeedback from './TutorFeedback';

interface VoiceInteractionProps {
  onSpeakingChange: (speaking: boolean) => void;
}

const VoiceInteraction: React.FC<VoiceInteractionProps> = ({ onSpeakingChange }) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chat, setChat] = useState<RealtimeChat | null>(null);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'hint', message: string } | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const startVoiceInteraction = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      toast({
        title: "Starting voice chat",
        description: "Connecting to AI tutor...",
      });

      const newChat = new RealtimeChat((message) => {
        console.log('AI Response:', message);
        
        // Handle different message types from the AI
        if (message.type === 'response.audio.delta') {
          onSpeakingChange(true);
        } else if (message.type === 'response.audio.done') {
          onSpeakingChange(false);
        } else if (message.type === 'response.audio_transcript.delta' && message.delta) {
          setLastMessage(prev => prev + message.delta);
        } else if (message.type === 'response.audio_transcript.done') {
          console.log('Full transcript:', lastMessage);
        }
      });

      await newChat.init();
      setChat(newChat);
      setIsListening(true);
      
      toast({
        title: "Voice chat started",
        description: "You can now talk to your AI tutor!",
      });
    } catch (error) {
      console.error('Error starting voice chat:', error);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: "Error",
        description: "Could not start voice chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const stopVoiceInteraction = () => {
    if (chat) {
      chat.disconnect();
      setChat(null);
    }
    setIsListening(false);
    setLastMessage("");
    onSpeakingChange(false);
    toast({
      title: "Voice chat ended",
      description: "Your AI tutor is no longer listening.",
    });
  };

  useEffect(() => {
    return () => {
      if (chat) {
        chat.disconnect();
      }
    };
  }, [chat]);

  const handleHint = () => {
    setFeedback({
      type: 'hint',
      message: "Try breaking this problem into smaller steps. What do you know so far?"
    });
    toast({
      title: "Hint",
      description: "Let's think about this step by step.",
    });
  };

  const handleTryAgain = () => {
    setFeedback({
      type: 'error',
      message: "That's okay! Learning takes practice. Let's try a different approach."
    });
    toast({
      title: "Try Again",
      description: "Everyone learns at their own pace.",
    });
  };

  const handleStuck = () => {
    setFeedback({
      type: 'hint',
      message: "Don't worry! Let's review this topic together and find what's confusing."
    });
    toast({
      title: "Need Help?",
      description: "Let's break this down step by step.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <TutorAvatar isActive={isListening} />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleHint}
            className="rounded-full"
            title="I need a hint"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleTryAgain}
            className="rounded-full"
            title="Try again"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleStuck}
            className="rounded-full"
            title="I'm stuck"
          >
            <XCircle className="h-4 w-4" />
          </Button>

          <Button
            variant={isListening ? "destructive" : "default"}
            size="icon"
            onClick={isListening ? stopVoiceInteraction : startVoiceInteraction}
            className="rounded-full"
            disabled={isConnecting}
            title={isListening ? "Stop voice chat" : "Start voice chat"}
          >
            {isConnecting ? (
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {feedback && (
        <TutorFeedback
          type={feedback.type}
          message={feedback.message}
          className="mt-4"
        />
      )}

      {connectionError && (
        <div className="text-xs text-red-500 mt-2">
          {connectionError.includes("Failed to get session URL") ? 
            "OpenAI API key may be invalid or missing" : 
            connectionError}
        </div>
      )}
    </div>
  );
};

export default VoiceInteraction;
