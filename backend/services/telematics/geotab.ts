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


import axios from 'axios'
import { TelematicsProvider, TelematicsData } from './index'
import { logger } from '../../utils/logger'

interface GeotabCredentials {
  database: string
  username: string
  password: string
  server?: string
}

export class GeotabService implements TelematicsProvider {
  private credentials: GeotabCredentials | null = null
  private sessionId: string | null = null
  private server: string = 'my.geotab.com'

  constructor(credentials?: GeotabCredentials) {
    if (credentials) {
      this.credentials = credentials
      if (credentials.server) {
        this.server = credentials.server
      }
    }
  }

  /**
   * Set the credentials for Geotab
   */
  setCredentials(credentials: GeotabCredentials): void {
    this.credentials = credentials
    if (credentials.server) {
      this.server = credentials.server
    }
    this.sessionId = null; // Reset session when credentials change
  }

  /**
   * Authenticate with Geotab API
   */
  private async authenticate(): Promise<): Promise<): Promise<): Promise<): ): ): Promise<string> => {> {> { {> { {> {
    if (!this.credentials) {
      throw new Error('Geotab credentials not configured')
    }

    if (this.sessionId) {
      return this.sessionId; // Return existing session if available
    }

    try {
      const response = await axios.post(`https://${this.server}/apiv1`, {
        method: 'Authenticate',
        params: {
          database: this.credentials.database,
          userName: this.credentials.username,
          password: this.credentials.password,
        },
      })

      if (response.data.error) {
        throw new Error(`Geotab authentication error: ${response.data.error.message}`)
      }

      this.sessionId = response.data.result.credentials.sessionId

      // If server redirection is needed
      if (response.data.result.path && response.data.result.path !== this.server) {
        this.server = response.data.result.path
      }

      return this.sessionId
    } catch (error) {
      logger.error('Error authenticating with Geotab:', error)
      throw new Error(`Failed to authenticate with Geotab: ${error.message}`)
    }
  }

  /**
   * Make an authenticated call to Geotab API
   */
  private async callApi(method: string, params: any = {}): Promise<): Promise<): Promise<): Promise<): ): ): Promise<any> => {> {> { {> { {> {
    const sessionId = await this.authenticate()

    try {
      const response = await axios.post(`https://${this.server}/apiv1`, {
        method,
        params: {
          ...params,
          credentials: {
            sessionId,
          },
        },
      })

      if (response.data.error) {
        // If session expired, try to re-authenticate once
        if (response.data.error.code === -32000) {
          this.sessionId = null
          const newSessionId = await this.authenticate()

          // Retry the call with new session
          const retryResponse = await axios.post(`https://${this.server}/apiv1`, {
            method,
            params: {
              ...params,
              credentials: {
                sessionId: newSessionId,
              },
            },
          })

          if (retryResponse.data.error) {
            throw new Error(`Geotab API error: ${retryResponse.data.error.message}`)
          }

          return retryResponse.data.result
        }

        throw new Error(`Geotab API error: ${response.data.error.message}`)
      }

      return response.data.result
    } catch (error) {
      logger.error(`Error calling Geotab API method ${method}:`, error)
      throw new Error(`Failed to call Geotab API method ${method}: ${error.message}`)
    }
  }

  /**
   * Fetch vehicle data from Geotab
   */
  async fetchVehicleData(vehicleId: string): Promise<): Promise<): Promise<): Promise<): ): ): Promise<TelematicsData> => {> {> { {> { {> {
    try {
      // Get device info
      const device = await this.callApi('Get', {
        typeName: 'Device',
        search: {
          id: vehicleId,
        },
      })

      if (!device || device.length === 0) {
        throw new Error(`Vehicle with ID ${vehicleId} not found`)
      }

      // Get latest location
      const locationData = await this.callApi('GetDeviceStatusInfo', {
        deviceSearch: {
          id: vehicleId,
        },
      })

      // Get diagnostic data
      const diagnosticData = await this.callApi('GetFeed', {
        typeName: 'StatusData',
        search: {
          deviceSearch: {
            id: vehicleId,
          },
          diagnosticSearch: {
            id: 'DiagnosticEngineSpeedId', // Engine RPM as an example
          },
          fromDate: new Date(Date.now() - 3600000).toISOString(), // Last hour
        },
      })

      // Get fault codes
      const faultCodes = await this.callApi('Get', {
        typeName: 'FaultData',
        search: {
          deviceSearch: {
            id: vehicleId,
          },
          fromDate: new Date(Date.now() - 86400000).toISOString(), // Last 24 hours
        },
      })

      // Transform the data
      return {
        vehicleId,
        timestamp: new Date(),
        location:
          locationData.length > 0
            ? {
                latitude: locationData[0].latitude,
                longitude: locationData[0].longitude,
              }
            : undefined,
        speed: locationData.length > 0 ? locationData[0].speed : undefined,
        engineStatus:
          locationData.length > 0 ? (locationData[0].isDeviceOnline ? 'on' : 'off') : undefined,
        odometer: device[0].odometer,
        diagnosticCodes: faultCodes.map(fault => fault.code),
      }
    } catch (error) {
      logger.error('Error fetching vehicle data from Geotab:', error)
      throw new Error(`Failed to fetch vehicle data from Geotab: ${error.message}`)
    }
  }

  /**
   * Fetch driver data from Geotab
   */
  async fetchDriverData(driverId: string): Promise<): Promise<): Promise<): Promise<): ): ): Promise<any> => {> {> { {> { {> {
    try {
      // Get driver info
      const driver = await this.callApi('Get', {
        typeName: 'User',
        search: {
          id: driverId,
        },
      })

      if (!driver || driver.length === 0) {
        throw new Error(`Driver with ID ${driverId} not found`)
      }

      // Get driver logs (HOS)
      const driverLogs = await this.callApi('Get', {
        typeName: 'DutyStatusLog',
        search: {
          userSearch: {
            id: driverId,
          },
          fromDate: new Date(Date.now() - 86400000).toISOString(), // Last 24 hours
        },
      })

      // Calculate hours
      let drivingTime = 0
      let dutyTime = 0
      let restTime = 0

      driverLogs.forEach(log => {
        const duration =
          (new Date(log.toDateTime).getTime() - new Date(log.fromDateTime).getTime()) / 3600000; // hours

        switch (log.status) {
          case 'D': // Driving
            drivingTime += duration
            break
          case 'ON': // On Duty
            dutyTime += duration
            break
          case 'OFF': // Off Duty
          case 'SB': // Sleeper Berth
            restTime += duration
            break
        }
      })

      return {
        driverId,
        name: `${driver[0].firstName} ${driver[0].lastName}`,
        email: driver[0].email,
        licenseNumber: driver[0].licenseNumber,
        licenseState: driver[0].licenseState,
        hoursOfService: {
          drivingTime,
          dutyTime,
          restTime,
          status: driverLogs.length > 0 ? driverLogs[0].status : 'Unknown',
        },
      }
    } catch (error) {
      logger.error('Error fetching driver data from Geotab:', error)
      throw new Error(`Failed to fetch driver data from Geotab: ${error.message}`)
    }
  }

  /**
   * Fetch events from Geotab
   */
  async fetchEvents(startTime: Date, endTime: Date): Promise<): Promise<): Promise<): Promise<): ): ): Promise<any[]> => {> {> { {> { {> {
    try {
      // Get exception events
      const events = await this.callApi('Get', {
        typeName: 'ExceptionEvent',
        search: {
          fromDate: startTime.toISOString(),
          toDate: endTime.toISOString(),
        },
      })

      return events.map(event => ({
        type: event.rule.name,
        timestamp: new Date(event.activeFrom),
        vehicleId: event.device.id,
        driverId: event.driver ? event.driver.id : null,
        details: {
          description: event.rule.description,
          distance: event.distance,
          duration: event.duration,
          location: {
            latitude: event.latitude,
            longitude: event.longitude,
          },
        },
      }))
    } catch (error) {
      logger.error('Error fetching events from Geotab:', error)
      throw new Error(`Failed to fetch events from Geotab: ${error.message}`)
    }
  }

  /**
   * Subscribe to events from Geotab
   */
  async subscribeToEvents(eventTypes: string[], callbackUrl: string): Promise<): Promise<): Promise<): Promise<): ): ): Promise<any> => {> {> { {> { {> {
    try {
      // Map our event types to Geotab event types
      const geotabEventTypes = eventTypes.map(type => {
        switch (type) {
          case 'vehicle_location':
            return 'DeviceStatusInfo'
          case 'driver_hours':
            return 'DutyStatusLog'
          case 'safety_event':
            return 'ExceptionEvent'
          case 'diagnostic_fault':
            return 'FaultData'
          default:
            return type
        }
      })

      // Create feed subscription
      const subscription = await this.callApi('Add', {
        typeName: 'Subscription',
        entity: {
          name: 'ScaleMasterAI Integration',
          eventTypes: geotabEventTypes,
          callbackUrl,
        },
      })

      return {
        subscriptionId: subscription.id,
        eventTypes: geotabEventTypes,
      }
    } catch (error) {
      logger.error('Error subscribing to Geotab events:', error)
      throw new Error(`Failed to subscribe to Geotab events: ${error.message}`)
    }
  }
}
