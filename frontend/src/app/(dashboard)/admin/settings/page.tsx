/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

type SystemSettings = {
  maintenance_mode: boolean;
  maintenance_message: string;
  allow_new_registrations: boolean;
  default_user_role: string;
  max_file_upload_size: number;
  allowed_file_types: string[];
  email_notifications_enabled: boolean;
  admin_email_notifications: string[];
  api_rate_limit: number;
  session_timeout_minutes: number;
  password_min_length: number;
  require_password_complexity: boolean;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  backup_frequency: string;
  backup_retention_days: number;
  last_backup_time: string | null;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    maintenance_message: 'System is currently undergoing maintenance. Please check back later.',
    allow_new_registrations: true,
    default_user_role: 'user',
    max_file_upload_size: 10,
    allowed_file_types: ['jpg', 'jpeg', 'png', 'pdf', 'csv', 'xlsx'],
    email_notifications_enabled: true,
    admin_email_notifications: ['admin@example.com'],
    api_rate_limit: 100,
    session_timeout_minutes: 60,
    password_min_length: 8,
    require_password_complexity: true,
    max_login_attempts: 5,
    lockout_duration_minutes: 30,
    backup_frequency: 'daily',
    backup_retention_days: 30,
    last_backup_time: null,
  });
  const [_isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [newEmailNotification, setNewEmailNotification] = useState('');
  const [newFileType, setNewFileType] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError('');

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData.session) {
        throw new Error('No active session');
      }

      // Check if user is admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', sessionData.session.user.id)
        .single();

      if (userError) {
        throw userError;
      }

      if (!userData.is_admin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // In a real app, we would fetch settings from a settings table
      // For now, we'll use the default settings defined above

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // For demo purposes, we'll just use the default settings
      // In a real app, you would fetch from the database:
      // const { _data, error } = await supabase.from('system_settings').select('*').single();

      setSettings({
        ...settings,
        last_backup_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (err: unknown) {
      console.error('Error fetching settings:', err);
      setError((err instanceof Error ? err.message : String(err)) || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      // In a real app, we would save settings to a settings table
      // For now, we'll just simulate a successful save

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // For demo purposes, we'll just show a success message
      // In a real app, you would update the database:
      // const { error } = await supabase.from('system_settings').update(settings).eq('id', 1);

      setSuccess('Settings saved successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: unknown) {
      console.error('Error saving settings:', err);
      setError((err instanceof Error ? err.message : String(err)) || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerBackup = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update last backup time
      setSettings({
        ...settings,
        last_backup_time: new Date().toISOString(),
      });

      setSuccess('Backup completed successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: unknown) {
      console.error('Error triggering backup:', err);
      setError((err instanceof Error ? err.message : String(err)) || 'Failed to trigger backup');
    } finally {
      setIsSaving(false);
    }
  };

  const addEmailNotification = () => {
    if (!newEmailNotification) return;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmailNotification)) {
      setError('Please enter a valid email address');
      return;
    }

    setSettings({
      ...settings,
      admin_email_notifications: [...settings.admin_email_notifications, newEmailNotification],
    });
    setNewEmailNotification('');
    setError('');
  };

  const removeEmailNotification = (email: string) => {
    setSettings({
      ...settings,
      admin_email_notifications: settings.admin_email_notifications.filter(e => e !== email),
    });
  };

  const addFileType = () => {
    if (!newFileType) return;

    setSettings({
      ...settings,
      allowed_file_types: [...settings.allowed_file_types, newFileType.toLowerCase()],
    });
    setNewFileType('');
  };

  const removeFileType = (fileType: string) => {
    setSettings({
      ...settings,
      allowed_file_types: settings.allowed_file_types.filter(t => t !== fileType),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">System Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure global system settings and preferences
          </p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-6">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup & Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Allow New Registrations</label>
                  <Switch
                    checked={settings.allow_new_registrations}
                    onCheckedChange={checked =>
                      setSettings({ ...settings, allow_new_registrations: checked })
                    }
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  When disabled, new users cannot register for accounts
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Default User Role</label>
                <select
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={settings.default_user_role}
                  onChange={e => setSettings({ ...settings, default_user_role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Default role assigned to new users upon registration
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum File Upload Size (MB)</label>
                <Input
                  type="number"
                  value={settings.max_file_upload_size}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      max_file_upload_size: parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                  max="100"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Maximum file size users can upload (in megabytes)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Allowed File Types</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {settings.allowed_file_types.map(fileType => (
                    <div
                      key={fileType}
                      className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"
                    >
                      <span className="text-sm">{fileType}</span>
                      <button
                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => removeFileType(fileType)}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={newFileType}
                    onChange={e => setNewFileType(e.target.value)}
                    placeholder="e.g., docx"
                  />
                  <Button variant="outline" onClick={addFileType}>
                    Add
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  File extensions that users are allowed to upload
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">API Rate Limit (requests per minute)</label>
                <Input
                  type="number"
                  value={settings.api_rate_limit}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      api_rate_limit: parseInt(e.target.value) || 0,
                    })
                  }
                  min="10"
                  max="1000"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Maximum number of API requests allowed per minute per user
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Session Timeout (minutes)</label>
                <Input
                  type="number"
                  value={settings.session_timeout_minutes}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      session_timeout_minutes: parseInt(e.target.value) || 0,
                    })
                  }
                  min="5"
                  max="1440"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Time in minutes before an inactive user is automatically logged out
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Password Length</label>
                <Input
                  type="number"
                  value={settings.password_min_length}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      password_min_length: parseInt(e.target.value) || 0,
                    })
                  }
                  min="6"
                  max="32"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Minimum number of characters required for user passwords
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Require Password Complexity</label>
                  <Switch
                    checked={settings.require_password_complexity}
                    onCheckedChange={checked =>
                      setSettings({ ...settings, require_password_complexity: checked })
                    }
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  When enabled, passwords must include uppercase, lowercase, numbers, and special
                  characters
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Login Attempts</label>
                <Input
                  type="number"
                  value={settings.max_login_attempts}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      max_login_attempts: parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                  max="10"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Number of failed login attempts before account is temporarily locked
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Account Lockout Duration (minutes)</label>
                <Input
                  type="number"
                  value={settings.lockout_duration_minutes}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      lockout_duration_minutes: parseInt(e.target.value) || 0,
                    })
                  }
                  min="5"
                  max="1440"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Time in minutes an account remains locked after too many failed login attempts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Email Notifications</label>
                  <Switch
                    checked={settings.email_notifications_enabled}
                    onCheckedChange={checked =>
                      setSettings({ ...settings, email_notifications_enabled: checked })
                    }
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enable or disable all system email notifications
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notification Emails</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {settings.admin_email_notifications.map(email => (
                    <div
                      key={email}
                      className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"
                    >
                      <span className="text-sm">{email}</span>
                      <button
                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => removeEmailNotification(email)}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    type="email"
                    value={newEmailNotification}
                    onChange={e => setNewEmailNotification(e.target.value)}
                    placeholder="admin@example.com"
                  />
                  <Button variant="outline" onClick={addEmailNotification}>
                    Add
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email addresses that receive system alerts and notifications
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Maintenance</CardTitle>
              <CardDescription>Configure system backup and maintenance settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Maintenance Mode</label>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={checked =>
                      setSettings({ ...settings, maintenance_mode: checked })
                    }
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  When enabled, only administrators can access the system
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Maintenance Message</label>
                <textarea
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={settings.maintenance_message}
                  onChange={e => setSettings({ ...settings, maintenance_message: e.target.value })}
                  rows={3}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Message displayed to users during maintenance mode
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Backup Frequency</label>
                <select
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={settings.backup_frequency}
                  onChange={e => setSettings({ ...settings, backup_frequency: e.target.value })}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  How often automatic backups are performed
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Backup Retention (days)</label>
                <Input
                  type="number"
                  value={settings.backup_retention_days}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      backup_retention_days: parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                  max="365"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Number of days to keep backups before they are automatically deleted
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Last Backup</label>
                <p className="text-sm">
                  {settings.last_backup_time
                    ? new Date(settings.last_backup_time).toLocaleString()
                    : 'No backup has been performed yet'}
                </p>
                <Button variant="outline" onClick={triggerBackup} disabled={isSaving}>
                  <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                  {isSaving ? 'Backing up...' : 'Trigger Backup Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
