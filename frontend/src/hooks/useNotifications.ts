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
  NotificationRule,
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
  _isLoading: boolean;
  _error: string | null;
}

export function useNotifications(_options: UseNotificationsOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { vehicleId, driverId, autoSubscribe = true, maxNotifications = 50 } = options;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<NotificationData>({
    notifications: [],
    unreadCount: 0,
    highPriorityCount: 0,
    channels: [],
    rules: [],
    _isLoading: false,
    _error: null,
  });

  // Load initial data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadData = useCallback(() => {
    setData(prev => ({ ...prev, _isLoading: true, _error: null }));

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let notifications = notificationService.getNotifications({ limit: maxNotifications });

      // Filter by vehicle/driver if specified
      if (vehicleId) {
        notifications = notifications.filter(n => n.data.vehicleId === vehicleId);
      }
      if (driverId) {
        notifications = notifications.filter(n => n.data.driverId === driverId);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const unreadCount = notifications.filter(n => !n.isRead).length;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const highPriorityCount = notifications.filter(
        n => n.priority === 'high' || n.priority === 'urgent'
      ).length;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const channels = notificationService.getChannels();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const rules = notificationService.getRules();

      setData(prev => ({
        ...prev,
        notifications,
        unreadCount,
        highPriorityCount,
        channels,
        rules,
        _isLoading: false,
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        _isLoading: false,
        _error: _error instanceof Error ? error.message : 'Failed to load notifications',
      }));
    }
  }, [vehicleId, driverId, maxNotifications]);

  // Handle new notifications
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNewNotification = useCallback(
    (notification: Notification) => {
      // Filter by vehicle/driver if specified
      if (vehicleId && notification.data.vehicleId !== vehicleId) return;
      if (driverId && notification.data.driverId !== driverId) return;

      setData(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const newNotifications = [
          notification,
          ...prev.notifications.slice(0, maxNotifications - 1),
        ];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const unreadCount = newNotifications.filter(n => !n.isRead).length;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const highPriorityCount = newNotifications.filter(
          n => n.priority === 'high' || n.priority === 'urgent'
        ).length;

        return {
          ...prev,
          notifications: newNotifications,
          unreadCount,
          highPriorityCount,
        };
      });
    },
    [vehicleId, driverId, maxNotifications]
  );

  // Subscribe to notifications
  useEffect(() => {
    if (!autoSubscribe) return;

    notificationService.subscribe('all', handleNewNotification);

    return () => {
      notificationService.unsubscribe('all', handleNewNotification);
    };
  }, [autoSubscribe, handleNewNotification]);

  // Notification actions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const markAsRead = useCallback((notificationId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _success = notificationService.markAsRead(notificationId);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const acknowledge = useCallback((notificationId: string, acknowledgedBy = 'current-_user') => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _success = notificationService.acknowledge(notificationId, acknowledgedBy);
    if (success) {
      setData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notificationId
            ? {
                ...n,
                isAcknowledged: true,
                acknowledgedBy,
                acknowledgedAt: new Date().toISOString(),
              }
            : n
        ),
      }));
    }
    return success;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createNotification = useCallback(
    async (
      eventType: NotificationEventType,
      _data: Notification['data'],
      customMessage?: { title: string; message: string }
    ) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const notification = await notificationService.createNotification(
          eventType,
          data,
          customMessage
        );
        return notification;
      } catch (error) {
        setData(prev => ({
          ...prev,
          _error: _error instanceof Error ? error.message : 'Failed to create notification',
        }));
        return null;
      }
    },
    []
  );

  // Quick notification methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const notifyGeofenceViolation = useCallback(
    async (
      _vehicleId: string,
      driverId: string,
      zoneName: string,
      violationType: 'entry' | 'exit',
      location: { lat: number; lng: number; address?: string }
    ) => {
      try {
        await notificationService.notifyGeofenceViolation(
          vehicleId,
          driverId,
          zoneName,
          violationType,
          location
        );
      } catch (error) {
        console.error('Failed to send geofence violation notification:', error);
      }
    },
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const notifySpeedViolation = useCallback(
    async (
      _vehicleId: string,
      driverId: string,
      currentSpeed: number,
      speedLimit: number,
      location: { lat: number; lng: number; address?: string }
    ) => {
      try {
        await notificationService.notifySpeedViolation(
          vehicleId,
          driverId,
          currentSpeed,
          speedLimit,
          location
        );
      } catch (error) {
        console.error('Failed to send speed violation notification:', error);
      }
    },
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const notifyETADelay = useCallback(
    async (_vehicleId: string, driverId: string, delayMinutes: number, newETA: string) => {
      try {
        await notificationService.notifyETADelay(vehicleId, driverId, delayMinutes, newETA);
      } catch (error) {
        console.error('Failed to send ETA delay notification:', error);
      }
    },
    []
  );

  // Channel and rule management
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateChannel = useCallback(
    (channelId: string, updates: Partial<NotificationChannel>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _success = notificationService.updateChannel(channelId, updates);
      if (success) {
        loadData(); // Reload to get updated channels
      }
      return success;
    },
    [loadData]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateRule = useCallback(
    (ruleId: string, updates: Partial<NotificationRule>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _success = notificationService.updateRule(ruleId, updates);
      if (success) {
        loadData(); // Reload to get updated rules
      }
      return success;
    },
    [loadData]
  );

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadNotifications = useCallback(() => {
    setIsLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const allNotifications = notificationService.getNotifications({ eventType });
    setNotifications(allNotifications);
    setIsLoading(false);
  }, [eventType]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNewNotification = useCallback(
    (notification: Notification) => {
      if (notification.eventType === eventType) {
        setNotifications(prev => [notification, ...prev]);
      }
    },
    [eventType]
  );

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rules, setRules] = useState<NotificationRule[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadSettings = useCallback(() => {
    setIsLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const allChannels = notificationService.getChannels();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const allRules = notificationService.getRules();
    setChannels(allChannels);
    setRules(allRules);
    setIsLoading(false);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateChannel = useCallback(
    (channelId: string, updates: Partial<NotificationChannel>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _success = notificationService.updateChannel(channelId, updates);
      if (success) {
        loadSettings();
      }
      return success;
    },
    [loadSettings]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateRule = useCallback(
    (ruleId: string, updates: Partial<NotificationRule>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _success = notificationService.updateRule(ruleId, updates);
      if (success) {
        loadSettings();
      }
      return success;
    },
    [loadSettings]
  );

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
