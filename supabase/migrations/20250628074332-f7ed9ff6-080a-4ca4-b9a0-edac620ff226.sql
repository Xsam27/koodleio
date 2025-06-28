
-- Create a table for tutor conversations with analytics data
CREATE TABLE public.tutor_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  child_name TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  subject TEXT,
  key_stage TEXT,
  lesson_context JSONB,
  message_length INTEGER GENERATED ALWAYS AS (length(user_message)) STORED,
  response_length INTEGER GENERATED ALWAYS AS (length(ai_response)) STORED,
  session_id UUID,
  conversation_turn INTEGER DEFAULT 1,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.tutor_conversations ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own conversations
CREATE POLICY "Users can view their own tutor conversations" 
  ON public.tutor_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own conversations
CREATE POLICY "Users can create their own tutor conversations" 
  ON public.tutor_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_tutor_conversations_user_id ON public.tutor_conversations(user_id);
CREATE INDEX idx_tutor_conversations_created_at ON public.tutor_conversations(created_at);
CREATE INDEX idx_tutor_conversations_subject ON public.tutor_conversations(subject);
CREATE INDEX idx_tutor_conversations_session_id ON public.tutor_conversations(session_id);

-- Create a view for analytics dashboard
CREATE VIEW public.tutor_analytics AS
SELECT 
  user_id,
  child_name,
  subject,
  key_stage,
  COUNT(*) as total_conversations,
  AVG(message_length) as avg_message_length,
  AVG(response_length) as avg_response_length,
  AVG(response_time_ms) as avg_response_time,
  COUNT(DISTINCT session_id) as total_sessions,
  MAX(created_at) as last_conversation,
  DATE_TRUNC('day', created_at) as conversation_date
FROM public.tutor_conversations
GROUP BY user_id, child_name, subject, key_stage, DATE_TRUNC('day', created_at);

-- RLS for the analytics view
ALTER VIEW public.tutor_analytics SET (security_invoker = on);
