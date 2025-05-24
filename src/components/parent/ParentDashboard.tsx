
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserPlus, User, Book, BarChart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { fetchChildProfiles, addChildToParent, removeChildFromParent } from '@/services/userService';
import StudentProgressDashboard from '@/components/dashboard/StudentProgressDashboard';

interface ParentDashboardProps {
  userId: string;
  userName?: string;
}

interface ChildProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  grade_level?: number;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ userId, userName = "Parent" }) => {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingChild, setAddingChild] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Load children profiles
  useEffect(() => {
    const loadChildren = async () => {
      setLoading(true);
      try {
        const childrenData = await fetchChildProfiles(userId);
        setChildren(childrenData);
      } catch (error) {
        console.error('Error loading children profiles:', error);
        toast({
          title: 'Error',
          description: 'Failed to load children profiles',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadChildren();
  }, [userId]);
  
  const handleAddChild = async () => {
    if (!childEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }
    
    setAddingChild(true);
    try {
      const success = await addChildToParent(userId, childEmail);
      if (success) {
        // Refresh children list
        const childrenData = await fetchChildProfiles(userId);
        setChildren(childrenData);
        setChildEmail('');
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding child:', error);
    } finally {
      setAddingChild(false);
    }
  };
  
  const handleRemoveChild = async (childId: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this child from your account?');
    if (!confirmed) return;
    
    try {
      const success = await removeChildFromParent(userId, childId);
      if (success) {
        // Update children list by filtering out the removed child
        setChildren(children.filter(child => child.id !== childId));
        
        // If the removed child was selected, reset selection
        if (selectedChild === childId) {
          setSelectedChild(null);
        }
      }
    } catch (error) {
      console.error('Error removing child:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove child',
        variant: 'destructive',
      });
    }
  };
  
  const generateInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const childColors = [
    'bg-red-100 text-red-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-yellow-100 text-yellow-800',
    'bg-pink-100 text-pink-800',
  ];
  
  if (loading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your children's educational progress
          </p>
        </div>
        
        {/* Add Child Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Child Account</DialogTitle>
              <DialogDescription>
                Enter your child's email address to link their account to your parent account.
                They must have an existing student account.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Child's Email Address</Label>
                <Input
                  id="email"
                  placeholder="student@example.com"
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddChild} disabled={addingChild}>
                {addingChild ? <Spinner className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Add Child
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {children.length === 0 ? (
        // No children yet
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Children Accounts Linked</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Add your child's student account to monitor their progress and help them learn.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Child Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Children Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {children.map((child, index) => (
              <Card 
                key={child.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedChild === child.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedChild(child.id)}
              >
                <CardContent className="p-6 flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={childColors[index % childColors.length]}>
                      {generateInitials(child.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-medium">{child.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {child.grade_level ? `Grade ${child.grade_level}` : 'Student'}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveChild(child.id);
                    }}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Child Dashboard */}
          {selectedChild ? (
            <div className="mt-6">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>
                    {children.find(c => c.id === selectedChild)?.name}'s Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <StudentProgressDashboard 
                    userId={userId}
                    studentId={selectedChild}
                    userName={children.find(c => c.id === selectedChild)?.name}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Child to View Progress</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Click on one of your children's cards above to view their detailed learning progress.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
