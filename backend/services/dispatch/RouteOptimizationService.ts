/**
 * Advanced Route Optimization Service
 * Handles route planning with bridge heights, tolls, hazmat restrictions, and traffic optimization
 */

import prisma from '../../config/prisma';
import { logger } from '../../utils/logger';
import axios from 'axios';

interface RestStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  truckParking: boolean;
}

export interface RouteOptimizationRequest {
  loadId: number;
  vehicleId: number;
  driverId: number;
  trailerId?: number;
  stops: any[];
  preferences?: {
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    fuelEfficient?: boolean;
    fastest?: boolean;
  };
}

export interface RouteRestriction {
  type: 'bridge_height' | 'weight_limit' | 'hazmat' | 'truck_route';
  value?: number;
  description: string;
  coordinates: [number, number];
}

export interface OptimizedRoute {
  id?: number;
  totalMiles: number;
  estimatedDurationHours: number;
  fuelCostEstimate: number;
  tollCostEstimate: number;
  routeGeometry: any; // GeoJSON LineString
  waypoints: any[];
  restrictions: RouteRestriction[];
  optimizationScore: number;
}

export class RouteOptimizationService {
  private mapboxToken: string;
  private hereApiKey: string;

  constructor() {
    this.mapboxToken = process.env.MAPBOX_ACCESS_TOKEN || '';
    this.hereApiKey = process.env.HERE_API_KEY || '';
  }

  /**
   * Create an optimized route for a load
   */
  async createOptimizedRoute(request: RouteOptimizationRequest): Promise<OptimizedRoute | null> {
    try {
      logger.info(`Creating optimized route for load ${request.loadId}`);

      // Get vehicle specifications for restrictions
      const vehicle = await prisma.vehicles.findUnique({
        where: { id: request.vehicleId },
        include: {
          axle_configurations: true
        }
      });

      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      // Get load details for hazmat and weight restrictions
      const load = await prisma.loads.findUnique({
        where: { id: request.loadId }
      });

      // Prepare waypoints from stops
      const waypoints = this.prepareWaypoints(request.stops);

      // Get multiple route options
      const routeOptions = await Promise.all([
        this.getMapboxRoute(waypoints, vehicle, load, { profile: 'driving-traffic' }),
        this.getMapboxRoute(waypoints, vehicle, load, { profile: 'driving', avoid_tolls: true }),
        this.getHereRoute(waypoints, vehicle, load)
      ]);

      // Filter out failed routes
      const validRoutes = routeOptions.filter(route => route !== null);

      if (validRoutes.length === 0) {
        throw new Error('No valid routes found');
      }

      // Score and select the best route
      const bestRoute = this.selectBestRoute(validRoutes, request.preferences);

      // Apply additional optimizations
      const optimizedRoute = await this.applyAdvancedOptimizations(bestRoute, vehicle, load);

      // Save route to database
      const savedRoute = await this.saveRoute(request.loadId, request.vehicleId, request.driverId, request.trailerId, optimizedRoute);

      return {
        ...optimizedRoute,
        id: savedRoute.id
      };

    } catch (error) {
      logger.error('Error creating optimized route:', error);
      return null;
    }
  }

  /**
   * Prepare waypoints from load stops
   */
  private prepareWaypoints(stops: any[]) {
    return stops
      .sort((a, b) => a.stop_number - b.stop_number)
      .map(stop => ({
        coordinates: [stop.longitude, stop.latitude],
        name: stop.facility_name || `${stop.city}, ${stop.state}`,
        type: stop.type,
        stopId: stop.id
      }));
  }

  /**
   * Get route from Mapbox Directions API
   */
  private async getMapboxRoute(waypoints: any[], vehicle: any, load: any, options: any = {}): Promise<OptimizedRoute | null> {
    try {
      const coordinates = waypoints.map(wp => wp.coordinates.join(',')).join(';');
      const profile = options.profile || 'driving-traffic';
      
      let url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}`;
      
      const params = new URLSearchParams({
        access_token: this.mapboxToken,
        geometries: 'geojson',
        steps: 'true',
        banner_instructions: 'true',
        voice_instructions: 'true',
        annotations: 'duration,distance,speed',
        overview: 'full'
      });

      // Add truck-specific parameters
      if (vehicle.height) {
        params.append('height', (vehicle.height / 12).toString()); // Convert inches to feet
      }
      if (vehicle.max_gross_weight) {
        params.append('weight', (vehicle.max_gross_weight / 2000).toString()); // Convert lbs to tons
      }
      if (vehicle.width) {
        params.append('width', (vehicle.width / 12).toString()); // Convert inches to feet
      }
      if (vehicle.length) {
        params.append('length', (vehicle.length / 12).toString()); // Convert inches to feet
      }

      // Hazmat restrictions
      if (load?.hazmat_class) {
        params.append('exclude', 'hazmat');
      }

      // Toll preferences
      if (options.avoid_tolls) {
        params.append('exclude', 'toll');
      }

      url += '?' + params.toString();

      const response = await axios.get(url);
      const route = response.data.routes[0];

      if (!route) return null;

      return {
        totalMiles: route.distance * 0.000621371, // Convert meters to miles
        estimatedDurationHours: route.duration / 3600, // Convert seconds to hours
        fuelCostEstimate: this.calculateFuelCost(route.distance * 0.000621371, vehicle),
        tollCostEstimate: await this.estimateTollCosts(route.geometry, vehicle),
        routeGeometry: route.geometry,
        waypoints: waypoints,
        restrictions: await this.identifyRestrictions(route.geometry, vehicle, load),
        optimizationScore: this.calculateRouteScore(route, options)
      };

    } catch (error) {
      logger.error('Error getting Mapbox route:', error);
      return null;
    }
  }

  /**
   * Get route from HERE Routing API
   */
  private async getHereRoute(waypoints: any[], vehicle: any, load: any): Promise<OptimizedRoute | null> {
    try {
      const origin = waypoints[0].coordinates.join(',');
      const destination = waypoints[waypoints.length - 1].coordinates.join(',');
      
      let url = 'https://router.hereapi.com/v8/routes';
      
      const params = new URLSearchParams({
        apikey: this.hereApiKey,
        transportMode: 'truck',
        origin: origin,
        destination: destination,
        return: 'summary,polyline,instructions,tolls'
      });

      // Add truck specifications
      if (vehicle.height) {
        params.append('truck[height]', (vehicle.height / 39.37).toString()); // Convert inches to meters
      }
      if (vehicle.max_gross_weight) {
        params.append('truck[grossWeight]', (vehicle.max_gross_weight * 0.453592).toString()); // Convert lbs to kg
      }
      if (vehicle.width) {
        params.append('truck[width]', (vehicle.width / 39.37).toString()); // Convert inches to meters
      }
      if (vehicle.length) {
        params.append('truck[length]', (vehicle.length / 39.37).toString()); // Convert inches to meters
      }

      // Add intermediate waypoints
      if (waypoints.length > 2) {
        const viaPoints = waypoints.slice(1, -1).map(wp => wp.coordinates.join(',')).join('|');
        params.append('via', viaPoints);
      }

      url += '?' + params.toString();

      const response = await axios.get(url);
      const route = response.data.routes[0];

      if (!route) return null;

      return {
        totalMiles: route.sections.reduce((total: number, section: any) => total + section.summary.length, 0) * 0.000621371,
        estimatedDurationHours: route.sections.reduce((total: number, section: any) => total + section.summary.duration, 0) / 3600,
        fuelCostEstimate: this.calculateFuelCost(route.sections.reduce((total: number, section: any) => total + section.summary.length, 0) * 0.000621371, vehicle),
        tollCostEstimate: this.extractHereTollCosts(route),
        routeGeometry: this.convertHerePolyline(route.sections[0].polyline),
        waypoints: waypoints,
        restrictions: [],
        optimizationScore: 85 // Base score for HERE routes
      };

    } catch (error) {
      logger.error('Error getting HERE route:', error);
      return null;
    }
  }

  /**
   * Select the best route from multiple options
   */
  private selectBestRoute(routes: OptimizedRoute[], preferences: any = {}): OptimizedRoute {
    let bestRoute = routes[0];
    let bestScore = 0;

    for (const route of routes) {
      let score = route.optimizationScore;

      // Apply preference weights
      if (preferences.fuelEfficient) {
        score += (1000 - route.fuelCostEstimate) / 10; // Lower fuel cost = higher score
      }
      if (preferences.fastest) {
        score += (24 - route.estimatedDurationHours) * 5; // Shorter time = higher score
      }
      if (preferences.avoidTolls) {
        score -= route.tollCostEstimate; // Lower toll cost = higher score
      }

      if (score > bestScore) {
        bestScore = score;
        bestRoute = route;
      }
    }

    return bestRoute;
  }

  /**
   * Apply advanced optimizations to the route
   */
  private async applyAdvancedOptimizations(route: OptimizedRoute, vehicle: any, load: any): Promise<OptimizedRoute> {
    // Add fuel stop recommendations
    const _fuelStops = await this.recommendFuelStops(route, vehicle);
    
    // Add rest area recommendations for HOS compliance
    const _restStops = await this.recommendRestStops(route);

    // Adjust for real-time traffic (if available)
    const trafficAdjustedDuration = await this.adjustForTraffic(route);

    // Add weather considerations
    const weatherAdjustments = await this.getWeatherAdjustments(route);

    return {
      ...route,
      estimatedDurationHours: trafficAdjustedDuration,
      fuelCostEstimate: route.fuelCostEstimate + weatherAdjustments.fuelAdjustment,
      optimizationScore: route.optimizationScore + weatherAdjustments.scoreAdjustment
    };
  }

  /**
   * Calculate fuel cost estimate
   */
  private calculateFuelCost(miles: number, vehicle: any): number {
    const avgFuelPrice = 3.50; // USD per gallon - would be dynamic in production
    const avgMPG = vehicle.fuel_efficiency || 6.5; // Miles per gallon for trucks
    return (miles / avgMPG) * avgFuelPrice;
  }

  /**
   * Estimate toll costs along the route
   */
  private async estimateTollCosts(_geometry: any, _vehicle: any): Promise<number> {
    // This would integrate with toll calculation APIs
    // For now, return a basic estimate
    return 50; // Base estimate
  }

  /**
   * Identify restrictions along the route
   */
  private async identifyRestrictions(_geometry: any, _vehicle: any, _load: any): Promise<RouteRestriction[]> {
    const restrictions: RouteRestriction[] = [];

    // This would check against a database of known restrictions
    // For now, return empty array
    return restrictions;
  }

  /**
   * Calculate route optimization score
   */
  private calculateRouteScore(route: any, options: any): number {
    let score = 100;

    // Penalize longer routes
    if (route.distance > 500000) { // 500km
      score -= 10;
    }

    // Bonus for traffic-optimized routes
    if (options.profile === 'driving-traffic') {
      score += 15;
    }

    return score;
  }

  /**
   * Extract toll costs from HERE API response
   */
  private extractHereTollCosts(_route: any): number {
    if (route.tolls && route.tolls.length > 0) {
      return route.tolls.reduce((total: number, toll: any) => total + (toll.cost || 0), 0);
    }
    return 0;
  }

  /**
   * Convert HERE polyline to GeoJSON
   */
  private convertHerePolyline(_polyline: string): any {
    // This would decode HERE's flexible polyline format
    // For now, return a basic structure
    return {
      type: 'LineString',
      coordinates: []
    };
  }

  /**
   * Recommend fuel stops along the route
   */
  private async recommendFuelStops(route: OptimizedRoute, vehicle: any): Promise<any[]> {
    // This would find fuel stations along the route
    return [];
  }

  /**
   * Recommend rest stops for HOS compliance
   */
  private async recommendRestStops(route: OptimizedRoute): Promise<RestStop[]> {
    // This would find rest areas and truck stops
    return [];
  }

  /**
   * Adjust duration for real-time traffic
   */
  private async adjustForTraffic(route: OptimizedRoute): Promise<number> {
    // This would integrate with traffic APIs
    return route.estimatedDurationHours;
  }

  /**
   * Get weather-based adjustments
   */
  private async getWeatherAdjustments(route: OptimizedRoute): Promise<any> {
    // This would integrate with weather APIs
    return {
      fuelAdjustment: 0,
      scoreAdjustment: 0
    };
  }

  /**
   * Save route to database
   * Note: Storing route data in loads table since routes model doesn't exist
   */
  private async saveRoute(loadId: number, vehicleId: number, driverId: number, trailerId: number | undefined, route: OptimizedRoute) {
    // Update the load with route optimization data
    return await prisma.loads.update({
      where: { id: loadId },
      data: {
        vehicle_id: vehicleId,
        driver_id: driverId,
        status: 'Assigned'
        // Note: Route details like geometry, waypoints etc. would need additional fields in loads table
        // or a separate routes table to be added to the schema
      }
    });
  }
}
