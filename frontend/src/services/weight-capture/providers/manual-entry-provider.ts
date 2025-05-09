/**
 * Manual Entry Provider
 * This provider implements the WeightCaptureProvider interface for manual weight entry
 */

import { 
  WeightCaptureProvider, 
  WeightReading, 
  CalibrationResult,
  AxleWeightReading,
  GeoLocation
} from '@/types/scale-master';

export class ManualEntryProvider implements WeightCaptureProvider {
  private manualWeight: number | null = null;
  private manualTareWeight: number | null = null;
  private manualAxleWeights: AxleWeightReading[] = [];
  private lastReading: WeightReading | null = null;
  
  async initialize(): Promise<boolean> {
    // No initialization needed for manual entry
    return true;
  }
  
  async startCapture(): Promise<void> {
    // No continuous capture for manual entry
    // We'll just create a reading based on the manually entered values
    this.updateReading();
  }
  
  async getCurrentReading(): Promise<WeightReading> {
    if (!this.lastReading) {
      throw new Error('No manual weight reading available');
    }
    
    return this.lastReading;
  }
  
  async stopCapture(): Promise<void> {
    // No continuous capture to stop for manual entry
  }
  
  async calibrate(): Promise<CalibrationResult> {
    // Calibration doesn't apply to manual entry
    return {
      success: true,
      previousOffset: 0,
      newOffset: 0,
      timestamp: new Date(),
      performedBy: 'System'
    };
  }
  
  /**
   * Set the manually entered gross weight
   * @param weight The gross weight value
   */
  setGrossWeight(weight: number): void {
    this.manualWeight = weight;
    this.updateReading();
  }
  
  /**
   * Set the manually entered tare weight
   * @param weight The tare weight value
   */
  setTareWeight(weight: number): void {
    this.manualTareWeight = weight;
    this.updateReading();
  }
  
  /**
   * Set the manually entered axle weights
   * @param axleWeights Array of axle weights
   */
  setAxleWeights(axleWeights: AxleWeightReading[]): void {
    this.manualAxleWeights = axleWeights;
    this.updateReading();
  }
  
  /**
   * Update the weight reading based on manually entered values
   */
  private updateReading(): void {
    // Calculate net weight if both gross and tare are available
    let netWeight = null;
    if (this.manualWeight !== null && this.manualTareWeight !== null) {
      netWeight = this.manualWeight - this.manualTareWeight;
    }
    
    this.lastReading = {
      timestamp: new Date(),
      grossWeight: this.manualWeight || 0,
      tareWeight: this.manualTareWeight,
      netWeight,
      unit: 'lb',
      axleWeights: this.manualAxleWeights,
      confidence: 0.5, // Lower confidence for manual entry
      deviceId: 'manual-entry',
      captureMethod: 'manual',
      locationData: undefined // No location data for manual entry
    };
  }
}
