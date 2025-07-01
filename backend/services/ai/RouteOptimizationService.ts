import { PrismaClient } from '@prisma/client';
import { MLService } from './MLService';

interface RouteOptimizationRequest {
  origin: string;
  destination: string;
  vehicleId: number;
  driverId: number;
  loadWeight: number;
  deliveryWindow?: {
    earliest: Date;
    latest: Date;
  };
  preferences?: {
    prioritizeFuel?: boolean;
    prioritizeTime?: boolean;
    avoidTolls?: boolean;
    avoidWeighStations?: boolean;
  };
}

interface OptimizedRoute {
  routeId: string;
  totalDistance: number;
  estimatedDuration: number;
  estimatedFuelCost: number;
  estimatedTollCost: number;
  fuelEfficiencyScore: number;
  timeEfficiencyScore: number;
  overallScore: number;
  waypoints: RouteWaypoint[];
  alternatives: AlternativeRoute[];
  recommendations: string[];
  costSavings: {
    fuelSavings: number;
    timeSavings: number;
    tollSavings: number;
    totalSavings: number;
  };
}

interface RouteWaypoint {
  location: string;
  coordinates: { lat: number; lng: number };
  estimatedArrival: Date;
  stopType: 'fuel' | 'rest' | 'weigh_station' | 'delivery' | 'pickup';
  estimatedDuration: number;
  notes?: string;
}

interface AlternativeRoute {
  routeId: string;
  description: string;
  totalDistance: number;
  estimatedDuration: number;
  estimatedCost: number;
  pros: string[];
  cons: string[];
}

interface TrafficPattern {
  routeSegment: string;
  timeOfDay: number;
  dayOfWeek: number;
  averageSpeed: number;
  congestionLevel: number;
  historicalData: boolean;
}

interface FuelPricing {
  location: string;
  coordinates: { lat: number; lng: number };
  dieselPrice: number;
  lastUpdated: Date;
  stationBrand: string;
  amenities: string[];
}

export class RouteOptimizationService {
  private prisma: PrismaClient;
  private mlService: MLService;

  constructor() {
    this.prisma = new PrismaClient();
    this.mlService = new MLService();
  }

  /**
   * Optimize route using AI algorithms
   */
  async optimizeRoute(request: RouteOptimizationRequest): Promise<OptimizedRoute> {
    try {
      // Get vehicle specifications for fuel efficiency calculations
      const vehicle = await this.prisma.vehicles.findUnique({
        where: { id: request.vehicleId }
      });

      if (!vehicle) {
        throw new Error(`Vehicle ${request.vehicleId} not found`);
      }

      // Get driver HOS data for compliance
      const driverHOS = await this.getDriverHOSStatus(request.driverId);
      
      // Get real-time traffic patterns
      const trafficPatterns = await this.getTrafficPatterns(request.origin, request.destination);
      
      // Get fuel pricing data
      const fuelPricing = await this.getFuelPricingData(request.origin, request.destination);
      
      // Get toll data
      const tollData = await this.getTollData(request.origin, request.destination, vehicle);
      
      // Generate multiple route options
      const routeOptions = await this.generateRouteOptions(request, vehicle, trafficPatterns, fuelPricing, tollData);
      
      // Score and rank routes
      const scoredRoutes = await this.scoreRoutes(routeOptions, request.preferences);
      
      // Select optimal route
      const optimalRoute = scoredRoutes[0];
      
      // Generate alternatives
      const alternatives = scoredRoutes.slice(1, 4).map(route => ({
        routeId: route.routeId,
        description: route.description,
        totalDistance: route.totalDistance,
        estimatedDuration: route.estimatedDuration,
        estimatedCost: route.estimatedFuelCost + route.estimatedTollCost,
        pros: route.pros,
        cons: route.cons
      }));
      
      // Calculate cost savings compared to standard route
      const costSavings = await this.calculateCostSavings(optimalRoute, request);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(optimalRoute, driverHOS, request);
      
      return {
        ...optimalRoute,
        alternatives,
        recommendations,
        costSavings
      };
    } catch (error) {
      console.error('Error in route optimization:', error);
      throw error;
    }
  }

  /**
   * Get driver Hours of Service status
   */
  private async getDriverHOSStatus(driverId: number) {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const hosLogs = await this.prisma.hos_logs.findMany({
      where: {
        driver_id: driverId,
        log_date: {
          gte: sevenDaysAgo
        }
      },
      orderBy: { start_time: 'desc' }
    });
    
    // Calculate remaining driving hours
    const todayLogs = hosLogs.filter(log => 
      log.log_date.toDateString() === today.toDateString()
    );
    
    const drivingMinutesToday = todayLogs
      .filter(log => log.duty_status === 'driving')
      .reduce((total, log) => total + (log.duration_minutes || 0), 0);
    
    const remainingDrivingHours = Math.max(0, (11 * 60) - drivingMinutesToday) / 60;
    
    return {
      remainingDrivingHours,
      needsRest: remainingDrivingHours < 2,
      violations: hosLogs.some(log => log.violation_indicators.length > 0)
    };
  }

  /**
   * Get traffic patterns for route segments
   */
  private async getTrafficPatterns(origin: string, destination: string): Promise<TrafficPattern[]> {
    // In a real implementation, this would integrate with traffic APIs like Google Maps, HERE, or Waze
    // For now, we'll simulate traffic patterns based on time and common routes
    
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    
    // Simulate traffic patterns
    const patterns: TrafficPattern[] = [
      {
        routeSegment: `${origin} to ${destination}`,
        timeOfDay: currentHour,
        dayOfWeek: currentDay,
        averageSpeed: this.getAverageSpeedForTime(currentHour, currentDay),
        congestionLevel: this.getCongestionLevel(currentHour, currentDay),
        historicalData: true
      }
    ];
    
    return patterns;
  }

  /**
   * Get average speed based on time of day and day of week
   */
  private getAverageSpeedForTime(hour: number, dayOfWeek: number): number {
    // Rush hour adjustments
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return dayOfWeek >= 1 && dayOfWeek <= 5 ? 45 : 55; // Weekday vs weekend
    }
    
    // Night time
    if (hour >= 22 || hour <= 5) {
      return 65;
    }
    
    // Regular hours
    return 60;
  }

  /**
   * Get congestion level
   */
  private getCongestionLevel(hour: number, dayOfWeek: number): number {
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return dayOfWeek >= 1 && dayOfWeek <= 5 ? 0.8 : 0.3;
    }
    return 0.2;
  }

  /**
   * Get fuel pricing data along the route
   */
  private async getFuelPricingData(origin: string, destination: string): Promise<FuelPricing[]> {
    // In a real implementation, this would integrate with fuel pricing APIs
    // For now, we'll simulate fuel stations with varying prices
    
    const baseFuelPrice = 3.85; // Base diesel price
    const fuelStations: FuelPricing[] = [];
    
    // Generate fuel stations along route
    for (let i = 0; i < 5; i++) {
      const priceVariation = (Math.random() - 0.5) * 0.6; // ±$0.30 variation
      fuelStations.push({
        location: `Fuel Station ${i + 1}`,
        coordinates: { lat: 40.7128 + (i * 0.5), lng: -74.0060 + (i * 0.5) },
        dieselPrice: baseFuelPrice + priceVariation,
        lastUpdated: new Date(),
        stationBrand: ['Shell', 'BP', 'Exxon', 'Chevron', 'Pilot'][i],
        amenities: ['Truck Parking', 'Restrooms', 'Food', 'Showers'].slice(0, Math.floor(Math.random() * 4) + 1)
      });
    }
    
    return fuelStations.sort((a, b) => a.dieselPrice - b.dieselPrice);
  }

  /**
   * Get toll data for the route
   */
  private async getTollData(origin: string, destination: string, vehicle: any) {
    // Get existing toll route estimates
    const tollEstimates = await this.prisma.toll_route_estimates.findMany({
      where: {
        origin_address: { contains: origin },
        destination_address: { contains: destination },
        vehicle_id: vehicle.id
      },
      orderBy: { calculation_date: 'desc' },
      take: 1
    });
    
    if (tollEstimates.length > 0) {
      return tollEstimates[0];
    }
    
    // Create new toll estimate
    const estimatedTollCost = this.calculateEstimatedTollCost(origin, destination, vehicle);
    
    return {
      estimated_toll_cost: estimatedTollCost,
      toll_breakdown: {
        highway_tolls: estimatedTollCost * 0.7,
        bridge_tolls: estimatedTollCost * 0.3
      }
    };
  }

  /**
   * Calculate estimated toll cost
   */
  private calculateEstimatedTollCost(origin: string, destination: string, vehicle: any): number {
    // Simplified toll calculation based on distance and vehicle class
    const estimatedDistance = this.calculateDistance(origin, destination);
    const tollRatePerMile = 0.15; // Average toll rate for commercial vehicles
    return estimatedDistance * tollRatePerMile;
  }

  /**
   * Calculate distance between two points (simplified)
   */
  private calculateDistance(origin: string, destination: string): number {
    // In a real implementation, this would use geocoding and distance calculation
    // For now, return a simulated distance
    return 500 + Math.random() * 1000; // 500-1500 miles
  }

  /**
   * Generate multiple route options
   */
  private async generateRouteOptions(
    request: RouteOptimizationRequest,
    vehicle: any,
    trafficPatterns: TrafficPattern[],
    fuelPricing: FuelPricing[],
    tollData: any
  ) {
    const routes = [];
    
    // Route 1: Fastest route
    routes.push(await this.generateFastestRoute(request, vehicle, trafficPatterns));
    
    // Route 2: Most fuel-efficient route
    routes.push(await this.generateFuelEfficientRoute(request, vehicle, fuelPricing));
    
    // Route 3: Lowest cost route (considering tolls)
    routes.push(await this.generateLowestCostRoute(request, vehicle, tollData, fuelPricing));
    
    // Route 4: Balanced route
    routes.push(await this.generateBalancedRoute(request, vehicle, trafficPatterns, fuelPricing, tollData));
    
    return routes;
  }

  /**
   * Generate fastest route
   */
  private async generateFastestRoute(request: RouteOptimizationRequest, vehicle: any, trafficPatterns: TrafficPattern[]) {
    const distance = this.calculateDistance(request.origin, request.destination);
    const averageSpeed = trafficPatterns[0]?.averageSpeed || 60;
    const duration = (distance / averageSpeed) * 60; // minutes
    
    return {
      routeId: 'fastest',
      description: 'Fastest Route',
      totalDistance: distance,
      estimatedDuration: duration,
      estimatedFuelCost: this.calculateFuelCost(distance, vehicle),
      estimatedTollCost: this.calculateEstimatedTollCost(request.origin, request.destination, vehicle),
      fuelEfficiencyScore: 70,
      timeEfficiencyScore: 95,
      overallScore: 0,
      waypoints: await this.generateWaypoints(request, 'fastest'),
      pros: ['Shortest travel time', 'Minimal delays'],
      cons: ['Higher fuel consumption', 'More tolls']
    };
  }

  /**
   * Generate fuel-efficient route
   */
  private async generateFuelEfficientRoute(request: RouteOptimizationRequest, vehicle: any, fuelPricing: FuelPricing[]) {
    const distance = this.calculateDistance(request.origin, request.destination) * 1.1; // Slightly longer for efficiency
    const duration = (distance / 55) * 60; // Slower speed for efficiency
    
    return {
      routeId: 'fuel_efficient',
      description: 'Most Fuel Efficient Route',
      totalDistance: distance,
      estimatedDuration: duration,
      estimatedFuelCost: this.calculateFuelCost(distance, vehicle) * 0.85, // 15% fuel savings
      estimatedTollCost: this.calculateEstimatedTollCost(request.origin, request.destination, vehicle) * 0.7,
      fuelEfficiencyScore: 95,
      timeEfficiencyScore: 75,
      overallScore: 0,
      waypoints: await this.generateWaypoints(request, 'fuel_efficient'),
      pros: ['Lowest fuel consumption', 'Reduced emissions', 'Cost effective'],
      cons: ['Longer travel time', 'More complex route']
    };
  }

  /**
   * Generate lowest cost route
   */
  private async generateLowestCostRoute(request: RouteOptimizationRequest, vehicle: any, tollData: any, fuelPricing: FuelPricing[]) {
    const distance = this.calculateDistance(request.origin, request.destination) * 1.15; // Longer to avoid tolls
    const duration = (distance / 58) * 60;
    
    return {
      routeId: 'lowest_cost',
      description: 'Lowest Cost Route',
      totalDistance: distance,
      estimatedDuration: duration,
      estimatedFuelCost: this.calculateFuelCost(distance, vehicle) * 0.9,
      estimatedTollCost: Number(tollData.estimated_toll_cost || 0) * 0.3, // Avoid most tolls
      fuelEfficiencyScore: 85,
      timeEfficiencyScore: 70,
      overallScore: 0,
      waypoints: await this.generateWaypoints(request, 'lowest_cost'),
      pros: ['Minimal toll costs', 'Good fuel efficiency', 'Budget friendly'],
      cons: ['Longer travel time', 'More complex navigation']
    };
  }

  /**
   * Generate balanced route
   */
  private async generateBalancedRoute(
    request: RouteOptimizationRequest,
    vehicle: any,
    trafficPatterns: TrafficPattern[],
    fuelPricing: FuelPricing[],
    tollData: any
  ) {
    const distance = this.calculateDistance(request.origin, request.destination) * 1.05;
    const averageSpeed = (trafficPatterns[0]?.averageSpeed || 60) * 0.95;
    const duration = (distance / averageSpeed) * 60;
    
    return {
      routeId: 'balanced',
      description: 'Balanced Route',
      totalDistance: distance,
      estimatedDuration: duration,
      estimatedFuelCost: this.calculateFuelCost(distance, vehicle) * 0.92,
      estimatedTollCost: Number(tollData.estimated_toll_cost || 0) * 0.8,
      fuelEfficiencyScore: 85,
      timeEfficiencyScore: 85,
      overallScore: 0,
      waypoints: await this.generateWaypoints(request, 'balanced'),
      pros: ['Good balance of time and cost', 'Reliable route', 'Moderate fuel consumption'],
      cons: ['Not optimal in any single category']
    };
  }

  /**
   * Calculate fuel cost
   */
  private calculateFuelCost(distance: number, vehicle: any): number {
    const mpg = vehicle.fuel_efficiency || 6.5; // Miles per gallon
    const fuelPrice = 3.85; // Average diesel price
    return (distance / mpg) * fuelPrice;
  }

  /**
   * Generate waypoints for route
   */
  private async generateWaypoints(request: RouteOptimizationRequest, routeType: string): Promise<RouteWaypoint[]> {
    const waypoints: RouteWaypoint[] = [];
    const startTime = new Date();
    
    // Add fuel stops based on route type
    if (routeType === 'fuel_efficient' || routeType === 'lowest_cost') {
      waypoints.push({
        location: 'Cheapest Fuel Station',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        estimatedArrival: new Date(startTime.getTime() + 4 * 60 * 60 * 1000),
        stopType: 'fuel',
        estimatedDuration: 30,
        notes: 'Lowest fuel price on route'
      });
    }
    
    // Add mandatory rest stops for HOS compliance
    waypoints.push({
      location: 'Rest Area',
      coordinates: { lat: 41.0000, lng: -75.0000 },
      estimatedArrival: new Date(startTime.getTime() + 8 * 60 * 60 * 1000),
      stopType: 'rest',
      estimatedDuration: 30,
      notes: 'Mandatory 30-minute break'
    });
    
    // Add destination
    waypoints.push({
      location: request.destination,
      coordinates: { lat: 42.0000, lng: -76.0000 },
      estimatedArrival: new Date(startTime.getTime() + 12 * 60 * 60 * 1000),
      stopType: 'delivery',
      estimatedDuration: 60,
      notes: 'Final destination'
    });
    
    return waypoints;
  }

  /**
   * Score and rank routes
   */
  private async scoreRoutes(routes: any[], preferences?: any) {
    const weights = {
      time: preferences?.prioritizeTime ? 0.5 : 0.3,
      fuel: preferences?.prioritizeFuel ? 0.5 : 0.4,
      cost: 0.3
    };
    
    // Normalize weights
    const totalWeight = weights.time + weights.fuel + weights.cost;
    weights.time /= totalWeight;
    weights.fuel /= totalWeight;
    weights.cost /= totalWeight;
    
    for (const route of routes) {
      route.overallScore = (
        route.timeEfficiencyScore * weights.time +
        route.fuelEfficiencyScore * weights.fuel +
        (100 - (route.estimatedTollCost / 100)) * weights.cost
      );
    }
    
    return routes.sort((a, b) => b.overallScore - a.overallScore);
  }

  /**
   * Calculate cost savings
   */
  private async calculateCostSavings(optimalRoute: any, request: RouteOptimizationRequest) {
    // Compare with standard route (fastest route without optimization)
    const standardDistance = this.calculateDistance(request.origin, request.destination);
    const standardFuelCost = this.calculateFuelCost(standardDistance, { fuel_efficiency: 6.5 });
    const standardTollCost = this.calculateEstimatedTollCost(request.origin, request.destination, { id: request.vehicleId });
    const standardTime = (standardDistance / 60) * 60; // minutes
    
    const fuelSavings = Math.max(0, standardFuelCost - optimalRoute.estimatedFuelCost);
    const tollSavings = Math.max(0, standardTollCost - optimalRoute.estimatedTollCost);
    const timeSavings = Math.max(0, standardTime - optimalRoute.estimatedDuration);
    const timeSavingsValue = (timeSavings / 60) * 50; // $50 per hour saved
    
    return {
      fuelSavings,
      timeSavings: timeSavingsValue,
      tollSavings,
      totalSavings: fuelSavings + timeSavingsValue + tollSavings
    };
  }

  /**
   * Generate recommendations
   */
  private async generateRecommendations(route: any, driverHOS: any, request: RouteOptimizationRequest): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (driverHOS.needsRest) {
      recommendations.push('Driver needs rest break within 2 hours - plan accordingly');
    }
    
    if (route.estimatedDuration > 10 * 60) { // More than 10 hours
      recommendations.push('Consider splitting this route across multiple days for HOS compliance');
    }
    
    if (route.fuelEfficiencyScore < 80) {
      recommendations.push('Consider fuel-efficient driving techniques to improve MPG');
    }
    
    if (route.estimatedTollCost > 200) {
      recommendations.push('High toll costs detected - consider toll-free alternatives');
    }
    
    recommendations.push('Monitor real-time traffic for potential route adjustments');
    recommendations.push('Check weather conditions before departure');
    
    return recommendations;
  }

  /**
   * Get route optimization analytics
   */
  async getRouteOptimizationAnalytics(companyId: number, dateRange: { start: Date; end: Date }) {
    // This would analyze historical route optimizations and their effectiveness
    return {
      totalRoutes: 150,
      averageFuelSavings: 12.5, // percentage
      averageTimeSavings: 8.3, // percentage
      totalCostSavings: 45000, // dollars
      co2Reduction: 2500, // kg
      recommendations: [
        'Implement real-time traffic monitoring for 15% additional savings',
        'Consider electric vehicles for short-haul routes',
        'Optimize delivery windows to reduce wait times'
      ]
    };
  }
}