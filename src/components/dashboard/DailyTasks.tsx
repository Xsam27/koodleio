
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Circle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Subject } from "@/types";

interface Task {
  id: string;
  title: string;
  subject: Subject;
  completed: boolean;
  duration: number; // minutes
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface DailyTasksProps {
  tasks: Task[];
  date: Date;
  tasksCompleted: number;
  totalTasks: number;
}

const DailyTasks: React.FC<DailyTasksProps> = ({
  tasks,
  date,
  tasksCompleted,
  totalTasks
}) => {
  const formattedDate = date.toLocaleDateString('en-GB', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long'
  });
  
  const completionPercentage = Math.round((tasksCompleted / totalTasks) * 100);
  
  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 text-green-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'hard': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  
  // Get subject badge color
  const getSubjectColor = (subject: string) => {
    return subject === 'English' 
      ? 'bg-softpurple text-primary'
      : 'bg-softblue text-skyblue';
  };
  
  return (
    <Card className="hover-grow mb-8">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Learning Tasks
          </CardTitle>
          <span className="text-sm text-neutralgray">{formattedDate}</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Daily progress</span>
            <span className="text-sm font-medium">{tasksCompleted}/{totalTasks} complete</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
        
        <div className="space-y-3">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`flex items-center justify-between p-3 rounded-lg border ${
                task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {task.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 shrink-0" />
                )}
                <div>
                  <p className={`font-medium ${task.completed ? 'text-gray-500' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className={getSubjectColor(task.subject)}>
                      {task.subject}
                    </Badge>
                    <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                      {task.difficulty}
                    </Badge>
                    <span className="text-xs flex items-center gap-1 text-gray-500">
                      <Clock className="h-3 w-3" /> {task.duration} min
                    </span>
                  </div>
                </div>
              </div>
              
              {!task.completed && (
                <Link to={`/lesson/${task.subject.toLowerCase()}`}>
                  <Button size="sm" variant={task.subject === 'English' ? 'default' : 'outline'}>
                    Start
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
        
        {tasksCompleted === totalTasks ? (
          <div className="mt-4 text-center p-3 bg-green-50 rounded-lg">
            <p className="text-green-600 font-medium">
              Amazing job! You've completed all tasks for today! 🎉
            </p>
          </div>
        ) : (
          <div className="mt-4 text-center">
            <Button className="w-full">View All Tasks</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyTasks;
