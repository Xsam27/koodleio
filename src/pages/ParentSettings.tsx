
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from "@/hooks/use-toast";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Bell, Users, Settings, Calendar, BookOpen } from 'lucide-react';

const ParentSettings = () => {
  const [notifyDaily, setNotifyDaily] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [workloadPreference, setWorkloadPreference] = useState('medium');

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-6 bg-softgray/30">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Parent Settings</h1>

          <Tabs defaultValue="children">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="children" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Children</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Learning Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
            </TabsList>

            {/* Children Management Tab */}
            <TabsContent value="children">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Children</CardTitle>
                    <CardDescription>Modify your children's profiles and learning settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12" style={{ backgroundColor: "#9b87f5" }}>
                          <AvatarFallback>E</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Emma</p>
                          <p className="text-sm text-neutralgray">Age 7 • KS1</p>
                        </div>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12" style={{ backgroundColor: "#6fb4e6" }}>
                          <AvatarFallback>J</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Jack</p>
                          <p className="text-sm text-neutralgray">Age 10 • KS2</p>
                        </div>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>
                    
                    <Button className="w-full">Add New Child</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Learning Preferences</CardTitle>
                    <CardDescription>Set default learning preferences for all children.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Default Daily Workload</h3>
                      <RadioGroup value={workloadPreference} onValueChange={setWorkloadPreference} className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="light" />
                          <Label htmlFor="light">Light (15-20 minutes)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <Label htmlFor="medium">Medium (30-40 minutes)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="heavy" id="heavy" />
                          <Label htmlFor="heavy">Heavy (45-60 minutes)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Curriculum Focus</h3>
                      <Select defaultValue="balanced">
                        <SelectTrigger>
                          <SelectValue placeholder="Select focus" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English Focus</SelectItem>
                          <SelectItem value="maths">Maths Focus</SelectItem>
                          <SelectItem value="balanced">Balanced (50/50)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-neutralgray mt-1">This determines the balance of subjects in daily tasks.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Child Progress Reports</CardTitle>
                  <CardDescription>View detailed progress reports for each child.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Emma's Progress Report</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">Weekly Report</Button>
                      <Button variant="outline" size="sm">Monthly Report</Button>
                      <Button variant="default" size="sm">Full Assessment</Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Jack's Progress Report</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">Weekly Report</Button>
                      <Button variant="outline" size="sm">Monthly Report</Button>
                      <Button variant="default" size="sm">Full Assessment</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage how and when you receive notifications about your child's learning.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Email Notifications</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Daily Learning Reminders</p>
                        <p className="text-sm text-neutralgray">Receive a daily reminder of pending tasks.</p>
                      </div>
                      <Switch checked={notifyDaily} onCheckedChange={setNotifyDaily} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Progress Report</p>
                        <p className="text-sm text-neutralgray">Receive weekly summaries of learning progress.</p>
                      </div>
                      <Switch checked={notifyWeekly} onCheckedChange={setNotifyWeekly} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Achievement Alerts</p>
                        <p className="text-sm text-neutralgray">Get notified when your child earns badges or completes milestones.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Push Notifications</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable Push Notifications</p>
                        <p className="text-sm text-neutralgray">Allow browser notifications for important alerts.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Notification Email</h3>
                    <Input type="email" placeholder="parent@example.com" defaultValue="parent@example.com" />
                    <p className="text-xs text-neutralgray">All notifications will be sent to this email address.</p>
                  </div>
                  
                  <Button onClick={handleSaveSettings}>Save Notification Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Schedule</CardTitle>
                  <CardDescription>Set up when your children should study during the week.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Emma's Schedule</h3>
                      <div className="grid grid-cols-7 gap-2 text-center">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <div key={day} className="flex flex-col items-center">
                            <p className="font-medium mb-2">{day}</p>
                            <div className="h-20 w-full bg-gray-100 rounded-md flex items-center justify-center cursor-pointer hover:bg-softpurple/20 border border-gray-200">
                              <span className="text-xs">After School</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Jack's Schedule</h3>
                      <div className="grid grid-cols-7 gap-2 text-center">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <div key={day} className="flex flex-col items-center">
                            <p className="font-medium mb-2">{day}</p>
                            <div className="h-20 w-full bg-gray-100 rounded-md flex items-center justify-center cursor-pointer hover:bg-softblue/20 border border-gray-200">
                              <span className="text-xs">Evening</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Reminder Settings</h3>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue placeholder="Reminder time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes before</SelectItem>
                          <SelectItem value="30">30 minutes before</SelectItem>
                          <SelectItem value="60">1 hour before</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-neutralgray">How long before the scheduled time to send reminders.</p>
                    </div>
                    
                    <Button onClick={handleSaveSettings}>Save Schedule Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account details and subscription.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input id="fullname" defaultValue="Jane Smith" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="jane@example.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Subscription Plan</h3>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-blue-800">Premium Family Plan</p>
                          <p className="text-sm text-blue-600">Up to 4 child profiles • All features included</p>
                        </div>
                        <Button variant="outline">Manage Plan</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Password</h3>
                    <Button variant="outline" className="w-full">Change Password</Button>
                  </div>
                  
                  <Button onClick={handleSaveSettings}>Save Account Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ParentSettings;
