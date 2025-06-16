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

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  UserIcon,
  PaintBrushIcon,
  KeyIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Create a client-side only component to avoid hydration issues
const CitySettingsPageClient = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // User settings state
  const [userSettings, setUserSettings] = useState({
    // Account settings
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',

    // Notification settings
    emailNotifications: true,
    permitNotifications: true,
    violationNotifications: true,
    scaleNotifications: true,
    systemNotifications: true,

    // Display settings
    theme: 'dark',
    dashboardLayout: 'default',
    compactMode: false,
    highContrastMode: false,

    // System settings (admin only)
    sessionTimeout: 60,
    dataRetentionDays: 90,
    autoLogout: true,
    debugMode: false,
  });

  // User data state
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    cityId: 0,
    role: 'viewer',
    city: {
      name: '',
      state: '',
    },
  });

  useEffect(() => {
    // Fetch user data and settings
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);

      // Get token from localStorage
      const token = localStorage.getItem('cityToken');

      if (!token) {
        router.push('/city/login');
        return;
      }

      // Fetch user data
      const userResponse = await fetch('/api/city-auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      setUserData(userData.user);

      // Fetch user settings
      const settingsResponse = await fetch('/api/city-settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!settingsResponse.ok) {
        throw new Error('Failed to fetch user settings');
      }

      const settingsData = await settingsResponse.json();

      // Merge the fetched settings with user data
      setUserSettings({
        ...settingsData.settings,
        name: userData.user.name,
        email: userData.user.email,
      });
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'An error occurred while fetching user data');

      // Generate dummy data for testing
      generateDummyData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateDummyData = () => {
    // Generate dummy user data for testing
    setUserData({
      id: 'user-123',
      name: 'City Admin',
      email: 'cityadmin@example.gov',
      cityId: 1,
      role: 'admin',
      city: {
        name: 'Houston',
        state: 'TX',
      },
    });

    setUserSettings({
      ...userSettings,
      name: 'City Admin',
      email: 'cityadmin@example.gov',
    });
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      // Validate password change if attempted
      if (
        userSettings.newPassword ||
        userSettings.confirmPassword ||
        userSettings.currentPassword
      ) {
        if (!userSettings.currentPassword) {
          setError('Current password is required to change password');
          setIsSaving(false);
          return;
        }

        if (userSettings.newPassword !== userSettings.confirmPassword) {
          setError('New passwords do not match');
          setIsSaving(false);
          return;
        }

        if (userSettings.newPassword.length < 8) {
          setError('New password must be at least 8 characters long');
          setIsSaving(false);
          return;
        }

        // In a real app, you would call a separate API to change password
        // For now, we'll just simulate it
      }

      // Get token from localStorage
      const token = localStorage.getItem('cityToken');

      if (!token) {
        router.push('/city/login');
        return;
      }

      // Create a copy of settings without password fields
      const settingsToSave = { ...userSettings };
      delete settingsToSave.currentPassword;
      delete settingsToSave.newPassword;
      delete settingsToSave.confirmPassword;

      // Call API to save settings
      const response = await fetch('/api/city-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingsToSave),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save settings');
      }

      // Clear password fields after successful save
      setUserSettings({
        ...userSettings,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setSuccess('Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message || 'An error occurred while saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setUserSettings({
      ...userSettings,
      [name]: value,
    });
  };

  const handleSwitchChange = (name, checked) => {
    setUserSettings({
      ...userSettings,
      [name]: checked,
    });
  };

  const handleSelectChange = (name, value) => {
    setUserSettings({
      ...userSettings,
      [name]: value,
    });
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Manage your account settings and preferences</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchUserData} disabled={isLoading}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </Button>
            <Button onClick={saveSettings} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-900/20 border-green-800 text-green-300">
            <CheckIcon className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            {userData.role === 'admin' && <TabsTrigger value="system">System</TabsTrigger>}
          </TabsList>

          {/* Account Settings Tab */}
          <TabsContent value="account">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={userSettings.name}
                      onChange={handleInputChange}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={userSettings.email}
                      onChange={handleInputChange}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-gray-400">
                      Account Role: <span className="text-white font-medium">{userData.role}</span>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      City:{' '}
                      <span className="text-white font-medium">
                        {userData.city?.name}, {userData.city?.state}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Change Password</CardTitle>
                  <CardDescription className="text-gray-400">Update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-gray-300">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={userSettings.currentPassword}
                        onChange={handleInputChange}
                        className="bg-gray-700 border-gray-600 text-white pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-gray-300">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={userSettings.newPassword}
                        onChange={handleInputChange}
                        className="bg-gray-700 border-gray-600 text-white pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={userSettings.confirmPassword}
                        onChange={handleInputChange}
                        className="bg-gray-700 border-gray-600 text-white pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Settings Tab */}
          <TabsContent value="notifications">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure which notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Email Notifications</Label>
                      <p className="text-sm text-gray-400">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={userSettings.emailNotifications}
                      onCheckedChange={checked => handleSwitchChange('emailNotifications', checked)}
                    />
                  </div>
                  <Separator className="bg-gray-700" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Permit Notifications</Label>
                      <p className="text-sm text-gray-400">
                        Notifications about permit applications and approvals
                      </p>
                    </div>
                    <Switch
                      checked={userSettings.permitNotifications}
                      onCheckedChange={checked =>
                        handleSwitchChange('permitNotifications', checked)
                      }
                    />
                  </div>
                  <Separator className="bg-gray-700" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Violation Notifications</Label>
                      <p className="text-sm text-gray-400">
                        Notifications about new violations and enforcement actions
                      </p>
                    </div>
                    <Switch
                      checked={userSettings.violationNotifications}
                      onCheckedChange={checked =>
                        handleSwitchChange('violationNotifications', checked)
                      }
                    />
                  </div>
                  <Separator className="bg-gray-700" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Scale Notifications</Label>
                      <p className="text-sm text-gray-400">
                        Notifications about scale status and maintenance
                      </p>
                    </div>
                    <Switch
                      checked={userSettings.scaleNotifications}
                      onCheckedChange={checked => handleSwitchChange('scaleNotifications', checked)}
                    />
                  </div>
                  <Separator className="bg-gray-700" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">System Notifications</Label>
                      <p className="text-sm text-gray-400">
                        Important system updates and announcements
                      </p>
                    </div>
                    <Switch
                      checked={userSettings.systemNotifications}
                      onCheckedChange={checked =>
                        handleSwitchChange('systemNotifications', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Settings Tab */}
          <TabsContent value="display">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Display Preferences</CardTitle>
                <CardDescription className="text-gray-400">
                  Customize how the dashboard looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-white">
                      Theme
                    </Label>
                    <Select
                      value={userSettings.theme}
                      onValueChange={value => handleSelectChange('theme', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600 text-white">
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dashboardLayout" className="text-white">
                      Dashboard Layout
                    </Label>
                    <Select
                      value={userSettings.dashboardLayout}
                      onValueChange={value => handleSelectChange('dashboardLayout', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select layout" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600 text-white">
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="expanded">Expanded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator className="bg-gray-700" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Compact Mode</Label>
                      <p className="text-sm text-gray-400">
                        Use a more compact UI with less whitespace
                      </p>
                    </div>
                    <Switch
                      checked={userSettings.compactMode}
                      onCheckedChange={checked => handleSwitchChange('compactMode', checked)}
                    />
                  </div>
                  <Separator className="bg-gray-700" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">High Contrast Mode</Label>
                      <p className="text-sm text-gray-400">
                        Increase contrast for better visibility
                      </p>
                    </div>
                    <Switch
                      checked={userSettings.highContrastMode}
                      onCheckedChange={checked => handleSwitchChange('highContrastMode', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab (Admin Only) */}
          {userData.role === 'admin' && (
            <TabsContent value="system">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">System Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Advanced settings for city administrators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout" className="text-white">
                        Session Timeout (minutes)
                      </Label>
                      <Input
                        id="sessionTimeout"
                        name="sessionTimeout"
                        type="number"
                        min="5"
                        max="240"
                        value={userSettings.sessionTimeout}
                        onChange={handleInputChange}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-sm text-gray-400">
                        Users will be automatically logged out after this period of inactivity
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataRetentionDays" className="text-white">
                        Data Retention (days)
                      </Label>
                      <Input
                        id="dataRetentionDays"
                        name="dataRetentionDays"
                        type="number"
                        min="30"
                        max="3650"
                        value={userSettings.dataRetentionDays}
                        onChange={handleInputChange}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-sm text-gray-400">
                        How long to keep historical data before archiving
                      </p>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-white">Auto Logout</Label>
                        <p className="text-sm text-gray-400">
                          Automatically log out users after session timeout
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.autoLogout}
                        onCheckedChange={checked => handleSwitchChange('autoLogout', checked)}
                      />
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-white">Debug Mode</Label>
                        <p className="text-sm text-gray-400">
                          Enable additional logging and debugging features
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.debugMode}
                        onCheckedChange={checked => handleSwitchChange('debugMode', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

// Export a dynamic component to avoid hydration issues
export default function CitySettingsPage() {
  return (
    <ErrorBoundary>
      <CitySettingsPageClient />
    </ErrorBoundary>
  );
}
