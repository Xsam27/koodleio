
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";

interface TutorAvatarProps {
  isActive: boolean;
  className?: string;
}

const TutorAvatar: React.FC<TutorAvatarProps> = ({ isActive, className }) => {
  return (
    <div className={`relative ${className}`}>
      <Avatar 
        className={`h-12 w-12 bg-primary/10 ring-2 transition-all duration-300 ${
          isActive ? 'ring-primary scale-110' : 'ring-gray-200'
        }`}
      >
        <AvatarFallback 
          className={`bg-primary/10 transition-colors duration-300 ${
            isActive ? 'text-primary' : 'text-gray-400'
          }`}
        >
          <MessageSquare className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      {isActive && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white animate-pulse" />
      )}
    </div>
  );
};

export default TutorAvatar;
