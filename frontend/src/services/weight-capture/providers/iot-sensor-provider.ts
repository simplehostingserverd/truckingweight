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

/**
 * IoT Sensor Provider
 * This provider implements the WeightCaptureProvider interface for IoT weight sensors
 */

// Global type declarations
declare namespace NodeJS {
  interface Timeout {}
}

import {
  WeightCaptureProvider,
  WeightReading,
  CalibrationResult,
  AxleWeightReading,
  GeoLocation,
} from '@/types/scale-master';

// Mock IoT sensor client for development
class IoTSensorClient {
  private config: unknown;
  private connected: boolean = false;
  private mockData: unknown = {};

  constructor(config: unknown) {
    this.config = config;

    // Initialize mock data
    this.mockData = {
      sensorId: config.sensorId || 'iot-sensor-001',
      batteryLevel: 87,
      signalStrength: 4,
      lastCalibration: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    };
  }

  async connect(): Promise<boolean> {
    console.warn('Connecting to IoT sensor:', this.config);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.connected = true;
    return true;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async readSensor(): Promise<unknown> {
    if (!this.connected) {
      throw new Error('Not connected to IoT sensor');
    }

    // Simulate sensor reading delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate random weight data
    const baseWeight = Math.floor(Math.random() * 20000) + 20000;
    const noise = Math.random() * 200 - 100; // +/- 100 lbs of noise

    return {
      weight: baseWeight + noise,
      timestamp: new Date(),
      sensorId: this.mockData.sensorId,
      batteryLevel: this.mockData.batteryLevel,
      signalStrength: this.mockData.signalStrength,
      temperature: 72 + (Math.random() * 10 - 5), // 67-77 degrees F
      humidity: 45 + (Math.random() * 10 - 5), // 40-50% humidity
      axleData: [
        { id: 1, weight: Math.floor(Math.random() * 2000) + 8000 },
        { id: 2, weight: Math.floor(Math.random() * 2000) + 8000 },
        { id: 3, weight: Math.floor(Math.random() * 2000) + 8000 },
        { id: 4, weight: Math.floor(Math.random() * 2000) + 8000 },
        { id: 5, weight: Math.floor(Math.random() * 2000) + 8000 },
      ],
    };
  }

  async calibrate(): Promise<unknown> {
    if (!this.connected) {
      throw new Error('Not connected to IoT sensor');
    }

    // Simulate calibration delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    this.mockData.lastCalibration = new Date();

    return {
      success: true,
      oldOffset: 135.7,
      newOffset: 0,
      calibrationId: `cal-${Date.now()}`,
      sensorId: this.mockData.sensorId,
    };
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      // Simulate disconnection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      this.connected = false;
    }
  }
}

export class IoTSensorProvider implements WeightCaptureProvider {
  private client: IoTSensorClient | null = null;
  private config: unknown;
  private isCapturing: boolean = false;
  private captureInterval: typeof typeof NodeJS !== "undefined" ? NodeJS !== "undefined" ? typeof NodeJS !== "undefined" ? NodeJS.Timeout | null = null;
  private lastReading: WeightReading | null = null;

  constructor(config: unknown) {
    this.config = config;
  }

  async initialize(): Promise<boolean> {
    try {
      this.client = new IoTSensorClient(this.config);
      const connected = await this.client.connect();
      return connected;
    } catch (error) {
      console.error('Failed to initialize IoT sensor:', error);
      return false;
    }
  }

  async startCapture(): Promise<void> {
    if (!this.client || !this.client.isConnected()) {
      throw new Error('IoT sensor not initialized or not connected');
    }

    if (this.isCapturing) {
      return;
    }

    this.isCapturing = true;

    // Start capturing weight readings at regular intervals
    this.captureInterval = setInterval(async () => {
      try {
        const sensorData = await this.client!.readSensor();

        // Convert axle data to the expected format
        const axleWeights: AxleWeightReading[] = sensorData.axleData.map(
          (axle: unknown) => ({
            position: axle.id,
            weight: axle.weight,
            maxLegal: this.getMaxLegalWeight(axle.id),
          })
        );

        // Create a new weight reading
        this.lastReading = {
          timestamp: new Date(),
          grossWeight: sensorData.weight,
          tareWeight: null,
          netWeight: null,
          unit: 'lb',
          axleWeights,
          confidence: 0.92, // Slightly lower confidence for IoT sensors
          deviceId: sensorData.sensorId,
          captureMethod: 'iot',
          locationData: await this.getCurrentLocation(),
          rawSensorData: {
            batteryLevel: sensorData.batteryLevel,
            signalStrength: sensorData.signalStrength,
            temperature: sensorData.temperature,
            humidity: sensorData.humidity,
          },
        };
      } catch (error) {
        console.error('Error capturing IoT sensor reading:', error);
      }
    }, 2000); // Capture every 2 seconds
  }

  async getCurrentReading(): Promise<WeightReading> {
    if (!this.isCapturing || !this.lastReading) {
      throw new Error('Weight capture not started or no reading available');
    }

    return this.lastReading;
  }

  async stopCapture(): Promise<void> {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    this.isCapturing = false;
  }

  async calibrate(): Promise<CalibrationResult> {
    if (!this.client || !this.client.isConnected()) {
      throw new Error('IoT sensor not initialized or not connected');
    }

    const result = await this.client.calibrate();

    return {
      success: result.success,
      previousOffset: result.oldOffset,
      newOffset: result.newOffset,
      timestamp: new Date(),
      performedBy: 'System',
    };
  }

  private getMaxLegalWeight(axlePosition: number): number {
    // Return max legal weight based on axle position
    const maxWeights: Record<number, number> = {
      1: 12000, // Steering axle
      2: 34000, // Drive axles (tandem)
      3: 34000,
      4: 20000, // Trailer axles
      5: 20000,
    };

    return maxWeights[axlePosition] || 20000;
  }

  private async getCurrentLocation(): Promise<GeoLocation | undefined> {
    // In a real implementation, this would get the location from the IoT device
    // For now, return a mock location
    return {
      latitude: 39.9612,
      longitude: -82.9988,
      accuracy: 15,
    };
  }
}
