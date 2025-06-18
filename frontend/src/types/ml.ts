/**
 * Machine Learning Types
 * Type definitions for ML models, predictions, and AI-powered features
 */

// ML Model Input/Output Types
export interface ETAPredictionInput {
  loadId: string;
  distance: number;
  trafficConditions: 'light' | 'moderate' | 'heavy' | 'severe';
  weatherConditions: 'clear' | 'cloudy' | 'rain' | 'snow' | 'fog';
  driverExperience?: number;
  vehicleType?: string;
  timeOfDay?: string;
}

export interface ETAPredictionOutput {
  estimatedArrivalTime: string;
  confidenceScore: number;
  factors: {
    traffic: number;
    weather: number;
    driverPerformance: number;
    routeComplexity: number;
  };
  alternativeRoutes?: Array<{
    route: string;
    estimatedTime: string;
    confidence: number;
  }>;
}

export interface DynamicPricingInput {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  loadType: string;
  weight: number;
  equipmentType: string;
  pickupDate?: string;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface DynamicPricingOutput {
  baseRate: number;
  adjustedRate: number;
  adjustmentFactors: {
    demand: number;
    fuel: number;
    seasonal: number;
    capacity: number;
    market: number;
  };
  confidenceScore: number;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface MaintenancePredictionInput {
  vehicleId: string;
  mileage: number;
  engineHours: number;
  lastMaintenance: string;
  faultCodes?: string[];
  telematicsData?: Record<string, unknown>;
}

export interface MaintenancePredictionOutput {
  predictions: Array<{
    componentType: string;
    failureProbability: number;
    estimatedFailureDate: string;
    recommendedAction: 'monitor' | 'schedule_maintenance' | 'immediate_attention';
    costImpact: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }>;
  overallRiskScore: number;
  nextMaintenanceDate: string;
}

export interface RouteOptimizationInput {
  origin: string;
  destination: string;
  stops?: Array<{
    address: string;
    type: 'pickup' | 'delivery';
    timeWindow?: { start: string; end: string };
  }>;
  vehicleConstraints?: {
    maxWeight: number;
    maxVolume: number;
    fuelType: string;
  };
  preferences?: {
    prioritizeFuel: boolean;
    prioritizeTime: boolean;
    avoidTolls: boolean;
  };
}

export interface RouteOptimizationOutput {
  optimizedRoute: {
    waypoints: Array<{
      address: string;
      coordinates: [number, number];
      estimatedArrival: string;
    }>;
    totalDistance: number;
    totalTime: number;
    fuelConsumption: number;
    tollCosts: number;
  };
  alternatives: Array<{
    route: string;
    distance: number;
    time: number;
    cost: number;
  }>;
}

export interface DemandForecastingInput {
  region: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  equipmentType?: string;
  seasonalFactors?: boolean;
}

export interface DemandForecastingOutput {
  forecast: Array<{
    period: string;
    demandLevel: 'low' | 'medium' | 'high' | 'peak';
    confidence: number;
    expectedLoads: number;
    priceImpact: number;
  }>;
  trends: {
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number;
    seasonality: boolean;
  };
}

// Union types for ML inputs and outputs
export type MLInput = 
  | ETAPredictionInput 
  | DynamicPricingInput 
  | MaintenancePredictionInput 
  | RouteOptimizationInput 
  | DemandForecastingInput 
  | Record<string, unknown>;

export type MLOutput = 
  | ETAPredictionOutput 
  | DynamicPricingOutput 
  | MaintenancePredictionOutput 
  | RouteOptimizationOutput 
  | DemandForecastingOutput 
  | Record<string, unknown>;

// ML Model Interface
export interface MLModel {
  id: string;
  name: string;
  type: 'eta_prediction' | 'dynamic_pricing' | 'maintenance_prediction' | 'route_optimization' | 'demand_forecasting';
  status: 'active' | 'training' | 'inactive' | 'error' | 'pending';
  version: string;
  accuracy: number;
  lastTrained: string;
  lastPrediction: string;
  totalPredictions: number;
  successRate: number;
  description: string;
  features: string[];
  trainingData: {
    samples: number;
    lastUpdate: string;
    sources: string[];
  };
  performance: {
    latency: number; // ms
    throughput: number; // predictions/hour
    errorRate: number;
    confidence: number;
  };
  configuration: {
    autoRetrain: boolean;
    retrainThreshold: number;
    maxPredictions: number;
    alertThreshold: number;
  };
}

// ML Prediction Interface
export interface Prediction {
  id: string;
  modelId: string;
  modelName: string;
  type: string;
  input: MLInput;
  output: MLOutput;
  confidence: number;
  timestamp: string;
  executionTime: number;
  status: 'success' | 'error' | 'pending';
  actualOutcome?: Record<string, unknown>;
  accuracy?: number;
}

// ML Metrics Interface
export interface MLMetrics {
  totalModels: number;
  activeModels: number;
  totalPredictions: number;
  averageAccuracy: number;
  averageLatency: number;
  errorRate: number;
  costSavings: number;
  revenueImpact: number;
}
