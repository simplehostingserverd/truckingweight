/**
 * Advanced Dispatch & Route Optimization Service
 * Handles automated load assignment, route planning, and driver matching
 */

import prisma from '../../config/prisma';
import { RouteOptimizationService } from './RouteOptimizationService';
import { DriverMatchingService } from './DriverMatchingService';
import { logger } from '../../utils/logger';

export interface LoadAssignmentRequest {
  loadId: number;
  companyId: number;
  priority?: number;
  constraints?: {
    maxDistance?: number;
    requiredEquipment?: string[];
    hazmatRequired?: boolean;
    temperatureControlled?: boolean;
  };
}

export interface DispatchResult {
  success: boolean;
  loadId: number;
  assignedVehicleId?: number;
  assignedDriverId?: number;
  assignedTrailerId?: number;
  routeId?: number;
  estimatedCost?: number;
  estimatedDuration?: number;
  optimizationScore?: number;
  reasons?: string[];
}

export class DispatchService {
  private routeOptimizer: RouteOptimizationService;
  private driverMatcher: DriverMatchingService;

  constructor() {
    this.routeOptimizer = new RouteOptimizationService();
    this.driverMatcher = new DriverMatchingService();
  }

  /**
   * Automatically assign a load to the best available driver/vehicle combination
   */
  async autoAssignLoad(request: LoadAssignmentRequest): Promise<DispatchResult> {
    try {
      logger.info(`Starting auto-assignment for load ${request.loadId}`);

      // Get load details
      const load = await prisma.loads.findUnique({
        where: { id: request.loadId },
        include: {
          load_stops: {
            orderBy: { stop_number: 'asc' }
          }
        }
      });

      if (!load) {
        return {
          success: false,
          loadId: request.loadId,
          reasons: ['Load not found']
        };
      }

      // Find available vehicles
      const availableVehicles = await this.getAvailableVehicles(request.companyId, load);
      
      if (availableVehicles.length === 0) {
        return {
          success: false,
          loadId: request.loadId,
          reasons: ['No available vehicles found']
        };
      }

      // Score and rank vehicle/driver combinations
      const scoredOptions = await this.scoreDispatchOptions(load, availableVehicles);
      
      if (scoredOptions.length === 0) {
        return {
          success: false,
          loadId: request.loadId,
          reasons: ['No suitable vehicle/driver combinations found']
        };
      }

      // Select the best option
      const bestOption = scoredOptions[0];

      // Create optimized route
      const route = await this.routeOptimizer.createOptimizedRoute({
        loadId: load.id,
        vehicleId: bestOption.vehicleId,
        driverId: bestOption.driverId,
        trailerId: bestOption.trailerId,
        stops: load.load_stops
      });

      // Assign the load
      await this.assignLoad(load.id, bestOption, route?.id);

      return {
        success: true,
        loadId: load.id,
        assignedVehicleId: bestOption.vehicleId,
        assignedDriverId: bestOption.driverId,
        assignedTrailerId: bestOption.trailerId,
        routeId: route?.id,
        estimatedCost: route?.fuel_cost_estimate + route?.toll_cost_estimate,
        estimatedDuration: route?.estimated_duration_hours,
        optimizationScore: bestOption.score
      };

    } catch (error) {
      logger.error('Error in auto-assignment:', error);
      return {
        success: false,
        loadId: request.loadId,
        reasons: ['Internal error during assignment']
      };
    }
  }

  /**
   * Get available vehicles that can handle the load
   */
  private async getAvailableVehicles(companyId: number, load: any) {
    const vehicles = await prisma.vehicles.findMany({
      where: {
        company_id: companyId,
        status: 'Active',
        // Add equipment requirements based on load
        ...(load.hazmat_class && {
          // Vehicle must be hazmat certified
        }),
        ...(load.temperature_min && {
          // Vehicle must have reefer capability
        })
      },
      include: {
        drivers: {
          where: {
            status: 'Active',
            // Driver must be available (not on another load)
            current_load_id: null
          }
        }
      }
    });

    return vehicles.filter(vehicle => vehicle.drivers.length > 0);
  }

  /**
   * Score dispatch options based on multiple criteria
   */
  private async scoreDispatchOptions(load: any, vehicles: any[]) {
    const scoredOptions = [];

    for (const vehicle of vehicles) {
      for (const driver of vehicle.drivers) {
        const score = await this.calculateDispatchScore(load, vehicle, driver);
        
        if (score > 0) {
          scoredOptions.push({
            vehicleId: vehicle.id,
            driverId: driver.id,
            trailerId: await this.findBestTrailer(load, vehicle.company_id),
            score,
            vehicle,
            driver
          });
        }
      }
    }

    // Sort by score (highest first)
    return scoredOptions.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate dispatch score based on multiple factors
   */
  private async calculateDispatchScore(load: any, vehicle: any, driver: any): Promise<number> {
    let score = 100; // Start with perfect score

    // Distance factor (closer is better)
    const distanceScore = await this.calculateDistanceScore(load, vehicle, driver);
    score *= distanceScore;

    // Driver performance factor
    const performanceScore = await this.calculateDriverPerformanceScore(driver.id);
    score *= performanceScore;

    // Vehicle suitability factor
    const suitabilityScore = this.calculateVehicleSuitabilityScore(load, vehicle);
    score *= suitabilityScore;

    // HOS compliance factor
    const hosScore = await this.calculateHOSComplianceScore(driver.id);
    score *= hosScore;

    // Equipment match factor
    const equipmentScore = this.calculateEquipmentScore(load, vehicle);
    score *= equipmentScore;

    return Math.round(score);
  }

  /**
   * Calculate distance-based score
   */
  private async calculateDistanceScore(load: any, vehicle: any, driver: any): Promise<number> {
    // Get pickup location
    const pickupStop = load.load_stops?.find(stop => stop.type === 'pickup');
    if (!pickupStop) return 0.5;

    // Get driver's current location (simplified - would use real telematics data)
    const driverLocation = await this.getDriverCurrentLocation(driver.id);
    
    if (!driverLocation) return 0.7; // Default if location unknown

    // Calculate distance to pickup
    const distance = this.calculateDistance(
      driverLocation.lat, driverLocation.lng,
      pickupStop.latitude, pickupStop.longitude
    );

    // Score based on distance (closer = higher score)
    if (distance <= 50) return 1.0;
    if (distance <= 100) return 0.9;
    if (distance <= 200) return 0.8;
    if (distance <= 300) return 0.7;
    return 0.5;
  }

  /**
   * Calculate driver performance score
   */
  private async calculateDriverPerformanceScore(driverId: number): Promise<number> {
    const performance = await prisma.driver_performance_metrics.findFirst({
      where: {
        driver_id: driverId,
        metric_period_start: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: { calculated_at: 'desc' }
    });

    if (!performance) return 0.8; // Default score for new drivers

    let score = 0.8; // Base score

    // On-time delivery factor
    if (performance.on_time_deliveries && performance.total_deliveries) {
      const onTimeRate = performance.on_time_deliveries / performance.total_deliveries;
      score += (onTimeRate - 0.8) * 0.5; // Bonus for >80% on-time
    }

    // Safety score factor
    if (performance.safety_score) {
      score += (performance.safety_score / 100 - 0.8) * 0.3;
    }

    // HOS violations penalty
    if (performance.hos_violations > 0) {
      score -= performance.hos_violations * 0.1;
    }

    return Math.max(0.3, Math.min(1.0, score));
  }

  /**
   * Calculate vehicle suitability score
   */
  private calculateVehicleSuitabilityScore(load: any, vehicle: any): number {
    let score = 1.0;

    // Weight capacity check
    if (load.weight && vehicle.max_gross_weight) {
      const weightRatio = load.weight / vehicle.max_gross_weight;
      if (weightRatio > 1.0) return 0; // Cannot handle the load
      if (weightRatio > 0.9) score *= 0.8; // Close to capacity
    }

    // Equipment requirements
    if (load.hazmat_class && !vehicle.hazmat_certified) return 0;
    if (load.temperature_min && !vehicle.reefer_equipped) return 0;

    return score;
  }

  /**
   * Calculate HOS compliance score
   */
  private async calculateHOSComplianceScore(driverId: number): Promise<number> {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentLogs = await prisma.hos_logs.findMany({
      where: {
        driver_id: driverId,
        log_date: {
          gte: sevenDaysAgo
        }
      }
    });

    // Check for recent violations
    const violations = recentLogs.filter(log => 
      log.violation_indicators && 
      Array.isArray(log.violation_indicators) && 
      log.violation_indicators.length > 0
    );

    if (violations.length > 0) return 0.5; // Penalty for recent violations

    // Check available driving time
    const todayLogs = recentLogs.filter(log => 
      log.log_date.toDateString() === today.toDateString()
    );

    const drivingTime = todayLogs
      .filter(log => log.duty_status === 'driving')
      .reduce((total, log) => total + (log.duration_minutes || 0), 0);

    // 11-hour driving limit
    const remainingDrivingTime = (11 * 60) - drivingTime;
    
    if (remainingDrivingTime < 60) return 0.3; // Less than 1 hour left
    if (remainingDrivingTime < 180) return 0.7; // Less than 3 hours left
    
    return 1.0;
  }

  /**
   * Calculate equipment matching score
   */
  private calculateEquipmentScore(load: any, vehicle: any): number {
    // This would check for specific equipment requirements
    // For now, return 1.0 (perfect match)
    return 1.0;
  }

  /**
   * Find the best available trailer for the load
   */
  private async findBestTrailer(load: any, companyId: number): Promise<number | null> {
    const trailers = await prisma.trailers.findMany({
      where: {
        company_id: companyId,
        status: 'available'
      }
    });

    // Simple selection - would be more sophisticated in practice
    return trailers.length > 0 ? trailers[0].id : null;
  }

  /**
   * Assign the load to the selected vehicle/driver/trailer
   */
  private async assignLoad(loadId: number, option: any, routeId?: number) {
    await prisma.loads.update({
      where: { id: loadId },
      data: {
        vehicle_id: option.vehicleId,
        driver_id: option.driverId,
        trailer_id: option.trailerId,
        status: 'assigned',
        assigned_at: new Date()
      }
    });

    // Update driver status
    await prisma.drivers.update({
      where: { id: option.driverId },
      data: {
        current_load_id: loadId,
        status: 'On Load'
      }
    });

    // Update vehicle status
    await prisma.vehicles.update({
      where: { id: option.vehicleId },
      data: {
        status: 'In Use'
      }
    });

    // Update trailer status if assigned
    if (option.trailerId) {
      await prisma.trailers.update({
        where: { id: option.trailerId },
        data: {
          status: 'in_use'
        }
      });
    }
  }

  /**
   * Get driver's current location
   */
  private async getDriverCurrentLocation(driverId: number) {
    // This would integrate with telematics data
    // For now, return null
    return null;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
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
}
