
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, User, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  
  const [profileForm, setProfileForm] = useState({
    name: "John Smith",
    email: "john@example.com",
    phone: "+1234567890",
    bio: "Student at Tech University, passionate about computer science and innovation.",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    application: true,
    updates: false,
    marketing: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationToggle = (key: string) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key as keyof typeof notificationSettings]
    });
  };

  const handlePrivacyChange = (key: string, value: any) => {
    setPrivacySettings({
      ...privacySettings,
      [key]: value
    });
  };

  const saveProfileChanges = () => {
    // In a real application, this would send the data to an API
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const saveNotificationChanges = () => {
    toast({
      title: "Notification preferences saved",
      description: "Your notification settings have been updated.",
    });
  };

  const savePrivacyChanges = () => {
    toast({
      title: "Privacy settings updated",
      description: "Your privacy settings have been saved successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="container max-w-4xl animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-3 gap-2">
            <TabsTrigger value="profile" className="flex gap-2 items-center">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex gap-2 items-center">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex gap-2 items-center">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and how it appears on your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      rows={3}
                      className="min-h-[80px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveProfileChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications from EduFuture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important notifications via email
                      </p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={notificationSettings.email}
                      onCheckedChange={() => handleNotificationToggle('email')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="application-notifications">Application Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about changes to your applications
                      </p>
                    </div>
                    <Switch 
                      id="application-notifications" 
                      checked={notificationSettings.application}
                      onCheckedChange={() => handleNotificationToggle('application')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="updates-notifications">Platform Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Stay informed about new features and improvements
                      </p>
                    </div>
                    <Switch 
                      id="updates-notifications" 
                      checked={notificationSettings.updates}
                      onCheckedChange={() => handleNotificationToggle('updates')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-notifications">Marketing</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new educational opportunities
                      </p>
                    </div>
                    <Switch 
                      id="marketing-notifications" 
                      checked={notificationSettings.marketing}
                      onCheckedChange={() => handleNotificationToggle('marketing')}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveNotificationChanges}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control who can see your information and how it's shared
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-3">
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <Select 
                      defaultValue={privacySettings.profileVisibility}
                      onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                    >
                      <SelectTrigger id="profile-visibility">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can view your profile</SelectItem>
                        <SelectItem value="connections">Connections - Only your connections</SelectItem>
                        <SelectItem value="private">Private - Only you</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="block mb-3">Contact Information</Label>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="show-email" className="font-normal">Show Email on Profile</Label>
                        </div>
                        <Switch 
                          id="show-email" 
                          checked={privacySettings.showEmail}
                          onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="show-phone" className="font-normal">Show Phone Number</Label>
                        </div>
                        <Switch 
                          id="show-phone" 
                          checked={privacySettings.showPhone}
                          onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="block mb-3">Activity Sharing</Label>
                    <div className="flex flex-wrap gap-2">
                      <Toggle variant="outline">Application Updates</Toggle>
                      <Toggle variant="outline">Course Completions</Toggle>
                      <Toggle variant="outline">Achievements</Toggle>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={savePrivacyChanges}>Save Privacy Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
