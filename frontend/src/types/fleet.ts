/**
 * Fleet Management Types
 * Type definitions for vehicles, drivers, and fleet operations
 */

// Vehicle Types
export interface Vehicle {
  id: number;
  name: string;
  type: string;
  license_plate: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Out of Service';
  company_id: number;
  created_at?: string;
  updated_at?: string;
  // Additional vehicle properties
  mileage?: number;
  fuel_type?: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  max_weight?: number;
  max_volume?: number;
  current_location?: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp?: string;
  };
}

// Driver Types
export interface Driver {
  id: number;
  name: string;
  license_number: string;
  license_class?: string;
  license_expiry?: string;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Suspended';
  company_id: number;
  created_at?: string;
  updated_at?: string;
  // Additional driver properties
  phone?: string;
  email?: string;
  hire_date?: string;
  experience_years?: number;
  safety_score?: number;
  performance_rating?: number;
  current_location?: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp?: string;
  };
}

// Load Types
export interface Load {
  id: number;
  description: string;
  origin: string;
  destination: string;
  weight: string;
  status: 'Pending' | 'Assigned' | 'In Transit' | 'Delivered' | 'Cancelled';
  vehicle_id?: number;
  driver_id?: number;
  company_id: number;
  estimated_departure?: string;
  estimated_arrival?: string;
  actual_departure?: string;
  actual_arrival?: string;
  distance?: string;
  duration?: string;
  route_details?: string; // JSON string
  created_at?: string;
  updated_at?: string;
  // Additional load properties
  load_number?: string;
  customer_name?: string;
  rate?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  equipment_type?: string;
  special_instructions?: string;
  stops?: LoadStop[];
}

export interface LoadStop {
  id: number;
  type: 'pickup' | 'delivery' | 'stop';
  location: string;
  scheduledTime: string;
  actualTime?: string;
  status: 'pending' | 'arrived' | 'completed' | 'delayed';
  contactName?: string;
  contactPhone?: string;
  notes?: string;
}

// Route Types
export interface RouteDetails {
  distance: number;
  duration: number; // in seconds
  waypoints: Array<{
    lat: number;
    lng: number;
    name?: string;
    address?: string;
  }>;
  estimatedDeparture?: string;
  estimatedArrival?: string;
  fuelConsumption?: number;
  tollCosts?: number;
}

export interface RouteWaypoint {
  coordinates: [number, number]; // [longitude, latitude]
  name?: string;
  address?: string;
  type?: 'origin' | 'destination' | 'stop';
}

export interface RouteData {
  waypoints: RouteWaypoint[];
  distance: string;
  duration: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  route?: {
    duration: number;
    distance: number;
    geometry?: unknown;
  };
}

// Scale Types
export interface Scale {
  id: number;
  name: string;
  location: string;
  type: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  company_id: number;
  created_at?: string;
  updated_at?: string;
  // Additional scale properties
  max_capacity?: number;
  accuracy?: number;
  last_calibration?: string;
  next_calibration?: string;
  serial_number?: string;
  manufacturer?: string;
  model?: string;
}

// Weight Reading Types
export interface WeightReading {
  id: number;
  scale_id: number;
  vehicle_id?: number;
  driver_id?: number;
  gross_weight: number;
  tare_weight?: number;
  net_weight?: number;
  timestamp: string;
  status: 'Valid' | 'Invalid' | 'Under Review';
  notes?: string;
  created_at?: string;
  // Additional weight reading properties
  axle_weights?: Array<{
    position: number;
    weight: number;
    max_legal: number;
  }>;
  compliance_status?: 'Compliant' | 'Overweight' | 'Violation';
  violation_amount?: number;
}

// Company Types
export interface Company {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  dot_number?: string;
  mc_number?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  created_at?: string;
  updated_at?: string;
  // Additional company properties
  fleet_size?: number;
  operating_authority?: string[];
  insurance_info?: {
    provider: string;
    policy_number: string;
    expiry_date: string;
    coverage_amount: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'manager' | 'dispatcher' | 'driver' | 'viewer';
  company_id: number;
  status: 'Active' | 'Inactive' | 'Pending';
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  // Additional user properties
  phone?: string;
  permissions?: string[];
  preferences?: Record<string, unknown>;
}
