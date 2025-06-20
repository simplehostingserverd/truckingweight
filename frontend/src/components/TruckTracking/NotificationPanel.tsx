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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { 
  notificationService, 
  Notification, 
  NotificationEventType 
} from '@/services/notificationService';

interface NotificationPanelProps {
  vehicleId?: string;
  driverId?: string;
  maxNotifications?: number;
}

export default function NotificationPanel({ 
  vehicleId, 
  driverId, 
  maxNotifications = 10 
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high_priority'>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  // Load notifications on mount and subscribe to new ones
  useEffect(() => {
    loadNotifications();

    // Subscribe to all notifications
    const handleNewNotification = (notification: Notification) => {
      // Filter by vehicle/driver if specified
      if (vehicleId && notification.data.vehicleId !== vehicleId) return;
      if (driverId && notification.data.driverId !== driverId) return;

      setNotifications(prev => [notification, ...prev.slice(0, maxNotifications - 1)]);
    };

    notificationService.subscribe('all', handleNewNotification);

    return () => {
      notificationService.unsubscribe('all', handleNewNotification);
    };
  }, [vehicleId, driverId, maxNotifications]);

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications({ limit: maxNotifications });
    
    // Filter by vehicle/driver if specified
    let filtered = allNotifications;
    if (vehicleId) {
      filtered = filtered.filter(n => n.data.vehicleId === vehicleId);
    }
    if (driverId) {
      filtered = filtered.filter(n => n.data.driverId === driverId);
    }

    setNotifications(filtered);
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'high_priority':
        return notifications.filter(n => n.priority === 'high' || n.priority === 'urgent');
      default:
        return notifications;
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    const success = notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    }
  };

  const handleAcknowledge = (notificationId: string) => {
    const success = notificationService.acknowledge(notificationId, 'current-user');
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { 
          ...n, 
          isAcknowledged: true, 
          acknowledgedBy: 'current-user',
          acknowledgedAt: new Date().toISOString()
        } : n)
      );
    }
  };

  const handleClearAll = () => {
    notificationService.clearAll();
    setNotifications([]);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      case 'normal':
        return <InformationCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'low':
        return <InformationCircleIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <InformationCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'normal': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'low': return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getEventTypeIcon = (eventType: NotificationEventType) => {
    switch (eventType) {
      case 'geofence_violation':
        return <MapPinIcon className="h-4 w-4" />;
      case 'speed_violation':
        return <TruckIcon className="h-4 w-4" />;
      case 'eta_delay':
        return <ClockIcon className="h-4 w-4" />;
      case 'driver_fatigue':
        return <UserIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-5 w-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'high_priority', label: 'Priority', count: highPriorityCount },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BellIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'ring-1 ring-blue-200 dark:ring-blue-800' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex items-center space-x-1">
                      {getPriorityIcon(notification.priority)}
                      {getEventTypeIcon(notification.eventType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {isExpanded ? notification.message : notification.message.substring(0, 100) + (notification.message.length > 100 ? '...' : '')}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatTimestamp(notification.timestamp)}</span>
                        {notification.data.vehicleId && (
                          <span>Vehicle: {notification.data.vehicleId}</span>
                        )}
                        {notification.data.location?.address && (
                          <span>📍 {notification.data.location.address}</span>
                        )}
                      </div>
                      {notification.isAcknowledged && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          ✓ Acknowledged by {notification.acknowledgedBy}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    {!notification.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs"
                      >
                        <CheckCircleIcon className="h-3 w-3" />
                      </Button>
                    )}
                    {!notification.isAcknowledged && (notification.priority === 'high' || notification.priority === 'urgent') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledge(notification.id)}
                        className="text-xs"
                      >
                        Ack
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {notifications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Total: {notifications.length}</span>
              <span>Unread: {unreadCount}</span>
              <span>Priority: {highPriorityCount}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
