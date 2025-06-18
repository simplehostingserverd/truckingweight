/**
 * Machine Learning Service
 * AI-driven ETA predictions, dynamic pricing, and predictive maintenance
 */

import prisma from '../../config/prisma';
import { logger } from '../../utils/logger';
import * as tf from '@tensorflow/tfjs-node';

export interface ETAPredictionRequest {
  loadId: number;
  routeId: number;
  currentLocation: { latitude: number; longitude: number };
  trafficConditions?: 'light' | 'moderate' | 'heavy';
  weatherConditions?: 'clear' | 'rain' | 'snow' | 'fog';
}

export interface ETAPrediction {
  estimatedArrivalTime: Date;
  confidenceScore: number;
  factors: {
    traffic: number;
    weather: number;
    driverPerformance: number;
    routeComplexity: number;
  };
  alternativeETAs: {
    optimistic: Date;
    pessimistic: Date;
  };
}

export interface DynamicPricingRequest {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  loadType: string;
  weight: number;
  pickupDate: Date;
  equipmentType: string;
}

export interface DynamicPricingResult {
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
  validUntil: Date;
}

export interface MaintenancePrediction {
  vehicleId: number;
  componentType: string;
  failureProbability: number;
  estimatedFailureDate: Date;
  recommendedAction: 'monitor' | 'schedule_maintenance' | 'immediate_attention';
  costImpact: number;
}

export class MLService {
  private etaModel: tf.LayersModel | null = null;
  private pricingModel: tf.LayersModel | null = null;
  private maintenanceModel: tf.LayersModel | null = null;

  constructor() {
    this.initializeModels();
  }

  /**
   * Initialize ML models
   */
  private async initializeModels(): Promise<void> {
    try {
      // Load pre-trained models (in production, these would be actual trained models)
      // For now, we'll create simple models for demonstration
      await this.createETAModel();
      await this.createPricingModel();
      await this.createMaintenanceModel();
      
      logger.info('ML models initialized successfully');
    } catch (error) {
      logger.error('Error initializing ML models:', error);
    }
  }

  /**
   * Predict ETA using machine learning
   */
  async predictETA(request: ETAPredictionRequest): Promise<ETAPrediction> {
    try {
      // Get route details
      const route = await prisma.routes.findUnique({
        where: { id: request.routeId },
        include: {
          loads: true,
          drivers: true,
          vehicles: true
        }
      });

      if (!route) {
        throw new Error('Route not found');
      }

      // Prepare input features
      const features = await this.prepareETAFeatures(request, route);

      // Make prediction using the model
      const prediction = await this.runETAPrediction(features);

      // Get driver performance factor
      const driverPerformance = await this.getDriverPerformanceFactor(route.driver_id);

      // Calculate confidence score
      const confidenceScore = this.calculateETAConfidence(features, prediction);

      // Calculate alternative ETAs
      const baseETA = new Date(Date.now() + prediction.hours * 60 * 60 * 1000);
      const optimisticETA = new Date(baseETA.getTime() - 0.15 * prediction.hours * 60 * 60 * 1000);
      const pessimisticETA = new Date(baseETA.getTime() + 0.25 * prediction.hours * 60 * 60 * 1000);

      // Store prediction for accuracy tracking
      await this.storePrediction('eta_prediction', {
        loadId: request.loadId,
        routeId: request.routeId,
        predictedValue: prediction.hours,
        confidenceScore,
        inputFeatures: features
      });

      return {
        estimatedArrivalTime: baseETA,
        confidenceScore,
        factors: {
          traffic: features.trafficFactor,
          weather: features.weatherFactor,
          driverPerformance,
          routeComplexity: features.routeComplexity
        },
        alternativeETAs: {
          optimistic: optimisticETA,
          pessimistic: pessimisticETA
        }
      };

    } catch (error) {
      logger.error('Error predicting ETA:', error);
      throw error;
    }
  }

  /**
   * Calculate dynamic pricing using ML
   */
  async calculateDynamicPricing(request: DynamicPricingRequest): Promise<DynamicPricingResult> {
    try {
      // Calculate base rate using distance and standard rates
      const distance = this.calculateDistance(
        request.origin.latitude, request.origin.longitude,
        request.destination.latitude, request.destination.longitude
      );

      const baseRatePerMile = await this.getBaseRatePerMile(request.equipmentType);
      const baseRate = distance * baseRatePerMile;

      // Prepare features for pricing model
      const features = await this.preparePricingFeatures(request, distance);

      // Run pricing model
      const adjustmentMultiplier = await this.runPricingPrediction(features);

      // Calculate individual adjustment factors
      const adjustmentFactors = {
        demand: await this.getDemandFactor(request.origin, request.destination, request.pickupDate),
        fuel: await this.getFuelPriceFactor(),
        seasonal: this.getSeasonalFactor(request.pickupDate),
        capacity: await this.getCapacityFactor(request.origin, request.pickupDate),
        market: await this.getMarketFactor(request.origin, request.destination)
      };

      const adjustedRate = baseRate * adjustmentMultiplier;
      const confidenceScore = this.calculatePricingConfidence(features);

      // Store prediction
      await this.storePrediction('dynamic_pricing', {
        origin: request.origin,
        destination: request.destination,
        baseRate,
        adjustedRate,
        adjustmentMultiplier,
        confidenceScore
      });

      return {
        baseRate,
        adjustedRate,
        adjustmentFactors,
        confidenceScore,
        validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000) // Valid for 4 hours
      };

    } catch (error) {
      logger.error('Error calculating dynamic pricing:', error);
      throw error;
    }
  }

  /**
   * Predict maintenance needs using ML
   */
  async predictMaintenance(vehicleId: number): Promise<MaintenancePrediction[]> {
    try {
      // Get vehicle data and maintenance history
      const vehicle = await prisma.vehicles.findUnique({
        where: { id: vehicleId },
        include: {
          maintenance_work_orders: {
            orderBy: { created_at: 'desc' },
            take: 50
          },
          vehicle_telematics_data: {
            orderBy: { timestamp: 'desc' },
            take: 1000
          }
        }
      });

      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      const predictions: MaintenancePrediction[] = [];

      // Predict for different components
      const components = ['brakes', 'engine', 'transmission', 'tires', 'electrical'];

      for (const component of components) {
        const features = await this.prepareMaintenanceFeatures(vehicle, component);
        const prediction = await this.runMaintenancePrediction(features);

        if (prediction.failureProbability > 0.1) { // Only include if >10% probability
          predictions.push({
            vehicleId,
            componentType: component,
            failureProbability: prediction.failureProbability,
            estimatedFailureDate: new Date(Date.now() + prediction.daysUntilFailure * 24 * 60 * 60 * 1000),
            recommendedAction: this.getMaintenanceRecommendation(prediction.failureProbability),
            costImpact: this.estimateMaintenanceCost(component, prediction.failureProbability)
          });
        }
      }

      // Store predictions
      for (const prediction of predictions) {
        await this.storePrediction('maintenance_prediction', prediction);
      }

      return predictions.sort((a, b) => b.failureProbability - a.failureProbability);

    } catch (error) {
      logger.error('Error predicting maintenance:', error);
      throw error;
    }
  }

  /**
   * Create ETA prediction model
   */
  private async createETAModel(): Promise<void> {
    this.etaModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    this.etaModel.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
  }

  /**
   * Create dynamic pricing model
   */
  private async createPricingModel(): Promise<void> {
    this.pricingModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [8], units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    this.pricingModel.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });
  }

  /**
   * Create maintenance prediction model
   */
  private async createMaintenanceModel(): Promise<void> {
    this.maintenanceModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [15], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 2, activation: 'softmax' }) // [probability, days_until_failure]
      ]
    });

    this.maintenanceModel.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy'
    });
  }

  /**
   * Prepare features for ETA prediction
   */
  private async prepareETAFeatures(request: ETAPredictionRequest, route: any): Promise<any> {
    return {
      distance: route.total_miles,
      trafficFactor: this.getTrafficFactor(request.trafficConditions),
      weatherFactor: this.getWeatherFactor(request.weatherConditions),
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      routeComplexity: this.calculateRouteComplexity(route),
      vehicleType: route.vehicles?.type === 'truck' ? 1 : 0,
      driverExperience: await this.getDriverExperience(route.driver_id),
      historicalPerformance: await this.getHistoricalPerformance(route.driver_id),
      currentSpeed: 65 // Would come from telematics
    };
  }

  /**
   * Run ETA prediction
   */
  private async runETAPrediction(_features: any): Promise<{ hours: number }> {
    if (!this.etaModel) {
      throw new Error('ETA model not initialized');
    }

    const inputTensor = tf.tensor2d([[
      features.distance,
      features.trafficFactor,
      features.weatherFactor,
      features.timeOfDay,
      features.dayOfWeek,
      features.routeComplexity,
      features.vehicleType,
      features.driverExperience,
      features.historicalPerformance,
      features.currentSpeed
    ]]);

    const prediction = this.etaModel.predict(inputTensor) as tf.Tensor;
    const hours = await prediction.data();
    
    inputTensor.dispose();
    prediction.dispose();

    return { hours: hours[0] };
  }

  /**
   * Store prediction for accuracy tracking
   */
  private async storePrediction(type: string, data: any): Promise<void> {
    await prisma.ml_predictions.create({
      data: {
        model_id: 1, // Would reference actual model
        prediction_type: type,
        input_features: data,
        predicted_value: data.predictedValue || data.adjustedRate || data.failureProbability,
        confidence_score: data.confidenceScore,
        prediction_date: new Date(),
        company_id: data.companyId || 1
      }
    });
  }

  // Helper methods
  private getTrafficFactor(conditions?: string): number {
    switch (conditions) {
      case 'light': return 1.0;
      case 'moderate': return 1.2;
      case 'heavy': return 1.5;
      default: return 1.1;
    }
  }

  private getWeatherFactor(conditions?: string): number {
    switch (conditions) {
      case 'clear': return 1.0;
      case 'rain': return 1.1;
      case 'snow': return 1.3;
      case 'fog': return 1.2;
      default: return 1.0;
    }
  }

  private calculateRouteComplexity(route: any): number {
    // Simplified complexity calculation
    return Math.min(route.total_miles / 100, 5.0);
  }

  private async getDriverExperience(driverId: number): Promise<number> {
    const driver = await prisma.drivers.findUnique({
      where: { id: driverId }
    });
    
    if (driver?.hire_date) {
      const yearsExperience = (Date.now() - driver.hire_date.getTime()) / (365 * 24 * 60 * 60 * 1000);
      return Math.min(yearsExperience, 10) / 10; // Normalize to 0-1
    }
    
    return 0.5; // Default for unknown
  }

  private async getHistoricalPerformance(driverId: number): Promise<number> {
    const performance = await prisma.driver_performance_metrics.findFirst({
      where: { driver_id: driverId },
      orderBy: { calculated_at: 'desc' }
    });

    return performance?.on_time_deliveries && performance?.total_deliveries
      ? performance.on_time_deliveries / performance.total_deliveries
      : 0.8; // Default
  }

  private calculateETAConfidence(features: any, prediction: any): number {
    // Simplified confidence calculation
    let confidence = 0.8;
    
    if (features.trafficFactor > 1.3) confidence -= 0.1;
    if (features.weatherFactor > 1.2) confidence -= 0.1;
    if (features.historicalPerformance < 0.7) confidence -= 0.1;
    
    return Math.max(0.5, confidence);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async getBaseRatePerMile(equipmentType: string): Promise<number> {
    // Base rates per mile by equipment type
    const rates = {
      'dry_van': 2.50,
      'refrigerated': 3.00,
      'flatbed': 2.75,
      'tanker': 3.25
    };
    return rates[equipmentType as keyof typeof rates] || 2.50;
  }

  private async preparePricingFeatures(request: DynamicPricingRequest, distance: number): Promise<any> {
    return {
      distance,
      weight: request.weight,
      equipmentType: request.equipmentType === 'refrigerated' ? 1 : 0,
      dayOfWeek: request.pickupDate.getDay(),
      month: request.pickupDate.getMonth(),
      fuelPrice: await this.getCurrentFuelPrice(),
      demandIndex: await this.getDemandIndex(request.origin, request.destination),
      seasonalFactor: this.getSeasonalFactor(request.pickupDate)
    };
  }

  private async runPricingPrediction(_features: any): Promise<number> {
    // Simplified pricing adjustment (would use actual model)
    let multiplier = 1.0;
    
    if (features.demandIndex > 0.8) multiplier += 0.15;
    if (features.fuelPrice > 3.5) multiplier += 0.1;
    if (features.seasonalFactor > 1.1) multiplier += 0.05;
    
    return multiplier;
  }

  private async getDemandFactor(origin: any, destination: any, date: Date): Promise<number> {
    // Would analyze historical demand patterns
    return 0.8; // Mock value
  }

  private async getFuelPriceFactor(): Promise<number> {
    const currentPrice = await this.getCurrentFuelPrice();
    const basePrice = 3.0;
    return Math.max(0.8, currentPrice / basePrice);
  }

  private getSeasonalFactor(date: Date): number {
    const month = date.getMonth();
    // Higher rates during peak shipping seasons
    if (month >= 10 || month <= 1) return 1.15; // Holiday season
    if (month >= 5 && month <= 8) return 1.05; // Summer
    return 1.0;
  }

  private async getCapacityFactor(origin: any, date: Date): Promise<number> {
    // Would analyze available capacity in the area
    return 1.0; // Mock value
  }

  private async getMarketFactor(_origin: any, _destination: any): Promise<number> {
    // Would analyze market conditions for this lane
    return 1.0; // Mock value
  }

  private calculatePricingConfidence(_features: any): number {
    return 0.85; // Mock confidence
  }

  private async getCurrentFuelPrice(): Promise<number> {
    // Would integrate with fuel price APIs
    return 3.45;
  }

  private async getDemandIndex(_origin: any, _destination: any): Promise<number> {
    // Would calculate demand index for this lane
    return 0.7;
  }

  private async prepareMaintenanceFeatures(vehicle: any, component: string): Promise<any> {
    // Would prepare features based on vehicle data, telematics, maintenance history
    return {};
  }

  private async runMaintenancePrediction(_features: any): Promise<any> {
    // Would run actual maintenance prediction model
    return {
      failureProbability: Math.random() * 0.3, // Mock
      daysUntilFailure: Math.random() * 180 + 30 // Mock
    };
  }

  private getMaintenanceRecommendation(probability: number): 'monitor' | 'schedule_maintenance' | 'immediate_attention' {
    if (probability > 0.7) return 'immediate_attention';
    if (probability > 0.4) return 'schedule_maintenance';
    return 'monitor';
  }

  private estimateMaintenanceCost(component: string, probability: number): number {
    const baseCosts = {
      brakes: 1500,
      engine: 5000,
      transmission: 3500,
      tires: 800,
      electrical: 1200
    };
    
    const baseCost = baseCosts[component as keyof typeof baseCosts] || 1000;
    return baseCost * (1 + probability); // Higher probability = higher cost
  }

  private async getDriverPerformanceFactor(driverId: number): Promise<number> {
    const performance = await prisma.driver_performance_metrics.findFirst({
      where: { driver_id: driverId },
      orderBy: { calculated_at: 'desc' }
    });

    return performance?.safety_score ? performance.safety_score / 100 : 0.8;
  }
}
