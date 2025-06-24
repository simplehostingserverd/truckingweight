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
 * Mapbox Service
 *
 * This service provides integration with the Mapbox API for route planning,
 * geocoding, and other location-based services.
 */

// Mapbox API endpoints
const MAPBOX_BASE_URL = 'https://api.mapbox.com';
const DIRECTIONS_API = `${MAPBOX_BASE_URL}/directions/v5/mapbox`;
const GEOCODING_API = `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places`;

// Mapbox routing profiles
export enum MapboxProfile {
  DRIVING = "DRIVING",
  DRIVING_TRAFFIC = "DRIVING_TRAFFIC",
  WALKING = "WALKING",
  CYCLING = "CYCLING",
  TRUCKING = "TRUCKING",
  // Use driving-traffic for trucking as it's the most appropriate = "// Use driving-traffic for trucking as it's the most appropriate"
}

// Waypoint interface
export interface Waypoint {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  isStopover?: boolean;
}

// Route interface
export interface Route {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: string; // encoded polyline
  legs: RouteLeg[];
  weight: number;
  weight_name: string;
}

// Route leg interface
export interface RouteLeg {
  distance: number;
  duration: number;
  steps: RouteStep[];
  summary: string;
}

// Route step interface
export interface RouteStep {
  distance: number;
  duration: number;
  geometry: string;
  name: string;
  mode: string;
  maneuver: {
    location: [number, number];
    instruction: string;
    type: string;
    modifier?: string;
  };
}

// Route options interface
export interface RouteOptions {
  alternatives?: boolean;
  steps?: boolean;
  geometries?: 'geojson' | 'polyline';
  overview?: 'full' | 'simplified' | 'false';
  annotations?: ('duration' | 'distance' | 'speed' | 'congestion')[];
}

/**
 * Get Mapbox access token from environment variables
 */
const getMapboxToken = async (): Promise<string> => {
  // Get from environment variable
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token) {
    throw new Error(
      'Mapbox access token not found. Please set NEXT_PUBLIC_MAPBOX_TOKEN environment variable.'
    );
  }

  return token;
};

/**
 * Get directions between waypoints
 * @param waypoints Array of waypoints
 * @param profile Routing profile
 * @param options Route options
 * @returns Route information
 */
export const getDirections = async (
  waypoints: Waypoint[],
  profile: MapboxProfile = MapboxProfile.TRUCKING,
  options: RouteOptions = { steps: true, geometries: 'geojson', overview: 'full' }
): Promise<Route> => {
  if (waypoints.length < 2) {
    throw new Error('At least 2 waypoints are required');
  }

  const token = await getMapboxToken();

  // Format coordinates for the API
  const coordinates = waypoints.map(wp => wp.coordinates.join(',')).join(';');

  // Build query parameters
  const queryParams = new URLSearchParams({
    access_token: token,
    alternatives: options.alternatives?.toString() || 'false',
    steps: options.steps?.toString() || 'true',
    geometries: options.geometries || 'geojson',
    overview: options.overview || 'full',
  });

  if (options.annotations) {
    queryParams.append('annotations', options.annotations.join(','));
  }

  // Make API request
  const response = await fetch(
    `${DIRECTIONS_API}/${profile}/${coordinates}?${queryParams.toString()}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorData = await response.json();
    throw new Error(`Mapbox API error: ${errorData.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.routes[0];
};

/**
 * Geocode an address to coordinates
 * @param address Address to geocode
 * @returns Coordinates [longitude, latitude]
 */
export const geocodeAddress = async (address: string): Promise<[number, number]> => {
  const token = await getMapboxToken();

  const queryParams = new URLSearchParams({
    access_token: token,
    limit: '1',
  });

  const response = await fetch(
    `${GEOCODING_API}/${encodeURIComponent(address)}.json?${queryParams.toString()}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorData = await response.json();
    throw new Error(`Geocoding error: ${errorData.message || 'Unknown error'}`);
  }

  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new Error('No results found for the address');
  }

  return data.features[0].center as [number, number];
};

/**
 * Calculate ETA based on route information
 * @param route Route information
 * @param departureTime Departure time (default: now)
 * @returns Estimated arrival time
 */
export const calculateETA = (route: Route, departureTime: Date = new Date()): Date => {
  const arrivalTime = new Date(departureTime);
  arrivalTime.setSeconds(arrivalTime.getSeconds() + route.duration);
  return arrivalTime;
};

export default {
  getDirections,
  geocodeAddress,
  calculateETA,
  MapboxProfile,
};
