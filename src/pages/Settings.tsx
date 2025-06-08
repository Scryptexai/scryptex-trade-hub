
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Bell, Palette, Wallet, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    trades: true,
    priceAlerts: true,
    newTokens: false,
    system: true,
  });

  const [preferences, setPreferences] = useState({
    theme: "dark",
    language: "en",
    currency: "usd",
    autoSlippage: true,
  });

  const { toast } = useToast();

  const saveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary">Manage your account preferences and security settings</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center space-x-1">
              <User size={16} />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-1">
              <Shield size={16} />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-1">
              <Bell size={16} />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-1">
              <Palette size={16} />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center space-x-1">
              <Wallet size={16} />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User size={20} />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-lg">JD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <Button variant="ghost" size="sm" className="text-error">Remove</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="john_trader" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" placeholder="Tell us about yourself..." />
                </div>

                <Button onClick={saveSettings} className="button-primary">
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <div className="space-y-4">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield size={20} />
                    <span>Security Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-text-primary">Two-Factor Authentication</h3>
                        <p className="text-sm text-text-secondary">Add an extra layer of security</p>
                      </div>
                      <Badge variant="outline" className="text-warning">Disabled</Badge>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-text-primary">Change Password</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                    </div>
                    <Button variant="outline">Update Password</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key size={20} />
                    <span>API Keys</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-text-secondary">
                      Generate API keys for automated trading and integrations
                    </p>
                    <Button variant="outline">Generate New API Key</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell size={20} />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-text-primary">Trade Notifications</h3>
                      <p className="text-sm text-text-secondary">Get notified about your trades</p>
                    </div>
                    <Switch 
                      checked={notifications.trades}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, trades: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-text-primary">Price Alerts</h3>
                      <p className="text-sm text-text-secondary">Alerts for token price changes</p>
                    </div>
                    <Switch 
                      checked={notifications.priceAlerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, priceAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-text-primary">New Token Listings</h3>
                      <p className="text-sm text-text-secondary">Notify about new tokens</p>
                    </div>
                    <Switch 
                      checked={notifications.newTokens}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newTokens: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-text-primary">System Updates</h3>
                      <p className="text-sm text-text-secondary">Important system notifications</p>
                    </div>
                    <Switch 
                      checked={notifications.system}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, system: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={saveSettings} className="button-primary">
                  Save Notifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette size={20} />
                  <span>Appearance & Display</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={preferences.currency} onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="jpy">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={saveSettings} className="button-primary">
                  Save Appearance
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Settings */}
          <TabsContent value="wallet">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet size={20} />
                  <span>Wallet & Trading</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-text-primary">Auto Slippage</h3>
                      <p className="text-sm text-text-secondary">Automatically adjust slippage for trades</p>
                    </div>
                    <Switch 
                      checked={preferences.autoSlippage}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoSlippage: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Default Slippage (%)</Label>
                    <Input type="number" defaultValue="1" min="0.1" max="10" step="0.1" />
                  </div>

                  <div className="space-y-2">
                    <Label>Gas Price Preference</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">Slow (Lower fees)</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="fast">Fast (Higher fees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={saveSettings} className="button-primary">
                  Save Wallet Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
