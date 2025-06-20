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

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'push' | 'email' | 'sms' | 'in_app' | 'webhook';
  isEnabled: boolean;
  config: {
    endpoint?: string;
    apiKey?: string;
    template?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  };
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  eventType: NotificationEventType;
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: string | number;
  }[];
  channels: string[]; // Channel IDs
  recipients: {
    type: 'role' | 'user' | 'group';
    id: string;
  }[];
  isActive: boolean;
  cooldownMinutes: number; // Prevent spam
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export type NotificationEventType =
  | 'geofence_violation'
  | 'speed_violation'
  | 'eta_delay'
  | 'vehicle_breakdown'
  | 'driver_fatigue'
  | 'route_deviation'
  | 'fuel_low'
  | 'maintenance_due'
  | 'emergency_stop'
  | 'delivery_complete'
  | 'shift_start'
  | 'shift_end'
  | 'custom';

export interface Notification {
  id: string;
  title: string;
  message: string;
  eventType: NotificationEventType;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: string;
  isRead: boolean;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  data: {
    vehicleId?: string;
    driverId?: string;
    location?: { lat: number; lng: number; address?: string };
    severity?: string;
    metadata?: Record<string, unknown>;
  };
  channels: string[];
  recipients: string[];
  deliveryStatus: {
    [channelId: string]: {
      status: 'pending' | 'sent' | 'delivered' | 'failed';
      timestamp: string;
      error?: string;
    };
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  eventType: NotificationEventType;
  title: string;
  message: string;
  variables: string[]; // Available template variables
  channels: string[];
}

class NotificationService {
  private channels: Map<string, NotificationChannel> = new Map();
  private rules: Map<string, NotificationRule> = new Map();
  private notifications: Notification[] = [];
  private templates: Map<string, NotificationTemplate> = new Map();
  private subscribers: Map<string, ((notification: Notification) => void)[]> = new Map();
  private lastNotificationTime: Map<string, number> = new Map(); // For cooldown

  constructor() {
    this.initializeDefaultChannels();
    this.initializeDefaultRules();
    this.initializeDefaultTemplates();
    this.requestNotificationPermission();
  }

  private initializeDefaultChannels(): void {
    const defaultChannels: NotificationChannel[] = [
      {
        id: 'browser_push',
        name: 'Browser Push Notifications',
        type: 'push',
        isEnabled: true,
        config: { priority: 'normal' },
      },
      {
        id: 'in_app',
        name: 'In-App Notifications',
        type: 'in_app',
        isEnabled: true,
        config: { priority: 'normal' },
      },
      {
        id: 'email_alerts',
        name: 'Email Alerts',
        type: 'email',
        isEnabled: false,
        config: {
          endpoint: 'smtp://localhost:587',
          template: 'default_email',
          priority: 'normal',
        },
      },
      {
        id: 'sms_alerts',
        name: 'SMS Alerts',
        type: 'sms',
        isEnabled: false,
        config: {
          endpoint: 'https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json',
          priority: 'high',
        },
      },
    ];

    defaultChannels.forEach(channel => {
      this.channels.set(channel.id, channel);
    });
  }

  private initializeDefaultRules(): void {
    const defaultRules: NotificationRule[] = [
      {
        id: 'geofence_violations',
        name: 'Geofence Violations',
        description: 'Alert when vehicles enter or exit restricted areas',
        eventType: 'geofence_violation',
        conditions: [{ field: 'severity', operator: 'equals', value: 'high' }],
        channels: ['browser_push', 'in_app'],
        recipients: [
          { type: 'role', id: 'dispatcher' },
          { type: 'role', id: 'fleet_manager' },
        ],
        isActive: true,
        cooldownMinutes: 5,
        priority: 'high',
      },
      {
        id: 'speed_violations',
        name: 'Speed Violations',
        description: 'Alert when drivers exceed speed limits',
        eventType: 'speed_violation',
        conditions: [{ field: 'speed_over_limit', operator: 'greater_than', value: 10 }],
        channels: ['in_app'],
        recipients: [{ type: 'role', id: 'safety_manager' }],
        isActive: true,
        cooldownMinutes: 10,
        priority: 'normal',
      },
      {
        id: 'eta_delays',
        name: 'ETA Delays',
        description: 'Alert when deliveries are significantly delayed',
        eventType: 'eta_delay',
        conditions: [{ field: 'delay_minutes', operator: 'greater_than', value: 30 }],
        channels: ['browser_push', 'in_app', 'email_alerts'],
        recipients: [
          { type: 'role', id: 'customer_service' },
          { type: 'role', id: 'dispatcher' },
        ],
        isActive: true,
        cooldownMinutes: 15,
        priority: 'high',
      },
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'geofence_violation',
        name: 'Geofence Violation Alert',
        eventType: 'geofence_violation',
        title: 'Geofence Violation - {{vehicleId}}',
        message:
          'Vehicle {{vehicleId}} has {{violationType}} {{zoneName}} at {{location}}. Driver: {{driverName}}',
        variables: ['vehicleId', 'violationType', 'zoneName', 'location', 'driverName'],
        channels: ['browser_push', 'in_app'],
      },
      {
        id: 'speed_violation',
        name: 'Speed Violation Alert',
        eventType: 'speed_violation',
        title: 'Speed Violation - {{vehicleId}}',
        message:
          'Vehicle {{vehicleId}} is traveling {{currentSpeed}} mph in a {{speedLimit}} mph zone. Location: {{location}}',
        variables: ['vehicleId', 'currentSpeed', 'speedLimit', 'location'],
        channels: ['in_app'],
      },
      {
        id: 'eta_delay',
        name: 'ETA Delay Alert',
        eventType: 'eta_delay',
        title: 'Delivery Delay - {{vehicleId}}',
        message:
          'Vehicle {{vehicleId}} is running {{delayMinutes}} minutes behind schedule. New ETA: {{newETA}}',
        variables: ['vehicleId', 'delayMinutes', 'newETA'],
        channels: ['browser_push', 'in_app', 'email_alerts'],
      },
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.warn('Failed to request notification permission:', error);
      }
    }
  }

  // Create and send notification
  public async createNotification(
    eventType: NotificationEventType,
    data: Notification['data'],
    customMessage?: { title: string; message: string }
  ): Promise<Notification> {
    // Find matching rules
    const matchingRules = Array.from(this.rules.values()).filter(
      rule =>
        rule.isActive &&
        rule.eventType === eventType &&
        this.evaluateConditions(rule.conditions, data)
    );

    if (matchingRules.length === 0) {
      throw new Error(`No active rules found for event type: ${eventType}`);
    }

    // Use the highest priority rule
    const rule = matchingRules.reduce((highest, current) =>
      this.getPriorityValue(current.priority) > this.getPriorityValue(highest.priority)
        ? current
        : highest
    );

    // Check cooldown
    const cooldownKey = `${rule.id}-${data.vehicleId || data.driverId || 'global'}`;
    const lastNotification = this.lastNotificationTime.get(cooldownKey) || 0;
    const now = Date.now();

    if (now - lastNotification < rule.cooldownMinutes * 60000) {
      console.log(`Notification suppressed due to cooldown: ${rule.name}`);
      throw new Error('Notification suppressed due to cooldown period');
    }

    // Get template and render message
    const template = this.templates.get(eventType) || this.getDefaultTemplate(eventType);
    const { title, message } = customMessage || this.renderTemplate(template, data);

    // Create notification
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      eventType,
      priority: rule.priority,
      timestamp: new Date().toISOString(),
      isRead: false,
      isAcknowledged: false,
      data,
      channels: rule.channels,
      recipients: rule.recipients.map(r => r.id),
      deliveryStatus: {},
    };

    // Send through channels
    await this.sendThroughChannels(notification, rule.channels);

    // Store notification
    this.notifications.unshift(notification);

    // Update cooldown
    this.lastNotificationTime.set(cooldownKey, now);

    // Notify subscribers
    this.notifySubscribers(notification);

    return notification;
  }

  private evaluateConditions(
    conditions: NotificationRule['conditions'],
    data: Notification['data']
  ): boolean {
    return conditions.every(condition => {
      const value = this.getDataValue(data, condition.field);

      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'not_equals':
          return value !== condition.value;
        case 'greater_than':
          return Number(value) > Number(condition.value);
        case 'less_than':
          return Number(value) < Number(condition.value);
        case 'contains':
          return String(value).includes(String(condition.value));
        default:
          return false;
      }
    });
  }

  private getDataValue(data: Notification['data'], field: string): unknown {
    const keys = field.split('.');
    let value: unknown = data;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private getPriorityValue(priority: string): number {
    const values = { low: 1, normal: 2, high: 3, urgent: 4 };
    return values[priority as keyof typeof values] || 2;
  }

  private renderTemplate(
    template: NotificationTemplate,
    data: Notification['data']
  ): { title: string; message: string } {
    let title = template.title;
    let message = template.message;

    // Replace template variables
    template.variables.forEach(variable => {
      const value = this.getDataValue(data, variable) || `{{${variable}}}`;
      const regex = new RegExp(`{{${variable}}}`, 'g');
      title = title.replace(regex, String(value));
      message = message.replace(regex, String(value));
    });

    return { title, message };
  }

  private getDefaultTemplate(eventType: NotificationEventType): NotificationTemplate {
    return {
      id: 'default',
      name: 'Default Template',
      eventType,
      title: `${eventType.replace('_', ' ').toUpperCase()} Alert`,
      message: 'An event has occurred that requires your attention.',
      variables: [],
      channels: ['in_app'],
    };
  }

  private async sendThroughChannels(
    notification: Notification,
    channelIds: string[]
  ): Promise<void> {
    const promises = channelIds.map(async channelId => {
      const channel = this.channels.get(channelId);
      if (!channel || !channel.isEnabled) {
        notification.deliveryStatus[channelId] = {
          status: 'failed',
          timestamp: new Date().toISOString(),
          error: 'Channel not found or disabled',
        };
        return;
      }

      try {
        await this.sendToChannel(notification, channel);
        notification.deliveryStatus[channelId] = {
          status: 'sent',
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        notification.deliveryStatus[channelId] = {
          status: 'failed',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    await Promise.all(promises);
  }

  private async sendToChannel(
    notification: Notification,
    channel: NotificationChannel
  ): Promise<void> {
    switch (channel.type) {
      case 'push':
        await this.sendBrowserPush(notification);
        break;
      case 'in_app':
        // In-app notifications are handled by subscribers
        break;
      case 'email':
        await this.sendEmail(notification, channel);
        break;
      case 'sms':
        await this.sendSMS(notification, channel);
        break;
      case 'webhook':
        await this.sendWebhook(notification, channel);
        break;
      default:
        throw new Error(`Unsupported channel type: ${channel.type}`);
    }
  }

  private async sendBrowserPush(notification: Notification): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
      });
    } else {
      throw new Error('Browser notifications not supported or permission denied');
    }
  }

  private async sendEmail(
    _notification: Notification,
    _channel: NotificationChannel
  ): Promise<void> {
    // Mock email sending - in production, this would integrate with email service
    console.log('Email notification sent (mock)');
  }

  private async sendSMS(_notification: Notification, _channel: NotificationChannel): Promise<void> {
    // Mock SMS sending - in production, this would integrate with SMS service
    console.log('SMS notification sent (mock)');
  }

  private async sendWebhook(
    _notification: Notification,
    _channel: NotificationChannel
  ): Promise<void> {
    // Mock webhook sending - in production, this would make HTTP request
    console.log('Webhook notification sent (mock)');
  }

  // Subscription management
  public subscribe(
    eventType: NotificationEventType | 'all',
    callback: (notification: Notification) => void
  ): void {
    const subscribers = this.subscribers.get(eventType) || [];
    subscribers.push(callback);
    this.subscribers.set(eventType, subscribers);
  }

  public unsubscribe(
    eventType: NotificationEventType | 'all',
    callback: (notification: Notification) => void
  ): void {
    const subscribers = this.subscribers.get(eventType) || [];
    const filtered = subscribers.filter(sub => sub !== callback);
    this.subscribers.set(eventType, filtered);
  }

  private notifySubscribers(notification: Notification): void {
    // Notify specific event type subscribers
    const eventSubscribers = this.subscribers.get(notification.eventType) || [];
    eventSubscribers.forEach(callback => callback(notification));

    // Notify 'all' subscribers
    const allSubscribers = this.subscribers.get('all') || [];
    allSubscribers.forEach(callback => callback(notification));
  }

  // Notification management
  public getNotifications(filters?: {
    isRead?: boolean;
    eventType?: NotificationEventType;
    priority?: string;
    limit?: number;
  }): Notification[] {
    let filtered = [...this.notifications];

    if (filters) {
      if (filters.isRead !== undefined) {
        filtered = filtered.filter(n => n.isRead === filters.isRead);
      }
      if (filters.eventType) {
        filtered = filtered.filter(n => n.eventType === filters.eventType);
      }
      if (filters.priority) {
        filtered = filtered.filter(n => n.priority === filters.priority);
      }
      if (filters.limit) {
        filtered = filtered.slice(0, filters.limit);
      }
    }

    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      return true;
    }
    return false;
  }

  public acknowledge(notificationId: string, acknowledgedBy: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isAcknowledged = true;
      notification.acknowledgedBy = acknowledgedBy;
      notification.acknowledgedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  public clearAll(): void {
    this.notifications = [];
  }

  // Channel and rule management
  public getChannels(): NotificationChannel[] {
    return Array.from(this.channels.values());
  }

  public updateChannel(channelId: string, updates: Partial<NotificationChannel>): boolean {
    const channel = this.channels.get(channelId);
    if (channel) {
      this.channels.set(channelId, { ...channel, ...updates });
      return true;
    }
    return false;
  }

  public getRules(): NotificationRule[] {
    return Array.from(this.rules.values());
  }

  public updateRule(ruleId: string, updates: Partial<NotificationRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.set(ruleId, { ...rule, ...updates });
      return true;
    }
    return false;
  }

  // Quick notification methods for common events
  public async notifyGeofenceViolation(
    vehicleId: string,
    driverId: string,
    zoneName: string,
    violationType: 'entry' | 'exit',
    location: { lat: number; lng: number; address?: string }
  ): Promise<void> {
    await this.createNotification('geofence_violation', {
      vehicleId,
      driverId,
      location,
      severity: 'high',
      metadata: { zoneName, violationType },
    });
  }

  public async notifySpeedViolation(
    vehicleId: string,
    driverId: string,
    currentSpeed: number,
    speedLimit: number,
    location: { lat: number; lng: number; address?: string }
  ): Promise<void> {
    await this.createNotification('speed_violation', {
      vehicleId,
      driverId,
      location,
      severity: 'medium',
      metadata: { currentSpeed, speedLimit, speedOver: currentSpeed - speedLimit },
    });
  }

  public async notifyETADelay(
    vehicleId: string,
    driverId: string,
    delayMinutes: number,
    newETA: string
  ): Promise<void> {
    await this.createNotification('eta_delay', {
      vehicleId,
      driverId,
      severity: delayMinutes > 60 ? 'high' : 'medium',
      metadata: { delayMinutes, newETA },
    });
  }

  // Cleanup
  public cleanup(): void {
    this.subscribers.clear();
    this.lastNotificationTime.clear();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
