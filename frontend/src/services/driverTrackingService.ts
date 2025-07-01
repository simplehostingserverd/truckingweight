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

import { getAuthToken } from '@/lib/auth';

export interface LiveDriver {
  id: string;
  name: string;
  vehicleId: string;
  vehiclePlate: string;
  status: 'active' | 'inactive' | 'break' | 'offline';
  location: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  speed: number;
  heading: number;
  route?: {
    id: string;
    name: string;
    progress: number;
    eta: string;
  };
  alerts: Array<{
    id: string;
    type: 'speed' | 'geofence' | 'route' | 'maintenance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
  }>;
}

export interface RouteHistory {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehiclePlate: string;
  startTime: string;
  endTime: string;
  startLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  endLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  distance: number;
  duration: number;
  averageSpeed: number;
  maxSpeed: number;
  fuelUsed: number;
  stops: Array<{
    location: { lat: number; lng: number; address: string };
    duration: number;
    timestamp: string;
  }>;
  violations: Array<{
    type: string;
    location: { lat: number; lng: number };
    timestamp: string;
    severity: string;
  }>;
  path: Array<{ lat: number; lng: number; timestamp: string }>;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'circular' | 'polygon';
  coordinates: Array<{ lat: number; lng: number }>;
  radius?: number;
  isActive: boolean;
  alertOnEntry: boolean;
  alertOnExit: boolean;
  allowedVehicles: string[];
  restrictions: {
    timeWindows: Array<{
      start: string;
      end: string;
      days: string[];
    }>;
    speedLimit?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GeofenceViolation {
  id: string;
  zoneId: string;
  zoneName: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehiclePlate: string;
  type: 'entry' | 'exit' | 'speed' | 'time';
  timestamp: string;
  location: { lat: number; lng: number };
  severity: 'low' | 'medium' | 'high';
  acknowledged: boolean;
}

export interface Notification {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'emergency';
  category: 'safety' | 'route' | 'geofence' | 'maintenance' | 'compliance';
  title: string;
  message: string;
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehiclePlate?: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  acknowledged: boolean;
  escalated: boolean;
  location?: { lat: number; lng: number; address: string };
  actions?: Array<{
    id: string;
    label: string;
    type: 'acknowledge' | 'escalate' | 'dismiss' | 'contact';
  }>;
}

export interface AnalyticsData {
  fleetMetrics: {
    totalDrivers: number;
    activeDrivers: number;
    totalVehicles: number;
    activeVehicles: number;
    totalDistance: number;
    totalFuelUsed: number;
    averageSpeed: number;
    safetyScore: number;
  };
  driverMetrics: Array<{
    driverId: string;
    driverName: string;
    totalDistance: number;
    totalDriveTime: number;
    averageSpeed: number;
    fuelEfficiency: number;
    safetyScore: number;
    violations: number;
    onTimeDeliveries: number;
  }>;
  timeSeriesData: {
    performance: Array<{
      date: string;
      distance: number;
      fuelUsed: number;
      averageSpeed: number;
    }>;
    safety: Array<{
      date: string;
      violations: number;
      accidents: number;
      safetyScore: number;
    }>;
    efficiency: Array<{
      date: string;
      fuelEfficiency: number;
      onTimeDeliveries: number;
      idleTime: number;
    }>;
  };
}

class DriverTrackingService {
  private baseUrl = '/api/driver-tracking';

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await getAuthToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Live tracking methods
  async getLiveDrivers(): Promise<{ success: boolean; data: LiveDriver[] }> {
    return this.makeRequest('/live');
  }

  // Route history methods
  async getRouteHistory(params?: {
    driverId?: string;
    vehicleId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: RouteHistory[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/routes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // Geofencing methods
  async getGeofences(): Promise<{ success: boolean; zones: GeofenceZone[]; violations: GeofenceViolation[] }> {
    return this.makeRequest('/geofences');
  }

  async createGeofence(zone: Omit<GeofenceZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; zone: GeofenceZone }> {
    return this.makeRequest('/geofences', {
      method: 'POST',
      body: JSON.stringify(zone),
    });
  }

  // Notifications methods
  async getNotifications(params?: {
    type?: string;
    category?: string;
    priority?: string;
    read?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: Notification[]; total: number; unreadCount: number }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // Analytics methods
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    driverId?: string;
    vehicleId?: string;
  }): Promise<{ success: boolean; data: AnalyticsData }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }
}

export const driverTrackingService = new DriverTrackingService();