
export type KeyStage = 'KS1' | 'KS2' | 'KS3';

export type Subject = 'English' | 'Maths';

export interface User {
  id: string;
  email: string;
  name: string;
  children: ChildProfile[];
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  keyStage: KeyStage;
  avatarColor: string;
  progressData?: ProgressData;
}

export interface ProgressData {
  english: SubjectProgress;
  maths: SubjectProgress;
  lastUpdated: Date;
}

export interface SubjectProgress {
  overallScore: number; // 0-100
  topicsData: TopicProgress[];
  recentLessons: LessonSummary[];
  strengths: string[];
  weaknesses: string[];
}

export interface TopicProgress {
  name: string;
  score: number; // 0-100
  totalActivities: number;
  completedActivities: number;
}

export interface LessonSummary {
  id: string;
  title: string;
  subject: Subject;
  date: Date;
  score: number; // 0-100
  duration: number; // minutes
  topicsCovered: string[];
}

export interface Activity {
  id: string;
  type: ActivityType;
  difficulty: 1 | 2 | 3; // 1 = easy, 2 = medium, 3 = hard
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  hint?: string;
  explanation?: string;
  topic: string;
  keyStage: KeyStage;
  subjectArea: Subject;
}

export type ActivityType = 
  | 'multiple-choice' 
  | 'drag-and-drop' 
  | 'fill-in-blanks' 
  | 'match-pairs'
  | 'short-answer'
  | 'ordering';
