
import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchUserNotifications, markNotificationAsRead, scheduleReminder } from '@/services/userService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

interface NotificationCenterProps {
  userId: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  
  useEffect(() => {
    const loadNotifications = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const data = await fetchUserNotifications(userId);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
    
    // Set up polling for new notifications
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [userId]);
  
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update UI
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const handleScheduleReminder = async () => {
    if (!reminderTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reminder title",
        variant: "destructive",
      });
      return;
    }
    
    if (!reminderDate || !reminderTime) {
      toast({
        title: "Error",
        description: "Please select a date and time",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const scheduledDateTime = new Date(`${reminderDate}T${reminderTime}`);
      
      if (scheduledDateTime <= new Date()) {
        toast({
          title: "Error",
          description: "Please select a future date and time",
          variant: "destructive",
        });
        return;
      }
      
      const success = await scheduleReminder(
        userId,
        reminderTitle,
        reminderMessage || "Time to study!",
        scheduledDateTime
      );
      
      if (success) {
        setReminderTitle('');
        setReminderMessage('');
        setReminderDate('');
        setReminderTime('');
        
        // Refetch notifications
        const data = await fetchUserNotifications(userId);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      toast({
        title: "Error",
        description: "Failed to schedule reminder",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <Tabs defaultValue="notifications">
          <div className="border-b px-3">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="notifications" className="text-sm">
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 text-xs">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reminders" className="text-sm">
                Set Reminder
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="notifications" className="focus:outline-none">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : notifications.length > 0 ? (
              <ScrollArea className="max-h-[300px]">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border-b last:border-b-0 ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notification.content}</p>
                    {!notification.read && (
                      <div className="flex justify-end mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          Mark as Read
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
            ) : (
              <div className="py-8 text-center">
                <Bell className="h-10 w-10 text-muted-foreground opacity-20 mx-auto mb-2" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reminders" className="p-4 focus:outline-none space-y-4">
            <h4 className="text-sm font-medium">Schedule a Study Reminder</h4>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="title" className="text-xs font-medium mb-1 block">
                  Reminder Title
                </label>
                <Input
                  id="title"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder="Time to study!"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="text-xs font-medium mb-1 block">
                  Message (optional)
                </label>
                <Input
                  id="message"
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  placeholder="Don't forget your lesson today!"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="date" className="text-xs font-medium mb-1 block">
                    Date
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="time" className="text-xs font-medium mb-1 block">
                    Time
                  </label>
                  <Input
                    id="time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                </div>
              </div>
              
              <Button className="w-full" onClick={handleScheduleReminder}>
                Schedule Reminder
              </Button>
            </div>
            
            <Separator />
            
            <div className="text-xs text-muted-foreground">
              <p>Reminders will appear as notifications at the scheduled time.</p>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
