"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Settings, Bell, Shield, Users, FileText, Calendar } from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    notificationFrequency: 'instant' | 'daily' | 'weekly';
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionTimeout: number;
    twoFactorAuth: boolean;
  };
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { toast } = useToast();

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [token, toast]);

  const handleSaveSettings = async () => {
    if (!token || !settings) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast({
        title: 'Success',
        description: 'Settings have been saved successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push('/dashboard/admin')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Admin Dashboard
      </Button>

      <DashboardHeader
        heading="System Settings"
        description="Configure system-wide settings and preferences"
        icon={Settings}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings?.general.siteName || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    general: { ...prev!.general, siteName: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  value={settings?.general.siteDescription || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    general: { ...prev!.general, siteDescription: e.target.value }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <Switch
                  id="maintenanceMode"
                  checked={settings?.general.maintenanceMode || false}
                  onCheckedChange={(checked: boolean) => setSettings(prev => ({
                    ...prev!,
                    general: { ...prev!.general, maintenanceMode: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="registrationEnabled">User Registration</Label>
                <Switch
                  id="registrationEnabled"
                  checked={settings?.general.registrationEnabled || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev!,
                    general: { ...prev!.general, registrationEnabled: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Switch
                  id="emailNotifications"
                  checked={settings?.notifications.emailNotifications || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev!,
                    notifications: { ...prev!.notifications, emailNotifications: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <Switch
                  id="pushNotifications"
                  checked={settings?.notifications.pushNotifications || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev!,
                    notifications: { ...prev!.notifications, pushNotifications: checked }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notificationFrequency">Notification Frequency</Label>
                <Select
                  value={settings?.notifications.notificationFrequency || 'instant'}
                  onValueChange={(value: 'instant' | 'daily' | 'weekly') => setSettings(prev => ({
                    ...prev!,
                    notifications: { ...prev!.notifications, notificationFrequency: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure system security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
                <Input
                  id="minPasswordLength"
                  type="number"
                  value={settings?.security.passwordPolicy.minLength || 8}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    security: {
                      ...prev!.security,
                      passwordPolicy: {
                        ...prev!.security.passwordPolicy,
                        minLength: parseInt(e.target.value)
                      }
                    }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                <Switch
                  id="requireUppercase"
                  checked={settings?.security.passwordPolicy.requireUppercase || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev!,
                    security: {
                      ...prev!.security,
                      passwordPolicy: {
                        ...prev!.security.passwordPolicy,
                        requireUppercase: checked
                      }
                    }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requireNumbers">Require Numbers</Label>
                <Switch
                  id="requireNumbers"
                  checked={settings?.security.passwordPolicy.requireNumbers || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev!,
                    security: {
                      ...prev!.security,
                      passwordPolicy: {
                        ...prev!.security.passwordPolicy,
                        requireNumbers: checked
                      }
                    }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                <Switch
                  id="requireSpecialChars"
                  checked={settings?.security.passwordPolicy.requireSpecialChars || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev!,
                    security: {
                      ...prev!.security,
                      passwordPolicy: {
                        ...prev!.security.passwordPolicy,
                        requireSpecialChars: checked
                      }
                    }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings?.security.sessionTimeout || 30}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    security: {
                      ...prev!.security,
                      sessionTimeout: parseInt(e.target.value)
                    }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                <Switch
                  id="twoFactorAuth"
                  checked={settings?.security.twoFactorAuth || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev!,
                    security: {
                      ...prev!.security,
                      twoFactorAuth: checked
                    }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button
          className="w-full"
          onClick={handleSaveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </DashboardShell>
  );
} 