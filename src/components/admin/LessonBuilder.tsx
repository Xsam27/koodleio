
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, ChevronUp, ChevronDown, Plus, Edit, Copy } from 'lucide-react';
import { fetchSubjects } from '@/services/tutorService';
import { Lesson, LessonStep, createLesson, updateLesson } from '@/services/lessonService';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

interface LessonBuilderProps {
  initialLesson?: Partial<Lesson>;
  onSave?: (lessonId: string) => void;
}

interface StepOption {
  label: string;
  value: string;
}

const LessonBuilder: React.FC<LessonBuilderProps> = ({ initialLesson, onSave }) => {
  const [subjects, setSubjects] = useState<{ id: string; title: string }[]>([]);
  const [lesson, setLesson] = useState<Partial<Lesson>>(initialLesson || {
    title: '',
    description: '',
    subject_id: '',
    grade_level: 1,
    estimated_duration: 30,
    steps: [],
  });
  const [currentStep, setCurrentStep] = useState<Partial<LessonStep>>({
    id: '',
    title: '',
    content: '',
    type: 'text',
  });
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  
  // Fetch subjects
  useEffect(() => {
    const loadSubjects = async () => {
      const data = await fetchSubjects();
      setSubjects(data);
    };
    
    loadSubjects();
  }, []);
  
  const handleLessonChange = (field: string, value: any) => {
    setLesson(prev => ({ ...prev, [field]: value }));
  };
  
  const handleStepChange = (field: string, value: any) => {
    setCurrentStep(prev => ({ ...prev, [field]: value }));
  };
  
  const addStep = () => {
    if (!currentStep.title?.trim()) {
      toast({
        title: "Error",
        description: "Step title is required",
        variant: "destructive",
      });
      return;
    }
    
    const newStep = {
      ...currentStep,
      id: `step-${Date.now()}`,
    };
    
    setLesson(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep as LessonStep],
    }));
    
    // Reset current step
    setCurrentStep({
      id: '',
      title: '',
      content: '',
      type: 'text',
    });
  };
  
  const updateStep = () => {
    if (editingStepIndex === null) return;
    
    if (!currentStep.title?.trim()) {
      toast({
        title: "Error",
        description: "Step title is required",
        variant: "destructive",
      });
      return;
    }
    
    setLesson(prev => {
      const updatedSteps = [...(prev.steps || [])];
      updatedSteps[editingStepIndex] = {
        ...currentStep,
        id: updatedSteps[editingStepIndex].id,
      } as LessonStep;
      
      return {
        ...prev,
        steps: updatedSteps,
      };
    });
    
    // Reset current step and editing index
    setCurrentStep({
      id: '',
      title: '',
      content: '',
      type: 'text',
    });
    setEditingStepIndex(null);
  };
  
  const editStep = (index: number) => {
    const step = lesson.steps?.[index];
    if (step) {
      setCurrentStep(step);
      setEditingStepIndex(index);
    }
  };
  
  const removeStep = (index: number) => {
    setLesson(prev => {
      const updatedSteps = [...(prev.steps || [])];
      updatedSteps.splice(index, 1);
      return {
        ...prev,
        steps: updatedSteps,
      };
    });
    
    if (editingStepIndex === index) {
      setCurrentStep({
        id: '',
        title: '',
        content: '',
        type: 'text',
      });
      setEditingStepIndex(null);
    }
  };
  
  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (!lesson.steps || lesson.steps.length < 2) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= lesson.steps.length) return;
    
    setLesson(prev => {
      const updatedSteps = [...(prev.steps || [])];
      const [movedItem] = updatedSteps.splice(index, 1);
      updatedSteps.splice(newIndex, 0, movedItem);
      
      return {
        ...prev,
        steps: updatedSteps,
      };
    });
    
    if (editingStepIndex === index) {
      setEditingStepIndex(newIndex);
    } else if (editingStepIndex === newIndex) {
      setEditingStepIndex(index);
    }
  };
  
  const duplicateStep = (index: number) => {
    const step = lesson.steps?.[index];
    if (step) {
      const newStep = {
        ...step,
        id: `step-${Date.now()}`,
        title: `${step.title} (Copy)`,
      };
      
      setLesson(prev => ({
        ...prev,
        steps: [
          ...(prev.steps || []).slice(0, index + 1),
          newStep,
          ...(prev.steps || []).slice(index + 1),
        ],
      }));
    }
  };
  
  const handleSave = async () => {
    if (!lesson.title?.trim()) {
      toast({
        title: "Error",
        description: "Lesson title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!lesson.subject_id) {
      toast({
        title: "Error",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }
    
    if (!lesson.steps?.length) {
      toast({
        title: "Error",
        description: "At least one step is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      let lessonId;
      
      if (initialLesson?.id) {
        // Update existing lesson
        const success = await updateLesson(initialLesson.id, lesson);
        if (success) {
          lessonId = initialLesson.id;
          toast({
            title: "Success",
            description: "Lesson updated successfully",
          });
        }
      } else {
        // Create new lesson
        lessonId = await createLesson(lesson as Omit<Lesson, 'id' | 'created_at' | 'updated_at'>);
        if (lessonId) {
          toast({
            title: "Success",
            description: "Lesson created successfully",
          });
        }
      }
      
      if (lessonId && onSave) {
        onSave(lessonId);
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast({
        title: "Error",
        description: "Failed to save lesson",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialLesson?.id ? "Edit Lesson" : "Create New Lesson"}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Lesson Title</Label>
              <Input
                id="title"
                value={lesson.title || ''}
                onChange={(e) => handleLessonChange('title', e.target.value)}
                placeholder="Enter lesson title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={lesson.subject_id || ''}
                onValueChange={(value) => handleLessonChange('subject_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade Level</Label>
              <Select
                value={lesson.grade_level?.toString() || '1'}
                onValueChange={(value) => handleLessonChange('grade_level', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={lesson.estimated_duration || 30}
                onChange={(e) => handleLessonChange('estimated_duration', parseInt(e.target.value))}
                min={1}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={lesson.description || ''}
              onChange={(e) => handleLessonChange('description', e.target.value)}
              placeholder="Enter lesson description"
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <div className="border rounded-md p-4 space-y-4">
          <h3 className="text-lg font-medium">Lesson Steps</h3>
          
          {/* Step Editor */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="step-title">Step Title</Label>
                  <Input
                    id="step-title"
                    value={currentStep.title || ''}
                    onChange={(e) => handleStepChange('title', e.target.value)}
                    placeholder="Enter step title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="step-type">Step Type</Label>
                  <Select
                    value={currentStep.type || 'text'}
                    onValueChange={(value: 'text' | 'video' | 'quiz' | 'interactive') => handleStepChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Content</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="interactive">Interactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <Label htmlFor="step-content">Content</Label>
                <Textarea
                  id="step-content"
                  value={currentStep.content || ''}
                  onChange={(e) => handleStepChange('content', e.target.value)}
                  placeholder="Enter step content"
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentStep({
                      id: '',
                      title: '',
                      content: '',
                      type: 'text',
                    });
                    setEditingStepIndex(null);
                  }}
                >
                  Clear
                </Button>
                {editingStepIndex !== null ? (
                  <Button onClick={updateStep}>Update Step</Button>
                ) : (
                  <Button onClick={addStep}>Add Step</Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Steps List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Steps ({lesson.steps?.length || 0})</h4>
            
            {lesson.steps?.length === 0 && (
              <div className="text-center p-4 border border-dashed rounded-md">
                <p className="text-muted-foreground">Add steps to your lesson</p>
              </div>
            )}
            
            {lesson.steps?.map((step, index) => (
              <div 
                key={step.id} 
                className={`p-3 border rounded-md flex justify-between items-center ${
                  editingStepIndex === index ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div>
                  <div className="font-medium flex items-center">
                    <span className="mr-2">{index + 1}.</span>
                    {step.title}
                    <span className="ml-2 text-xs px-2 py-1 bg-muted rounded-full">{step.type}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === (lesson.steps?.length || 0) - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => editStep(index)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => duplicateStep(index)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeStep(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onSave?.(initialLesson?.id || '')}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {initialLesson?.id ? "Update Lesson" : "Create Lesson"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonBuilder;
