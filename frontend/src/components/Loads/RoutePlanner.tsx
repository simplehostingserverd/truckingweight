'use client';

import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusIcon, MinusIcon, ArrowsUpDownIcon, MapPinIcon } from '@heroicons/react/24/outline';
import mapboxService, { Waypoint, MapboxProfile, Route } from '@/services/mapboxService';
import { formatDistance, formatDuration } from '@/utils/formatters';

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
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // This would be implemented with Mapbox GL JS
    // For now, we'll just simulate it
    console.log('Map would be initialized here');

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
                console.error(`Failed to geocode address: ${wp.address}`, err);
              }
            }
          }

          if (changed) {
            setWaypoints(updatedWaypoints);
          }
        } catch (err) {
          console.error('Error geocoding waypoints:', err);
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
        console.log('Route would be displayed on map here');

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
      } catch (err: any) {
        console.error('Error calculating route:', err);
        setError(err.message || 'Failed to calculate route');
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

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(waypoints);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Ensure origin is first and destination is last
    const origin = items.find(wp => wp.id === 'origin');
    const destination = items.find(wp => wp.id === 'destination');

    if (origin && destination) {
      const filteredItems = items.filter(wp => wp.id !== 'origin' && wp.id !== 'destination');
      setWaypoints([origin, ...filteredItems, destination]);
    } else {
      setWaypoints(items);
    }
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

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="waypoints">
              {provided => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {waypoints.map((waypoint, index) => (
                    <Draggable
                      key={waypoint.id}
                      draggableId={waypoint.id}
                      index={index}
                      isDragDisabled={waypoint.id === 'origin' || waypoint.id === 'destination'}
                    >
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700"
                        >
                          <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab">
                            <ArrowsUpDownIcon className="h-5 w-5" />
                          </div>

                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              {waypoint.id === 'origin'
                                ? 'Origin'
                                : waypoint.id === 'destination'
                                  ? 'Destination'
                                  : `Waypoint ${index}`}
                            </label>
                            <input
                              type="text"
                              value={waypoint.address || ''}
                              onChange={e => handleAddressChange(waypoint.id, e.target.value)}
                              placeholder="Enter address"
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {waypoint.id !== 'origin' && waypoint.id !== 'destination' && (
                            <button
                              onClick={() => removeWaypoint(waypoint.id)}
                              className="p-1.5 rounded-full bg-gray-700 text-gray-400 hover:bg-red-600 hover:text-white transition-colors"
                              aria-label="Remove waypoint"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

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
