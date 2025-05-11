import axios from 'axios';
import { TelematicsProvider, TelematicsData } from './index';
import { logger } from '../../utils/logger';

const SAMSARA_API_BASE_URL = 'https://api.samsara.com/v1';

export class SamsaraService implements TelematicsProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SAMSARA_API_KEY || '';
  }

  /**
   * Set the API key for Samsara
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Get the HTTP headers for Samsara API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * Fetch vehicle data from Samsara
   */
  async fetchVehicleData(vehicleId: string): Promise<TelematicsData> => {
    try {
      // Validate API key
      if (!this.apiKey) {
        throw new Error('Samsara API key not configured');
      }

      // Fetch vehicle location
      const locationResponse = await axios.get(
        `${SAMSARA_API_BASE_URL}/fleet/vehicles/${vehicleId}/locations`,
        { headers: this.getHeaders() }
      );

      // Fetch vehicle stats
      const statsResponse = await axios.get(
        `${SAMSARA_API_BASE_URL}/fleet/vehicles/${vehicleId}/stats`,
        { headers: this.getHeaders() }
      );

      // Extract and transform the data
      const location = locationResponse.data.location;
      const stats = statsResponse.data;

      return {
        vehicleId,
        timestamp: new Date(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        speed: stats.speed,
        engineStatus: stats.engineState === 'Running' ? 'on' : 'off',
        fuelLevel: stats.fuelLevelPercent,
        odometer: stats.odometerMeters / 1609.34, // Convert meters to miles
        diagnosticCodes: stats.faultCodes?.map(code => code.faultCode) || [],
      };
    } catch (error) {
      logger.error('Error fetching vehicle data from Samsara:', error);
      throw new Error(`Failed to fetch vehicle data from Samsara: ${error.message}`);
    }
  }

  /**
   * Fetch driver data from Samsara
   */
  async fetchDriverData(driverId: string): Promise<any> => {
    try {
      // Validate API key
      if (!this.apiKey) {
        throw new Error('Samsara API key not configured');
      }

      // Fetch driver details
      const driverResponse = await axios.get(`${SAMSARA_API_BASE_URL}/fleet/drivers/${driverId}`, {
        headers: this.getHeaders(),
      });

      // Fetch driver HOS (Hours of Service)
      const hosResponse = await axios.get(
        `${SAMSARA_API_BASE_URL}/fleet/drivers/${driverId}/hos_daily_logs`,
        { headers: this.getHeaders() }
      );

      // Extract and transform the data
      const driver = driverResponse.data;
      const hos = hosResponse.data;

      return {
        driverId,
        name: driver.name,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber,
        licenseState: driver.licenseState,
        eldExempt: driver.eldExempt,
        eldExemptReason: driver.eldExemptReason,
        hoursOfService: {
          drivingTime: hos.drivingMs / 3600000, // Convert ms to hours
          dutyTime: hos.onDutyMs / 3600000,
          restTime: hos.restMs / 3600000,
          cycleRemaining: hos.cycleRemainingMs / 3600000,
          status: hos.status,
        },
      };
    } catch (error) {
      logger.error('Error fetching driver data from Samsara:', error);
      throw new Error(`Failed to fetch driver data from Samsara: ${error.message}`);
    }
  }

  /**
   * Fetch events from Samsara
   */
  async fetchEvents(startTime: Date, endTime: Date): Promise<any[]> => {
    try {
      // Validate API key
      if (!this.apiKey) {
        throw new Error('Samsara API key not configured');
      }

      // Convert dates to Unix timestamps (ms)
      const startMs = startTime.getTime();
      const endMs = endTime.getTime();

      // Fetch events
      const response = await axios.get(`${SAMSARA_API_BASE_URL}/events`, {
        headers: this.getHeaders(),
        params: {
          types: 'harsh_event,safety_event,driver_safety_score',
          startMs,
          endMs,
        },
      });

      return response.data.events.map(event => ({
        type: event.type,
        timestamp: new Date(event.timestamp),
        vehicleId: event.vehicle?.id,
        driverId: event.driver?.id,
        details: {
          location: event.location,
          severity: event.severity,
          eventType: event.eventType,
          description: event.description,
        },
      }));
    } catch (error) {
      logger.error('Error fetching events from Samsara:', error);
      throw new Error(`Failed to fetch events from Samsara: ${error.message}`);
    }
  }

  /**
   * Subscribe to events from Samsara
   */
  async subscribeToEvents(eventTypes: string[], callbackUrl: string): Promise<any> => {
    try {
      // Validate API key
      if (!this.apiKey) {
        throw new Error('Samsara API key not configured');
      }

      // Map our event types to Samsara event types
      const samsaraEventTypes = eventTypes.map(type => {
        switch (type) {
          case 'vehicle_location':
            return 'vehicle.location';
          case 'driver_hours':
            return 'driver.hours_of_service';
          case 'safety_event':
            return 'safety.event';
          case 'diagnostic_fault':
            return 'vehicle.diagnostic_fault';
          default:
            return type;
        }
      });

      // Create webhook subscription
      const response = await axios.post(
        `${SAMSARA_API_BASE_URL}/webhooks`,
        {
          name: 'ScaleMasterAI Integration',
          url: callbackUrl,
          eventTypes: samsaraEventTypes,
        },
        { headers: this.getHeaders() }
      );

      return {
        subscriptionId: response.data.id,
        status: response.data.status,
        eventTypes: response.data.eventTypes,
      };
    } catch (error) {
      logger.error('Error subscribing to Samsara events:', error);
      throw new Error(`Failed to subscribe to Samsara events: ${error.message}`);
    }
  }
}
