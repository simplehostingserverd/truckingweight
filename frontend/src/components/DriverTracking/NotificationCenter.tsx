/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  MapPinIcon,
  Cog6ToothIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { driverTrackingService, Notification } from '@/services/driverTrackingService';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'geofence' | 'speed' | 'maintenance' | 'route' | 'fuel' | 'driver';
  relatedEntity?: {
    type: 'driver' | 'vehicle' | 'route' | 'geofence';
    id: string;
    name: string;
  };
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
}

interface NotificationRule {
  id: string;
  name: string;
  type: string;
  priority: string;
  enabled: boolean;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    dashboard: boolean;
  };
  escalation: {
    enabled: boolean;
    levels: {
      level: number;
      delayMinutes: number;
      recipients: string[];
    }[];
  };
  conditions: {
    field: string;
    operator: string;
    value: string;
  }[];
}

interface NotificationCenterProps {
  onNotificationAction?: (notificationId: string, actionId: string) => void;
}

function NotificationCenter({ onNotificationAction }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [activeTab, setActiveTab] = useState<'notifications' | 'rules' | 'settings'>('notifications');
  const [filter, setFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Mock data for demonstration
  const generateMockNotifications = (): Notification[] => {
    return [
      {
        id: '1',
        type: 'geofence',
        priority: 'high',
        title: 'Geofence Violation',
        message: 'Driver John Smith entered restricted zone during business hours',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        isRead: false,
        isAcknowledged: false,
        driverId: 'DRV001',
        driverName: 'John Smith',
        vehicleId: 'VEH001',
        vehiclePlate: 'TRK-001',
        location: {
          latitude: 40.7505,
          longitude: -73.9934,
          address: '456 Broadway, New York, NY',
        },
        actions: [
          { id: 'contact', label: 'Contact Driver', type: 'primary' },
          { id: 'acknowledge', label: 'Acknowledge', type: 'secondary' },
        ],
        escalationLevel: 1,
        autoEscalateAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
      },
      {
        id: '2',
        type: 'speed',
        priority: 'critical',
        title: 'Excessive Speed Alert',
        message: 'Vehicle TRK-002 exceeding speed limit by 15 mph on Highway 95',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
        isRead: false,
        isAcknowledged: false,
        driverId: 'DRV002',
        driverName: 'Sarah Johnson',
        vehicleId: 'VEH002',
        vehiclePlate: 'TRK-002',
        location: {
          latitude: 40.7282,
          longitude: -74.0776,
          address: 'Highway 95, Mile Marker 23',
        },
        actions: [
          { id: 'emergency_contact', label: 'Emergency Contact', type: 'danger' },
          { id: 'acknowledge', label: 'Acknowledge', type: 'secondary' },
        ],
        escalationLevel: 2,
      },
      {
        id: '3',
        type: 'maintenance',
        priority: 'medium',
        title: 'Maintenance Due',
        message: 'Vehicle TRK-003 is due for scheduled maintenance in 2 days',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        isRead: true,
        isAcknowledged: false,
        vehicleId: 'VEH003',
        vehiclePlate: 'TRK-003',
        actions: [
          { id: 'schedule', label: 'Schedule Maintenance', type: 'primary' },
          { id: 'snooze', label: 'Snooze', type: 'secondary' },
        ],
        escalationLevel: 0,
      },
      {
        id: '4',
        type: 'route',
        priority: 'low',
        title: 'Route Deviation',
        message: 'Driver Mike Wilson deviated from planned route by 0.5 miles',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        isRead: true,
        isAcknowledged: true,
        driverId: 'DRV003',
        driverName: 'Mike Wilson',
        vehicleId: 'VEH003',
        vehiclePlate: 'TRK-003',
        location: {
          latitude: 40.7614,
          longitude: -73.9776,
          address: '321 Park Ave, New York, NY',
        },
        escalationLevel: 0,
      },
      {
        id: '5',
        type: 'emergency',
        priority: 'critical',
        title: 'Emergency Button Activated',
        message: 'Driver Lisa Brown activated emergency button - immediate response required',
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 minute ago
        isRead: false,
        isAcknowledged: false,
        driverId: 'DRV004',
        driverName: 'Lisa Brown',
        vehicleId: 'VEH004',
        vehiclePlate: 'TRK-004',
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
          address: '123 Main St, New York, NY',
        },
        actions: [
          { id: 'dispatch_emergency', label: 'Dispatch Emergency', type: 'danger' },
          { id: 'contact_driver', label: 'Contact Driver', type: 'primary' },
        ],
        escalationLevel: 3,
      },
    ];
  };

  const generateMockRules = (): NotificationRule[] => {
    return [
      {
        id: '1',
        name: 'Geofence Violations',
        type: 'geofence',
        priority: 'high',
        enabled: true,
        channels: {
          email: true,
          sms: true,
          push: true,
          dashboard: true,
        },
        escalation: {
          enabled: true,
          levels: [
            { level: 1, delayMinutes: 5, recipients: ['supervisor@company.com'] },
            { level: 2, delayMinutes: 15, recipients: ['manager@company.com'] },
            { level: 3, delayMinutes: 30, recipients: ['director@company.com'] },
          ],
        },
        conditions: [
          { field: 'zone_type', operator: 'equals', value: 'restricted' },
        ],
      },
      {
        id: '2',
        name: 'Speed Violations',
        type: 'speed',
        priority: 'critical',
        enabled: true,
        channels: {
          email: true,
          sms: true,
          push: true,
          dashboard: true,
        },
        escalation: {
          enabled: true,
          levels: [
            { level: 1, delayMinutes: 2, recipients: ['supervisor@company.com'] },
            { level: 2, delayMinutes: 5, recipients: ['manager@company.com', 'safety@company.com'] },
          ],
        },
        conditions: [
          { field: 'speed_over_limit', operator: 'greater_than', value: '10' },
        ],
      },
      {
        id: '3',
        name: 'Emergency Alerts',
        type: 'emergency',
        priority: 'critical',
        enabled: true,
        channels: {
          email: true,
          sms: true,
          push: true,
          dashboard: true,
        },
        escalation: {
          enabled: true,
          levels: [
            { level: 1, delayMinutes: 0, recipients: ['emergency@company.com', '911'] },
          ],
        },
        conditions: [],
      },
    ];
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const notificationsData = await driverTrackingService.getNotifications();
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch notifications',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'geofence':
        return <MapPinIcon className="h-4 w-4" />;
      case 'speed':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'maintenance':
        return <Cog6ToothIcon className="h-4 w-4" />;
      case 'route':
        return <TruckIcon className="h-4 w-4" />;
      case 'emergency':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  const markAsAcknowledged = (notificationId: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isAcknowledged: true }
        : notification
    ));
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notification => notification.id !== notificationId));
  };

  const handleNotificationAction = (notificationId: string, actionId: string) => {
    if (actionId === 'acknowledge') {
      markAsAcknowledged(notificationId);
    }
    onNotificationAction?.(notificationId, actionId);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter !== 'all') {
      if (filter === 'unread' && notification.isRead) return false;
      if (filter === 'acknowledged' && !notification.isAcknowledged) return false;
      if (filter === 'unacknowledged' && notification.isAcknowledged) return false;
    }
    
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) {
      return false;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower) ||
        notification.driverName?.toLowerCase().includes(searchLower) ||
        notification.vehiclePlate?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.isAcknowledged).length;

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <BellIcon className="h-5 w-5" />
              Notification Center
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'notifications' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </Button>
              <Button
                variant={activeTab === 'rules' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('rules')}
              >
                Rules
              </Button>
              <Button
                variant={activeTab === 'settings' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">Critical</p>
                  <p className="text-lg font-semibold text-red-700 dark:text-red-300">{criticalCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Unread</p>
                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">{unreadCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Resolved Today</p>
                  <p className="text-lg font-semibold text-green-700 dark:text-green-300">12</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response</p>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">3.2m</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FunnelIcon className="h-4 w-4" />
                  {filteredNotifications.length} notifications
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <BellIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No notifications found</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      !notification.isRead
                        ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200'
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1 ${getPriorityColor(notification.priority)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeIcon(notification.type)}
                            <h4 className="font-medium">{notification.title}</h4>
                            <Badge variant={getPriorityBadgeVariant(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {notification.escalationLevel > 0 && (
                              <Badge variant="outline">
                                Level {notification.escalationLevel}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          
                          {(notification.driverName || notification.vehiclePlate) && (
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              {notification.driverName && (
                                <div className="flex items-center gap-1">
                                  <UserIcon className="h-3 w-3" />
                                  {notification.driverName}
                                </div>
                              )}
                              {notification.vehiclePlate && (
                                <div className="flex items-center gap-1">
                                  <TruckIcon className="h-3 w-3" />
                                  {notification.vehiclePlate}
                                </div>
                              )}
                              {notification.location?.address && (
                                <div className="flex items-center gap-1">
                                  <MapPinIcon className="h-3 w-3" />
                                  {notification.location.address}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="flex gap-2">
                        {notification.actions.map((action) => (
                          <Button
                            key={action.id}
                            variant={action.type === 'primary' ? 'default' : action.type === 'danger' ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationAction(notification.id, action.id);
                            }}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Notification Rules</CardTitle>
              <Button size="sm">
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{rule.type} notifications</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityBadgeVariant(rule.priority)}>
                      {rule.priority}
                    </Badge>
                    <Switch checked={rule.enabled} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Channels</p>
                    <div className="flex gap-1 mt-1">
                      {rule.channels.email && <Badge variant="outline">Email</Badge>}
                      {rule.channels.sms && <Badge variant="outline">SMS</Badge>}
                      {rule.channels.push && <Badge variant="outline">Push</Badge>}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600">Escalation</p>
                    <p className="font-medium">
                      {rule.escalation.enabled ? `${rule.escalation.levels.length} levels` : 'Disabled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Conditions</p>
                    <p className="font-medium">{rule.conditions.length} rules</p>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Global Settings</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Notifications</p>
                  <p className="text-sm text-gray-600">Receive all notification types</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sound Alerts</p>
                  <p className="text-sm text-gray-600">Play sound for critical notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-acknowledge Low Priority</p>
                  <p className="text-sm text-gray-600">Automatically acknowledge low priority notifications after 1 hour</p>
                </div>
                <Switch />
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Quiet Hours</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <Input type="time" defaultValue="22:00" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <Input type="time" defaultValue="06:00" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Override for Critical</p>
                  <p className="text-sm text-gray-600">Allow critical notifications during quiet hours</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default NotificationCenter;