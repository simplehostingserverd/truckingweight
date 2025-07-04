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

import { v4 as uuidv4 } from 'uuid';
import { SamsaraService } from './samsara';
import { GeotabService } from './geotab';
import { logger } from '../../utils/logger';
import cacheService from '../../services/cache/index.js';
import prisma from '../../config/prisma';

export interface TelematicsData {
  vehicleId: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  speed?: number;
  engineStatus?: 'on' | 'off';
  fuelLevel?: number;
  odometer?: number;
  diagnosticCodes?: string[];
  driverHours?: {
    drivingTime: number;
    dutyTime: number;
    restTime: number;
  };
  events?: {
    type: string;
    timestamp: Date;
    details: TelematicsEventDetails;
  }[];
}

export interface TelematicsEventDetails {
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  severity?: string;
  eventType?: string;
  description?: string;
  [key: string]: unknown;
}

export interface TelematicsDriverData {
  driverId: string;
  name: string;
  phone?: string;
  licenseNumber?: string;
  licenseState?: string;
  eldExempt?: boolean;
  eldExemptReason?: string;
  hoursOfService?: {
    drivingTime: number;
    dutyTime: number;
    restTime: number;
    cycleRemaining: number;
    status: string;
  };
  [key: string]: unknown;
}

export interface TelematicsEvent {
  type: string;
  timestamp: Date;
  vehicleId?: string;
  driverId?: string;
  details: TelematicsEventDetails;
}

export interface TelematicsSubscription {
  subscriptionId: string;
  status: string;
  eventTypes: string[];
  [key: string]: unknown;
}

export interface TelematicsProvider {
  fetchVehicleData(vehicleId: string): Promise<TelematicsData>;
  fetchDriverData(driverId: string): Promise<TelematicsDriverData>;
  fetchEvents(startTime: Date, endTime: Date): Promise<TelematicsEvent[]>;
  subscribeToEvents(eventTypes: string[], callbackUrl: string): Promise<TelematicsSubscription>;
}

export class TelematicsService {
  private providers: Map<string, TelematicsProvider> = new Map();

  constructor() {
    // Initialize providers
    this.providers.set('samsara', new SamsaraService());
    this.providers.set('geotab', new GeotabService());
  }

  /**
   * Get a telematics provider instance
   */
  getProvider(providerName: string): TelematicsProvider | null {
    return this.providers.get(providerName.toLowerCase()) || null;
  }

  /**
   * Fetch vehicle data from a telematics provider
   */
  async fetchVehicleData(connectionId: string, vehicleId: string): Promise<TelematicsData | null> {
    try {
      // Get the integration connection
      const connection = await prisma.integration_connections.findUnique({
        where: { id: connectionId },
      });

      if (!connection || connection.integration_type !== 'telematics' || !connection.is_active) {
        throw new Error('Invalid or inactive telematics connection');
      }

      // Get the provider
      const provider = this.getProvider(connection.provider);
      if (!provider) {
        throw new Error(`Unsupported telematics provider: ${connection.provider}`);
      }

      // Check cache first
      const cacheKey = `telematics:vehicle:${vehicleId}`;
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData && typeof cachedData === 'object' && 'vehicleId' in cachedData && 'timestamp' in cachedData) {
        return cachedData as TelematicsData;
      }

      // Fetch data from provider
      const data = await provider.fetchVehicleData(vehicleId);

      // Cache the data for 5 minutes
      await cacheService.set(cacheKey, data, 300);

      // Log the successful fetch
      await this.logTelematicsEvent(connectionId, 'fetch_vehicle_data', 'success', {
        vehicleId,
        timestamp: new Date(),
      });

      return data;
    } catch (error) {
      logger.error('Error fetching vehicle data:', error);

      // Log the error
      await this.logTelematicsEvent(connectionId, 'fetch_vehicle_data', 'error', {
        vehicleId,
        error: error.message,
      });

      return null;
    }
  }

  /**
   * Fetch driver data from a telematics provider
   */
  async fetchDriverData(connectionId: string, driverId: string): Promise<any | null> {
    try {
      // Get the integration connection
      const connection = await prisma.integration_connections.findUnique({
        where: { id: connectionId },
      });

      if (!connection || connection.integration_type !== 'telematics' || !connection.is_active) {
        throw new Error('Invalid or inactive telematics connection');
      }

      // Get the provider
      const provider = this.getProvider(connection.provider);
      if (!provider) {
        throw new Error(`Unsupported telematics provider: ${connection.provider}`);
      }

      // Check cache first
      const cacheKey = `telematics:driver:${driverId}`;
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Fetch data from provider
      const data = await provider.fetchDriverData(driverId);

      // Cache the data for 5 minutes
      await cacheService.set(cacheKey, data, 300);

      // Log the successful fetch
      await this.logTelematicsEvent(connectionId, 'fetch_driver_data', 'success', {
        driverId,
        timestamp: new Date(),
      });

      return data;
    } catch (error) {
      logger.error('Error fetching driver data:', error);

      // Log the error
      await this.logTelematicsEvent(connectionId, 'fetch_driver_data', 'error', {
        driverId,
        error: error.message,
      });

      return null;
    }
  }

  /**
   * Subscribe to telematics events
   */
  async subscribeToEvents(
    connectionId: string,
    eventTypes: string[],
    callbackUrl: string
  ): Promise<boolean> {
    try {
      // Get the integration connection
      const connection = await prisma.integration_connections.findUnique({
        where: { id: connectionId },
      });

      if (!connection || connection.integration_type !== 'telematics' || !connection.is_active) {
        throw new Error('Invalid or inactive telematics connection');
      }

      // Get the provider
      const provider = this.getProvider(connection.provider);
      if (!provider) {
        throw new Error(`Unsupported telematics provider: ${connection.provider}`);
      }

      // Subscribe to events
      await provider.subscribeToEvents(eventTypes, callbackUrl);

      // Log the successful subscription
      await this.logTelematicsEvent(connectionId, 'subscribe_events', 'success', {
        eventTypes,
        callbackUrl,
      });

      return true;
    } catch (error) {
      logger.error('Error subscribing to telematics events:', error);

      // Log the error
      await this.logTelematicsEvent(connectionId, 'subscribe_events', 'error', {
        eventTypes,
        callbackUrl,
        error: error.message,
      });

      return false;
    }
  }

  /**
   * Log a telematics event
   */
  private async logTelematicsEvent(
    connectionId: string,
    eventType: string,
    status: 'success' | 'error' | 'warning',
    details: Record<string, unknown>
  ): Promise<void> {
    try {
      await prisma.integration_logs.create({
        data: {
          id: uuidv4(),
          integration_connection_id: connectionId,
          event_type: eventType,
          status,
          message: `Telematics ${eventType} ${status}`,
          details,
        },
      });
    } catch (error) {
      logger.error('Error logging telematics event:', error);
    }
  }
}

// Export singleton instance
export const telematicsService = new TelematicsService();
