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

import { useCallback, useEffect, useState } from 'react';
import { 
  notificationService, 
  Notification, 
  NotificationEventType,
  NotificationChannel,
  NotificationRule
} from '@/services/notificationService';

export interface UseNotificationsOptions {
  vehicleId?: string;
  driverId?: string;
  autoSubscribe?: boolean;
  maxNotifications?: number;
}

export interface NotificationData {
  notifications: Notification[];
  unreadCount: number;
  highPriorityCount: number;
  channels: NotificationChannel[];
  rules: NotificationRule[];
  isLoading: boolean;
  error: string | null;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { vehicleId, driverId, autoSubscribe = true, maxNotifications = 50 } = options;

  const [data, setData] = useState<NotificationData>({
    notifications: [],
    unreadCount: 0,
    highPriorityCount: 0,
    channels: [],
    rules: [],
    isLoading: false,
    error: null,
  });

  // Load initial data
  const loadData = useCallback(() => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let notifications = notificationService.getNotifications({ limit: maxNotifications });
      
      // Filter by vehicle/driver if specified
      if (vehicleId) {
        notifications = notifications.filter(n => n.data.vehicleId === vehicleId);
      }
      if (driverId) {
        notifications = notifications.filter(n => n.data.driverId === driverId);
      }

      const unreadCount = notifications.filter(n => !n.isRead).length;
      const highPriorityCount = notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length;
      const channels = notificationService.getChannels();
      const rules = notificationService.getRules();

      setData(prev => ({
        ...prev,
        notifications,
        unreadCount,
        highPriorityCount,
        channels,
        rules,
        isLoading: false,
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load notifications',
      }));
    }
  }, [vehicleId, driverId, maxNotifications]);

  // Handle new notifications
  const handleNewNotification = useCallback((notification: Notification) => {
    // Filter by vehicle/driver if specified
    if (vehicleId && notification.data.vehicleId !== vehicleId) return;
    if (driverId && notification.data.driverId !== driverId) return;

    setData(prev => {
      const newNotifications = [notification, ...prev.notifications.slice(0, maxNotifications - 1)];
      const unreadCount = newNotifications.filter(n => !n.isRead).length;
      const highPriorityCount = newNotifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length;

      return {
        ...prev,
        notifications: newNotifications,
        unreadCount,
        highPriorityCount,
      };
    });
  }, [vehicleId, driverId, maxNotifications]);

  // Subscribe to notifications
  useEffect(() => {
    if (!autoSubscribe) return;

    notificationService.subscribe('all', handleNewNotification);

    return () => {
      notificationService.unsubscribe('all', handleNewNotification);
    };
  }, [autoSubscribe, handleNewNotification]);

  // Notification actions
  const markAsRead = useCallback((notificationId: string) => {
    const success = notificationService.markAsRead(notificationId);
    if (success) {
      setData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    }
    return success;
  }, []);

  const acknowledge = useCallback((notificationId: string, acknowledgedBy = 'current-user') => {
    const success = notificationService.acknowledge(notificationId, acknowledgedBy);
    if (success) {
      setData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { 
            ...n, 
            isAcknowledged: true, 
            acknowledgedBy,
            acknowledgedAt: new Date().toISOString()
          } : n
        ),
      }));
    }
    return success;
  }, []);

  const clearAll = useCallback(() => {
    notificationService.clearAll();
    setData(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0,
      highPriorityCount: 0,
    }));
  }, []);

  // Create notifications
  const createNotification = useCallback(async (
    eventType: NotificationEventType,
    data: Notification['data'],
    customMessage?: { title: string; message: string }
  ) => {
    try {
      const notification = await notificationService.createNotification(eventType, data, customMessage);
      return notification;
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create notification',
      }));
      return null;
    }
  }, []);

  // Quick notification methods
  const notifyGeofenceViolation = useCallback(async (
    vehicleId: string,
    driverId: string,
    zoneName: string,
    violationType: 'entry' | 'exit',
    location: { lat: number; lng: number; address?: string }
  ) => {
    try {
      await notificationService.notifyGeofenceViolation(vehicleId, driverId, zoneName, violationType, location);
    } catch (error) {
      console.error('Failed to send geofence violation notification:', error);
    }
  }, []);

  const notifySpeedViolation = useCallback(async (
    vehicleId: string,
    driverId: string,
    currentSpeed: number,
    speedLimit: number,
    location: { lat: number; lng: number; address?: string }
  ) => {
    try {
      await notificationService.notifySpeedViolation(vehicleId, driverId, currentSpeed, speedLimit, location);
    } catch (error) {
      console.error('Failed to send speed violation notification:', error);
    }
  }, []);

  const notifyETADelay = useCallback(async (
    vehicleId: string,
    driverId: string,
    delayMinutes: number,
    newETA: string
  ) => {
    try {
      await notificationService.notifyETADelay(vehicleId, driverId, delayMinutes, newETA);
    } catch (error) {
      console.error('Failed to send ETA delay notification:', error);
    }
  }, []);

  // Channel and rule management
  const updateChannel = useCallback((channelId: string, updates: Partial<NotificationChannel>) => {
    const success = notificationService.updateChannel(channelId, updates);
    if (success) {
      loadData(); // Reload to get updated channels
    }
    return success;
  }, [loadData]);

  const updateRule = useCallback((ruleId: string, updates: Partial<NotificationRule>) => {
    const success = notificationService.updateRule(ruleId, updates);
    if (success) {
      loadData(); // Reload to get updated rules
    }
    return success;
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...data,
    loadData,
    markAsRead,
    acknowledge,
    clearAll,
    createNotification,
    notifyGeofenceViolation,
    notifySpeedViolation,
    notifyETADelay,
    updateChannel,
    updateRule,
    refresh: loadData,
  };
}

// Hook for specific event type notifications
export function useEventNotifications(eventType: NotificationEventType) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = useCallback(() => {
    setIsLoading(true);
    const allNotifications = notificationService.getNotifications({ eventType });
    setNotifications(allNotifications);
    setIsLoading(false);
  }, [eventType]);

  const handleNewNotification = useCallback((notification: Notification) => {
    if (notification.eventType === eventType) {
      setNotifications(prev => [notification, ...prev]);
    }
  }, [eventType]);

  useEffect(() => {
    loadNotifications();
    notificationService.subscribe(eventType, handleNewNotification);

    return () => {
      notificationService.unsubscribe(eventType, handleNewNotification);
    };
  }, [eventType, loadNotifications, handleNewNotification]);

  return {
    notifications,
    isLoading,
    loadNotifications,
  };
}

// Hook for notification settings management
export function useNotificationSettings() {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSettings = useCallback(() => {
    setIsLoading(true);
    const allChannels = notificationService.getChannels();
    const allRules = notificationService.getRules();
    setChannels(allChannels);
    setRules(allRules);
    setIsLoading(false);
  }, []);

  const updateChannel = useCallback((channelId: string, updates: Partial<NotificationChannel>) => {
    const success = notificationService.updateChannel(channelId, updates);
    if (success) {
      loadSettings();
    }
    return success;
  }, [loadSettings]);

  const updateRule = useCallback((ruleId: string, updates: Partial<NotificationRule>) => {
    const success = notificationService.updateRule(ruleId, updates);
    if (success) {
      loadSettings();
    }
    return success;
  }, [loadSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    channels,
    rules,
    isLoading,
    updateChannel,
    updateRule,
    loadSettings,
  };
}
