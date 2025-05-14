
import React, { useState, useEffect } from 'react';
import { askTutor, fetchUserMessages, fetchSubjects } from '@/services/tutorService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';

interface TutorChatProps {
  userId: string;
  gradeLevel?: number;
}

interface Message {
  id: string;
  message: string;
  response: string;
  timestamp: string;
}

interface Subject {
  id: string;
  title: string;
}

const TutorChat: React.FC<TutorChatProps> = ({ userId, gradeLevel }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    // Fetch message history on component mount
    const loadMessages = async () => {
      const userMessages = await fetchUserMessages(userId);
      const messagesWithIds = userMessages.map((msg, index) => ({
        ...msg,
        id: `msg-${index}`,
      }));
      setMessages(messagesWithIds);
    };

    // Fetch available subjects
    const loadSubjects = async () => {
      const subjectsData = await fetchSubjects(gradeLevel);
      setSubjects(subjectsData);
    };

    loadMessages();
    loadSubjects();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          setMessages((prevMessages) => [
            {
              id: newMessage.id,
              message: newMessage.message,
              response: newMessage.response,
              timestamp: newMessage.timestamp,
            },
            ...prevMessages,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, gradeLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const result = await askTutor(userId, question, selectedSubject || undefined);
      
      // We don't need to add the message here as it will come through the real-time subscription
      // But we'll clear the input
      setQuestion('');
    } catch (error) {
      console.error('Failed to send question:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">AI Tutor Assistant</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Subject selector */}
        {subjects.length > 0 && (
          <div className="w-full">
            <Select
              value={selectedSubject || ''}
              onValueChange={(value) => setSelectedSubject(value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subject (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific subject</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Messages history */}
        <div className="space-y-4 max-h-96 overflow-y-auto flex flex-col-reverse">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-semibold">You asked:</p>
                <p>{msg.message}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="font-semibold">Tutor:</p>
                <p>{msg.response}</p>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        
        {/* Question input form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your question here..."
            className="min-h-[100px] w-full"
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner className="mr-2" /> : null}
            {loading ? 'Thinking...' : 'Ask Question'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TutorChat;
