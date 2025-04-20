
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, HelpCircle, RefreshCw, XOctagon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { RealtimeChat } from '@/utils/RealtimeAudio';
import TutorAvatar from './TutorAvatar';

interface VoiceInteractionProps {
  onSpeakingChange: (speaking: boolean) => void;
}

const VoiceInteraction: React.FC<VoiceInteractionProps> = ({ onSpeakingChange }) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [chat, setChat] = useState<RealtimeChat | null>(null);

  const startVoiceInteraction = async () => {
    try {
      const newChat = new RealtimeChat((message) => {
        console.log('AI Response:', message);
        // Handle different message types from the AI
        if (message.type === 'response.audio.delta') {
          onSpeakingChange(true);
        } else if (message.type === 'response.audio.done') {
          onSpeakingChange(false);
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
      toast({
        title: "Error",
        description: "Could not start voice chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceInteraction = () => {
    if (chat) {
      chat.disconnect();
      setChat(null);
    }
    setIsListening(false);
    onSpeakingChange(false);
    toast({
      title: "Voice chat ended",
      description: "Your AI tutor is no longer listening.",
    });
  };

  const handleHint = () => {
    toast({
      title: "Hint",
      description: "Try breaking down the problem into smaller steps.",
    });
  };

  const handleTryAgain = () => {
    toast({
      title: "Try Again",
      description: "Don't worry! Everyone learns at their own pace.",
    });
  };

  const handleStuck = () => {
    toast({
      title: "Need Help?",
      description: "Let's go through this step by step together.",
    });
  };

  return (
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
          <XOctagon className="h-4 w-4" />
        </Button>

        <Button
          variant={isListening ? "destructive" : "default"}
          size="icon"
          onClick={isListening ? stopVoiceInteraction : startVoiceInteraction}
          className="rounded-full"
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default VoiceInteraction;
