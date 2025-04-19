
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { RealtimeChat } from '@/utils/RealtimeAudio';

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

  return (
    <Button
      variant={isListening ? "destructive" : "default"}
      size="icon"
      onClick={isListening ? stopVoiceInteraction : startVoiceInteraction}
      className="rounded-full"
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};

export default VoiceInteraction;
