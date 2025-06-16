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
 * Weight Capture Service
 * This service provides a unified interface for capturing weight data from various sources
 */

import {
  WeightCaptureProvider,
  WeightReading,
  CalibrationResult,
  ScaleConfig,
} from '@/types/scale-master';
import { DigitalScaleProvider } from './providers/digital-scale-provider';
import { IoTSensorProvider } from './providers/iot-sensor-provider';
import { CameraProvider } from './providers/camera-provider';
import { ManualEntryProvider } from './providers/manual-entry-provider';

export type WeightCaptureMethod = 'scale' | 'iot' | 'camera' | 'manual';

export class WeightCaptureService {
  private providers: Map<string, WeightCaptureProvider> = new Map();
  private activeProvider: WeightCaptureProvider | null = null;
  private activeProviderId: string | null = null;

  /**
   * Register a weight capture provider
   * @param id Unique identifier for the provider
   * @param provider The provider implementation
   */
  registerProvider(id: string, provider: WeightCaptureProvider): void {
    this.providers.set(id, provider);
  }

  /**
   * Get all registered provider IDs
   * @returns Array of provider IDs
   */
  getProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Initialize a digital scale provider with the given configuration
   * @param id Unique identifier for the provider
   * @param config Scale configuration
   * @returns True if initialization was successful
   */
  async initializeDigitalScale(id: string, config: ScaleConfig): Promise<boolean> {
    const provider = new DigitalScaleProvider(config);
    const success = await provider.initialize();

    if (success) {
      this.registerProvider(id, provider);
    }

    return success;
  }

  /**
   * Initialize an IoT sensor provider
   * @param id Unique identifier for the provider
   * @param config IoT sensor configuration
   * @returns True if initialization was successful
   */
  async initializeIoTSensor(id: string, config: any /* @ts-ignore */): Promise<boolean> {
    const provider = new IoTSensorProvider(config);
    const success = await provider.initialize();

    if (success) {
      this.registerProvider(id, provider);
    }

    return success;
  }

  /**
   * Initialize a camera-based weight capture provider
   * @param id Unique identifier for the provider
   * @returns True if initialization was successful
   */
  async initializeCamera(id: string): Promise<boolean> {
    const provider = new CameraProvider();
    const success = await provider.initialize();

    if (success) {
      this.registerProvider(id, provider);
    }

    return success;
  }

  /**
   * Initialize a manual entry provider
   * @param id Unique identifier for the provider
   * @returns True if initialization was successful
   */
  initializeManualEntry(id: string): boolean {
    const provider = new ManualEntryProvider();
    this.registerProvider(id, provider);
    return true;
  }

  /**
   * Set the active provider
   * @param id Provider ID
   * @returns True if provider was found and set as active
   */
  setActiveProvider(id: string): boolean {
    const provider = this.providers.get(id);

    if (!provider) {
      return false;
    }

    this.activeProvider = provider;
    this.activeProviderId = id;
    return true;
  }

  /**
   * Get the active provider ID
   * @returns Active provider ID or null if none is active
   */
  getActiveProviderId(): string | null {
    return this.activeProviderId;
  }

  /**
   * Start weight capture with the active provider
   * @throws Error if no active provider is set
   */
  async startCapture(): Promise<void> {
    if (!this.activeProvider) {
      throw new Error('No active weight capture provider set');
    }

    await this.activeProvider.startCapture();
  }

  /**
   * Get the current weight reading from the active provider
   * @returns Weight reading
   * @throws Error if no active provider is set
   */
  async getCurrentReading(): Promise<WeightReading> {
    if (!this.activeProvider) {
      throw new Error('No active weight capture provider set');
    }

    return await this.activeProvider.getCurrentReading();
  }

  /**
   * Stop weight capture with the active provider
   * @throws Error if no active provider is set
   */
  async stopCapture(): Promise<void> {
    if (!this.activeProvider) {
      throw new Error('No active weight capture provider set');
    }

    await this.activeProvider.stopCapture();
  }

  /**
   * Calibrate the active provider
   * @returns Calibration result
   * @throws Error if no active provider is set
   */
  async calibrate(): Promise<CalibrationResult> {
    if (!this.activeProvider) {
      throw new Error('No active weight capture provider set');
    }

    return await this.activeProvider.calibrate();
  }
}

// Create and export a singleton instance
export const weightCaptureService = new WeightCaptureService();
