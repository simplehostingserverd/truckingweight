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
 * ScaleMasterAI Type Definitions
 * This file contains TypeScript interfaces for the ScaleMasterAI database schema
 */

export interface AxleConfiguration {
  id: number;
  name: string;
  description: string | null;
  axle_count: number;
  configuration_type: string;
  is_specialized: boolean;
  created_at: string;
  updated_at: string;
}

export interface Axle {
  id: number;
  configuration_id: number;
  position: number;
  max_legal_weight: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleExtended {
  id: number;
  name: string;
  type: string;
  license_plate: string;
  vin: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  status: 'Active' | 'Maintenance' | 'Out of Service';
  max_weight: string | null;
  company_id: number;
  created_at: string;
  updated_at: string;
  // Extended fields
  axle_configuration_id: number | null;
  empty_weight: number | null;
  max_gross_weight: number | null;
  height: number | null;
  width: number | null;
  length: number | null;
  telematics_id: string | null;
  eld_integration: boolean;
  last_inspection_date: string | null;
  // Relationships
  axle_configuration?: AxleConfiguration;
}

export interface ScaleFacility {
  id: number;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  company_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Scale {
  id: number;
  name: string;
  facility_id: number;
  scale_type: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  max_capacity: number;
  precision: number;
  unit: string;
  ip_address: string | null;
  port: number | null;
  protocol: string | null;
  last_calibration_date: string | null;
  next_calibration_date: string | null;
  status: 'Active' | 'Maintenance' | 'Out of Service';
  company_id: number;
  created_at: string;
  updated_at: string;
  // Relationships
  facility?: ScaleFacility;
}

export interface WeighTicket {
  id: number;
  ticket_number: string;
  vehicle_id: number | null;
  driver_id: number | null;
  scale_id: number | null;
  facility_id: number | null;
  gross_weight: number | null;
  tare_weight: number | null;
  net_weight: number | null;
  unit: string;
  date_time: string;
  status: 'Created' | 'Completed' | 'Voided' | 'Error';
  compliance_status: 'Compliant' | 'Warning' | 'Non-Compliant' | null;
  capture_method: 'Scale' | 'IoT' | 'Camera' | 'Manual';
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  company_id: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relationships
  vehicle?: VehicleExtended;
  driver?: Driver;
  scale?: Scale;
  facility?: ScaleFacility;
  axle_weights?: AxleWeight[];
  cargo?: Cargo;
  images?: TicketImage[];
  signatures?: TicketSignature[];
  compliance_issues?: ComplianceIssue[];
}

export interface AxleWeight {
  id: number;
  weigh_ticket_id: number;
  axle_position: number;
  weight: number;
  max_legal_weight: number;
  compliance_status: 'Compliant' | 'Warning' | 'Non-Compliant';
  created_at: string;
  updated_at: string;
}

export interface Cargo {
  id: number;
  weigh_ticket_id: number;
  description: string;
  commodity_type: string | null;
  is_hazmat: boolean;
  hazmat_class: string | null;
  volume: number | null;
  volume_unit: string | null;
  density: number | null;
  created_at: string;
  updated_at: string;
}

export interface TicketImage {
  id: number;
  weigh_ticket_id: number;
  image_url: string;
  image_type: 'Vehicle' | 'Cargo' | 'Document';
  captured_by: string;
  created_at: string;
}

export interface TicketSignature {
  id: number;
  weigh_ticket_id: number;
  signature_url: string;
  name: string;
  role: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface ComplianceIssue {
  id: number;
  weigh_ticket_id: number;
  issue_type: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendation: string | null;
  created_at: string;
}

export interface ScaleCalibration {
  id: number;
  scale_id: number;
  calibration_date: string;
  performed_by: string | null;
  certificate_number: string | null;
  notes: string | null;
  next_calibration_date: string | null;
  created_at: string;
}

export interface ScaleReading {
  id: number;
  scale_id: number;
  reading_value: number;
  reading_type: string;
  timestamp: string;
  is_anomaly: boolean;
  confidence_score: number | null;
}

export interface LoadOptimization {
  id: number;
  weigh_ticket_id: number;
  original_distribution: any; // JSON
  suggested_distribution: any; // JSON
  expected_improvement: number;
  explanation: string | null;
  applied: boolean;
  created_at: string;
}

export interface PredictiveAlert {
  id: number;
  vehicle_id: number;
  driver_id: number | null;
  alert_type: string;
  risk_score: number;
  description: string;
  recommendation: string | null;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
}

// Type for the weight capture provider
export interface WeightCaptureProvider {
  initialize(): Promise<boolean>;
  startCapture(): Promise<void>;
  getCurrentReading(): Promise<WeightReading>;
  stopCapture(): Promise<void>;
  calibrate(): Promise<CalibrationResult>;
}

// Weight Reading Data Structure
export interface WeightReading {
  timestamp: Date;
  grossWeight: number;
  tareWeight: number | null;
  netWeight: number | null;
  unit: 'kg' | 'lb';
  axleWeights?: AxleWeightReading[];
  confidence: number;
  deviceId: string;
  captureMethod: 'scale' | 'iot' | 'camera' | 'manual';
  locationData?: GeoLocation;
  rawSensorData?: any;
}

export interface AxleWeightReading {
  position: number;
  weight: number;
  maxLegal: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface CalibrationResult {
  success: boolean;
  previousOffset: number;
  newOffset: number;
  timestamp: Date;
  performedBy: string;
}

// Scale Configuration
export interface ScaleConfig {
  ipAddress: string;
  port: number;
  protocol: string;
  authKey?: string;
}

// Driver interface (extended from existing)
export interface Driver {
  id: number;
  name: string;
  license_number: string;
  license_expiry: string | null;
  phone: string | null;
  email: string | null;
  status: 'Active' | 'On Leave' | 'Inactive';
  company_id: number;
  created_at: string;
  updated_at: string;
}
