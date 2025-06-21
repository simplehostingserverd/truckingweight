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

export interface GeofenceZone {
  id: string;
  name: string;
  description: string;
  type: 'circular' | 'polygon' | 'rectangle';
  coordinates: {
    center?: { lat: number; lng: number };
    radius?: number; // in meters
    points?: { lat: number; lng: number }[];
  };
  alertType: 'entry' | 'exit' | 'both';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: {
    color: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    allowedVehicles?: string[];
    restrictedVehicles?: string[];
    timeRestrictions?: {
      startTime: string;
      endTime: string;
      daysOfWeek: number[]; // 0-6, Sunday = 0
    };
  };
}

export interface GeofenceViolation {
  id: string;
  vehicleId: string;
  driverId: string;
  zoneId: string;
  zoneName: string;
  violationType: 'entry' | 'exit';
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  notes?: string;
}

export interface GeofenceAlert {
  id: string;
  violationId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  recipients: string[];
}

import { logger } from '@/utils/logger';

class GeofencingService {
  private zones: Map<string, GeofenceZone> = new Map();
  private violations: GeofenceViolation[] = [];
  private alerts: GeofenceAlert[] = [];
  private alertCallbacks: ((alert: GeofenceAlert) => void)[] = [];

  constructor() {
    this.initializeMockZones();
  }

  private initializeMockZones(): void {
    // Create some mock geofence zones
    const mockZones: GeofenceZone[] = [
      {
        id: 'zone-1',
        name: 'Dallas Distribution Center',
        description: 'Main distribution facility in Dallas',
        type: 'circular',
        coordinates: {
          center: { lat: 32.7767, lng: -96.797 },
          radius: 500, // 500 meters
        },
        alertType: 'both',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          color: '#22c55e',
          priority: 'medium',
          allowedVehicles: [],
          restrictedVehicles: [],
        },
      },
      {
        id: 'zone-2',
        name: 'Customer Delivery Zone',
        description: 'High-priority customer delivery area',
        type: 'rectangle',
        coordinates: {
          points: [
            { lat: 32.7867, lng: -96.807 },
            { lat: 32.7867, lng: -96.787 },
            { lat: 32.7667, lng: -96.787 },
            { lat: 32.7667, lng: -96.807 },
          ],
        },
        alertType: 'entry',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          color: '#3b82f6',
          priority: 'high',
          timeRestrictions: {
            startTime: '08:00',
            endTime: '17:00',
            daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
          },
        },
      },
      {
        id: 'zone-3',
        name: 'Restricted Area',
        description: 'No truck access zone',
        type: 'polygon',
        coordinates: {
          points: [
            { lat: 32.7967, lng: -96.817 },
            { lat: 32.7967, lng: -96.797 },
            { lat: 32.7867, lng: -96.797 },
            { lat: 32.7867, lng: -96.807 },
            { lat: 32.7917, lng: -96.817 },
          ],
        },
        alertType: 'entry',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          color: '#ef4444',
          priority: 'critical',
          restrictedVehicles: ['all'],
        },
      },
    ];

    mockZones.forEach(zone => {
      this.zones.set(zone.id, zone);
    });
  }

  // Zone management
  public createZone(zone: Omit<GeofenceZone, 'id' | 'createdAt' | 'updatedAt'>): GeofenceZone {
    const newZone: GeofenceZone = {
      ...zone,
      id: `zone-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.zones.set(newZone.id, newZone);
    return newZone;
  }

  public updateZone(zoneId: string, updates: Partial<GeofenceZone>): GeofenceZone | null {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;

    const updatedZone = {
      ...zone,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.zones.set(zoneId, updatedZone);
    return updatedZone;
  }

  public deleteZone(zoneId: string): boolean {
    return this.zones.delete(zoneId);
  }

  public getZone(zoneId: string): GeofenceZone | null {
    return this.zones.get(zoneId) || null;
  }

  public getAllZones(): GeofenceZone[] {
    return Array.from(this.zones.values());
  }

  public getActiveZones(): GeofenceZone[] {
    return Array.from(this.zones.values()).filter(zone => zone.isActive);
  }

  // Geofence checking
  public checkVehiclePosition(
    vehicleId: string,
    driverId: string,
    latitude: number,
    longitude: number
  ): GeofenceViolation[] {
    const violations: GeofenceViolation[] = [];
    const activeZones = this.getActiveZones();

    for (const zone of activeZones) {
      const isInside = this.isPointInZone(latitude, longitude, zone);
      const wasInside = this.wasVehicleInZone(vehicleId, zone.id);

      // Check for entry violation
      if (isInside && !wasInside && (zone.alertType === 'entry' || zone.alertType === 'both')) {
        if (this.shouldTriggerAlert(zone, vehicleId, 'entry')) {
          const violation = this.createViolation(
            vehicleId,
            driverId,
            zone,
            'entry',
            latitude,
            longitude
          );
          violations.push(violation);
        }
      }

      // Check for exit violation
      if (!isInside && wasInside && (zone.alertType === 'exit' || zone.alertType === 'both')) {
        if (this.shouldTriggerAlert(zone, vehicleId, 'exit')) {
          const violation = this.createViolation(
            vehicleId,
            driverId,
            zone,
            'exit',
            latitude,
            longitude
          );
          violations.push(violation);
        }
      }

      // Update vehicle zone status
      this.updateVehicleZoneStatus(vehicleId, zone.id, isInside);
    }

    return violations;
  }

  private isPointInZone(latitude: number, longitude: number, zone: GeofenceZone): boolean {
    switch (zone.type) {
      case 'circular':
        return this.isPointInCircle(latitude, longitude, zone);
      case 'rectangle':
        return this.isPointInRectangle(latitude, longitude, zone);
      case 'polygon':
        return this.isPointInPolygon(latitude, longitude, zone);
      default:
        return false;
    }
  }

  private isPointInCircle(latitude: number, longitude: number, zone: GeofenceZone): boolean {
    if (!zone.coordinates.center || !zone.coordinates.radius) return false;

    const distance = this.calculateDistance(
      latitude,
      longitude,
      zone.coordinates.center.lat,
      zone.coordinates.center.lng
    );

    return distance <= zone.coordinates.radius;
  }

  private isPointInRectangle(latitude: number, longitude: number, zone: GeofenceZone): boolean {
    if (!zone.coordinates.points || zone.coordinates.points.length !== 4) return false;

    const points = zone.coordinates.points;
    const minLat = Math.min(...points.map(p => p.lat));
    const maxLat = Math.max(...points.map(p => p.lat));
    const minLng = Math.min(...points.map(p => p.lng));
    const maxLng = Math.max(...points.map(p => p.lng));

    return latitude >= minLat && latitude <= maxLat && longitude >= minLng && longitude <= maxLng;
  }

  private isPointInPolygon(latitude: number, longitude: number, zone: GeofenceZone): boolean {
    if (!zone.coordinates.points || zone.coordinates.points.length < 3) return false;

    const points = zone.coordinates.points;
    let inside = false;

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      if (
        points[i].lat > latitude !== points[j].lat > latitude &&
        longitude <
          ((points[j].lng - points[i].lng) * (latitude - points[i].lat)) /
            (points[j].lat - points[i].lat) +
            points[i].lng
      ) {
        inside = !inside;
      }
    }

    return inside;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private wasVehicleInZone(vehicleId: string, zoneId: string): boolean {
    // In a real implementation, this would check a database or cache
    // For now, return false to simulate first-time entry
    return Math.random() > 0.8; // 20% chance vehicle was already in zone
  }

  private shouldTriggerAlert(
    zone: GeofenceZone,
    vehicleId: string,
    violationType: 'entry' | 'exit'
  ): boolean {
    // Check time restrictions
    if (zone.metadata.timeRestrictions) {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const currentDay = now.getDay();

      const startTime = parseInt(zone.metadata.timeRestrictions.startTime.replace(':', ''));
      const endTime = parseInt(zone.metadata.timeRestrictions.endTime.replace(':', ''));

      if (
        !zone.metadata.timeRestrictions.daysOfWeek.includes(currentDay) ||
        currentTime < startTime ||
        currentTime > endTime
      ) {
        return false;
      }
    }

    // Check vehicle restrictions
    if (zone.metadata.allowedVehicles && zone.metadata.allowedVehicles.length > 0) {
      return zone.metadata.allowedVehicles.includes(vehicleId);
    }

    if (zone.metadata.restrictedVehicles && zone.metadata.restrictedVehicles.includes(vehicleId)) {
      return false;
    }

    return true;
  }

  private createViolation(
    vehicleId: string,
    driverId: string,
    zone: GeofenceZone,
    violationType: 'entry' | 'exit',
    latitude: number,
    longitude: number
  ): GeofenceViolation {
    const violation: GeofenceViolation = {
      id: `violation-${Date.now()}`,
      vehicleId,
      driverId,
      zoneId: zone.id,
      zoneName: zone.name,
      violationType,
      timestamp: new Date().toISOString(),
      location: { latitude, longitude },
      severity: zone.metadata.priority,
      acknowledged: false,
    };

    this.violations.push(violation);
    this.createAlert(violation);
    return violation;
  }

  private createAlert(violation: GeofenceViolation): void {
    const alert: GeofenceAlert = {
      id: `alert-${Date.now()}`,
      violationId: violation.id,
      message: `Vehicle ${violation.vehicleId} ${violation.violationType === 'entry' ? 'entered' : 'exited'} ${violation.zoneName}`,
      timestamp: violation.timestamp,
      isRead: false,
      recipients: ['dispatcher', 'fleet-manager'],
    };

    this.alerts.push(alert);
    this.notifyAlertCallbacks(alert);
  }

  private updateVehicleZoneStatus(vehicleId: string, zoneId: string, isInside: boolean): void {
    // In a real implementation, this would update a database or cache
    // For now, we'll just log it
    logger.info(
      `Vehicle ${vehicleId} is ${isInside ? 'inside' : 'outside'} zone ${zoneId}`,
      { vehicleId, zoneId, isInside },
      'GeofencingService'
    );
  }

  // Alert management
  public subscribeToAlerts(callback: (alert: GeofenceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  public unsubscribeFromAlerts(callback: (alert: GeofenceAlert) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  private notifyAlertCallbacks(alert: GeofenceAlert): void {
    this.alertCallbacks.forEach(callback => callback(alert));
  }

  // Violation management
  public getViolations(filters?: {
    vehicleId?: string;
    zoneId?: string;
    startDate?: string;
    endDate?: string;
    acknowledged?: boolean;
  }): GeofenceViolation[] {
    let filteredViolations = [...this.violations];

    if (filters) {
      if (filters.vehicleId) {
        filteredViolations = filteredViolations.filter(v => v.vehicleId === filters.vehicleId);
      }
      if (filters.zoneId) {
        filteredViolations = filteredViolations.filter(v => v.zoneId === filters.zoneId);
      }
      if (filters.startDate) {
        filteredViolations = filteredViolations.filter(v => v.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredViolations = filteredViolations.filter(v => v.timestamp <= filters.endDate!);
      }
      if (filters.acknowledged !== undefined) {
        filteredViolations = filteredViolations.filter(
          v => v.acknowledged === filters.acknowledged
        );
      }
    }

    return filteredViolations.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public acknowledgeViolation(
    violationId: string,
    acknowledgedBy: string,
    notes?: string
  ): boolean {
    const violation = this.violations.find(v => v.id === violationId);
    if (!violation) return false;

    violation.acknowledged = true;
    violation.acknowledgedBy = acknowledgedBy;
    violation.acknowledgedAt = new Date().toISOString();
    violation.notes = notes;

    return true;
  }

  // Alert management
  public getAlerts(unreadOnly = false): GeofenceAlert[] {
    const alerts = unreadOnly ? this.alerts.filter(a => !a.isRead) : this.alerts;
    return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public markAlertAsRead(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.isRead = true;
    return true;
  }

  public clearAllAlerts(): void {
    this.alerts = [];
  }

  // Cleanup method
  public cleanup(): void {
    this.alertCallbacks = [];
    this.alerts = [];
  }
}

// Export singleton instance
export const geofencingService = new GeofencingService();
