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

'use client';

import React from 'react';
import mapboxService, { MapboxProfile, Route, Waypoint } from '@/services/mapboxService';
import { formatDistance, formatDuration } from '@/utils/formatters';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowsUpDownIcon, MapPinIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

interface RoutePlannerProps {
  initialOrigin?: string;
  initialDestination?: string;
  onRouteChange?: (route: {
    waypoints: Waypoint[];
    route: Route | null;
    distance: string;
    duration: string;
    estimatedDeparture: string;
    estimatedArrival: string;
  }) => void;
}

export default function RoutePlanner({
  initialOrigin = '',
  initialDestination = '',
  onRouteChange,
}: RoutePlannerProps) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: 'origin', name: 'Origin', coordinates: [0, 0], address: initialOrigin },
    { id: 'destination', name: 'Destination', coordinates: [0, 0], address: initialDestination },
  ]);

  const [route, setRoute] = useState<Route | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departureDate, setDepartureDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [departureTime, setDepartureTime] = useState<string>('08:00');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown | null>(null); // Using any instead of mapboxgl.Map to avoid type errors

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // This would be implemented with Mapbox GL JS
    // For now, we'll just simulate it
    // Map initialization would happen here

    return () => {
      if (mapRef.current) {
        // mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Calculate route when waypoints change
  useEffect(() => {
    if (waypoints.length < 2) return;

    // Check if all waypoints have coordinates
    const allWaypointsHaveCoordinates = waypoints.every(
      wp => wp.coordinates[0] !== 0 && wp.coordinates[1] !== 0
    );

    if (!allWaypointsHaveCoordinates) {
      // Try to geocode addresses
      const geocodeWaypoints = async () => {
        try {
          const updatedWaypoints = [...waypoints];
          let changed = false;

          for (let i = 0; i < updatedWaypoints.length; i++) {
            const wp = updatedWaypoints[i];
            if (wp.coordinates[0] === 0 && wp.coordinates[1] === 0 && wp.address) {
              try {
                const coordinates = await mapboxService.geocodeAddress(wp.address);
                updatedWaypoints[i] = { ...wp, coordinates };
                changed = true;
              } catch (err) {
                // Silently handle geocoding errors for individual waypoints
                // This allows other waypoints to still be processed
              }
            }
          }

          if (changed) {
            setWaypoints(updatedWaypoints);
          }
        } catch (err) {
          // Handle overall geocoding process errors
          setError('Error processing addresses. Please check your input and try again.');
        }
      };

      geocodeWaypoints();
      return;
    }

    // Calculate route
    const calculateRoute = async () => {
      setIsCalculating(true);
      setError(null);

      try {
        const routeData = await mapboxService.getDirections(waypoints, MapboxProfile.TRUCKING);

        setRoute(routeData);

        // Update map with route
        // This would be implemented with Mapbox GL JS
        // Route would be displayed on map here

        // Call onRouteChange callback
        if (onRouteChange) {
          const departure = new Date(`${departureDate}T${departureTime}`);
          const arrival = mapboxService.calculateETA(routeData, departure);

          onRouteChange({
            waypoints,
            route: routeData,
            distance: formatDistance(routeData.distance),
            duration: formatDuration(routeData.duration),
            estimatedDeparture: departure.toISOString(),
            estimatedArrival: arrival.toISOString(),
          });
        }
      } catch (err: unknown) {
        // Log error for debugging but handle gracefully for users
        const errorMessage = (err instanceof Error ? err.message : String(err)) || 'Failed to calculate route';
        setError(errorMessage);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateRoute();
  }, [waypoints, departureDate, departureTime, onRouteChange]);

  // Add waypoint
  const addWaypoint = () => {
    const newWaypoint: Waypoint = {
      id: `waypoint-${Date.now()}`,
      name: `Waypoint ${waypoints.length - 1}`,
      coordinates: [0, 0],
      address: '',
      isStopover: true,
    };

    // Insert before destination
    const newWaypoints = [
      ...waypoints.slice(0, waypoints.length - 1),
      newWaypoint,
      waypoints[waypoints.length - 1],
    ];

    setWaypoints(newWaypoints);
  };

  // Remove waypoint
  const removeWaypoint = (id: string) => {
    setWaypoints(waypoints.filter(wp => wp.id !== id));
  };

  // Handle waypoint address change
  const handleAddressChange = (id: string, address: string) => {
    setWaypoints(
      waypoints.map(wp => (wp.id === id ? { ...wp, address, coordinates: [0, 0] } : wp))
    );
  };

  // Set up sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setWaypoints(currentWaypoints => {
      const oldIndex = currentWaypoints.findIndex(wp => wp.id === active.id);
      const newIndex = currentWaypoints.findIndex(wp => wp.id === over.id);

      const reorderedWaypoints = arrayMove(currentWaypoints, oldIndex, newIndex);

      // Ensure origin is first and destination is last
      const origin = reorderedWaypoints.find(wp => wp.id === 'origin');
      const destination = reorderedWaypoints.find(wp => wp.id === 'destination');

      if (origin && destination) {
        const filteredItems = reorderedWaypoints.filter(
          wp => wp.id !== 'origin' && wp.id !== 'destination'
        );
        return [origin, ...filteredItems, destination];
      }

      return reorderedWaypoints;
    });
  };

  // Sortable waypoint component
  const SortableWaypoint = ({ waypoint, index }: { waypoint: Waypoint; index: number }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: waypoint.id,
      disabled: waypoint.id === 'origin' || waypoint.id === 'destination',
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      position: 'relative' as const,
      zIndex: isDragging ? 1 : 0,
    };

    const isFixed = waypoint.id === 'origin' || waypoint.id === 'destination';
    const waypointLabel =
      waypoint.id === 'origin'
        ? 'Origin'
        : waypoint.id === 'destination'
          ? 'Destination'
          : `Waypoint ${index}`;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700"
        role="listitem"
        aria-roledescription={isFixed ? 'fixed waypoint' : 'sortable waypoint'}
      >
        <div
          {...attributes}
          {...listeners}
          className={`text-gray-400 ${isFixed ? 'cursor-not-allowed opacity-50' : 'cursor-grab'}`}
          tabIndex={isFixed ? -1 : 0}
          role={isFixed ? 'presentation' : 'button'}
          aria-label={isFixed ? undefined : `Drag ${waypointLabel}`}
          aria-disabled={isFixed}
        >
          <ArrowsUpDownIcon className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="flex-1">
          <label
            htmlFor={`waypoint-${waypoint.id}`}
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            {waypointLabel}
          </label>
          <input
            id={`waypoint-${waypoint.id}`}
            type="text"
            value={waypoint.address || ''}
            onChange={e => handleAddressChange(waypoint.id, e.target.value)}
            placeholder="Enter address"
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Address for ${waypointLabel}`}
          />
        </div>

        {waypoint.id !== 'origin' && waypoint.id !== 'destination' && (
          <button
            onClick={() => removeWaypoint(waypoint.id)}
            className="p-1.5 rounded-full bg-gray-700 text-gray-400 hover:bg-red-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={`Remove ${waypointLabel}`}
          >
            <MinusIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
      <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Route Planning</h2>
        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Waypoints */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Waypoints</h3>
            <button
              onClick={addWaypoint}
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              aria-label="Add waypoint"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>

          <div role="region" aria-label="Route waypoints">
            <div className="sr-only" id="waypoint-instructions">
              Use space or enter to select a waypoint, then use arrow keys to move it, and space or
              enter again to drop it. Origin and destination waypoints cannot be reordered.
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              accessibility={{
                announcements: {
                  onDragStart: ({ active }) => `Picked up waypoint ${active.id}`,
                  onDragOver: ({ active, over }) =>
                    over ? `Waypoint ${active.id} is over position ${over.id}` : '',
                  onDragEnd: ({ active, over }) =>
                    over
                      ? `Waypoint ${active.id} was dropped over position ${over.id}`
                      : 'Waypoint was dropped',
                  onDragCancel: ({ active }) =>
                    `Dragging was cancelled. Waypoint ${active.id} was returned to its starting position`,
                },
              }}
            >
              <SortableContext
                items={waypoints.map(wp => wp.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3" role="list" aria-describedby="waypoint-instructions">
                  {waypoints.map((waypoint, index) => (
                    <SortableWaypoint key={waypoint.id} waypoint={waypoint} index={index} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Departure Time */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-white">Departure Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={e => setDepartureDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={e => setDepartureTime(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div>
          <div
            ref={mapContainerRef}
            className="h-96 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center"
          >
            {isCalculating ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-400">Calculating route...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-400 p-4">
                <p>{error}</p>
                <p className="mt-2 text-sm">Please check your waypoint addresses and try again.</p>
              </div>
            ) : !route ? (
              <div className="text-center text-gray-400">
                <MapPinIcon className="h-10 w-10 mx-auto mb-2" />
                <p>Enter addresses to calculate a route</p>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p>Map would display here</p>
                <div className="mt-4 bg-gray-700 p-4 rounded-lg text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Distance</p>
                      <p className="text-lg text-white">{formatDistance(route.distance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Duration</p>
                      <p className="text-lg text-white">{formatDuration(route.duration)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Departure</p>
                      <p className="text-lg text-white">
                        {new Date(`${departureDate}T${departureTime}`).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Arrival (Est.)</p>
                      <p className="text-lg text-white">
                        {mapboxService
                          .calculateETA(route, new Date(`${departureDate}T${departureTime}`))
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
