/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPin, Clock, Route, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { driverTrackingService, RouteHistory as RouteHistoryType } from '@/services/driverTrackingService';
import { toast } from '@/hooks/use-toast';

const RouteHistory = () => {
  const [routes, setRoutes] = useState<RouteHistoryType[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteHistoryType[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteHistoryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('startTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [driverFilter, setDriverFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');

  // Mock data for demonstration
  const generateMockRouteData = (): RouteHistory[] => {
    const mockRoutes: RouteHistory[] = [
      {
        id: '1',
        driverId: 'DRV001',
        driverName: 'John Smith',
        vehicleId: 'VEH001',
        vehiclePlate: 'TRK-001',
        startTime: '2024-01-15T08:00:00Z',
        endTime: '2024-01-15T16:30:00Z',
        totalDistance: 245.8,
        totalDuration: 510, // minutes
        averageSpeed: 42.5,
        maxSpeed: 65.0,
        fuelConsumed: 28.5,
        stops: 4,
        status: 'completed',
        route: [
          {
            id: '1-1',
            latitude: 40.7589,
            longitude: -73.9851,
            timestamp: '2024-01-15T08:00:00Z',
            speed: 0,
            address: 'Depot - 123 Main St, New York, NY',
            eventType: 'start',
          },
          {
            id: '1-2',
            latitude: 40.7505,
            longitude: -73.9934,
            timestamp: '2024-01-15T10:30:00Z',
            speed: 0,
            address: 'Customer A - 456 Broadway, New York, NY',
            eventType: 'delivery',
          },
          {
            id: '1-3',
            latitude: 40.7282,
            longitude: -74.0776,
            timestamp: '2024-01-15T14:15:00Z',
            speed: 0,
            address: 'Customer B - 789 West Side Ave, Jersey City, NJ',
            eventType: 'delivery',
          },
          {
            id: '1-4',
            latitude: 40.7614,
            longitude: -73.9776,
            timestamp: '2024-01-15T16:30:00Z',
            speed: 0,
            address: 'Depot - 123 Main St, New York, NY',
            eventType: 'end',
          },
        ],
      },
      {
        id: '2',
        driverId: 'DRV002',
        driverName: 'Sarah Johnson',
        vehicleId: 'VEH002',
        vehiclePlate: 'TRK-002',
        startTime: '2024-01-14T07:30:00Z',
        endTime: '2024-01-14T18:45:00Z',
        totalDistance: 312.4,
        totalDuration: 675, // minutes
        averageSpeed: 38.2,
        maxSpeed: 70.0,
        fuelConsumed: 35.8,
        stops: 6,
        status: 'completed',
        route: [],
      },
      {
        id: '3',
        driverId: 'DRV001',
        driverName: 'John Smith',
        vehicleId: 'VEH001',
        vehiclePlate: 'TRK-001',
        startTime: '2024-01-16T08:15:00Z',
        endTime: '',
        totalDistance: 156.2,
        totalDuration: 285,
        averageSpeed: 45.8,
        maxSpeed: 62.0,
        fuelConsumed: 18.2,
        stops: 2,
        status: 'in-progress',
        route: [],
      },
    ];

    return mockRoutes;
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      setIsLoading(true);
      try {
        const data = await driverTrackingService.getRouteHistory();
        setRoutes(data);
        setFilteredRoutes(data);
      } catch (error) {
        console.error('Error fetching route history:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch route history',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  useEffect(() => {
    let filtered = [...routes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(route =>
        route.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(route => route.status === statusFilter);
    }

    // Apply driver filter
    if (driverFilter !== 'all') {
      filtered = filtered.filter(route => route.driverId === driverFilter);
    }

    // Apply vehicle filter
    if (vehicleFilter !== 'all') {
      filtered = filtered.filter(route => route.vehicleId === vehicleFilter);
    }

    // Apply date range filter
    if (selectedDateRange.start && selectedDateRange.end) {
      filtered = filtered.filter(route => {
        const routeDate = new Date(route.startTime);
        return routeDate >= selectedDateRange.start! && routeDate <= selectedDateRange.end!;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'startTime':
          aValue = new Date(a.startTime).getTime();
          bValue = new Date(b.startTime).getTime();
          break;
        case 'distance':
          aValue = a.totalDistance;
          bValue = b.totalDistance;
          break;
        case 'duration':
          aValue = a.totalDuration;
          bValue = b.totalDuration;
          break;
        case 'driver':
          aValue = a.driverName;
          bValue = b.driverName;
          break;
        default:
          aValue = new Date(a.startTime).getTime();
          bValue = new Date(b.startTime).getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue);
        return sortOrder === 'desc' ? -result : result;
      }
      
      const result = (aValue as number) - (bValue as number);
      return sortOrder === 'desc' ? -result : result;
    });

    setFilteredRoutes(filtered);
  }, [routes, searchTerm, statusFilter, driverFilter, vehicleFilter, selectedDateRange, sortBy, sortOrder]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const exportRouteData = () => {
    // In a real implementation, this would generate and download a CSV/Excel file
    console.log('Exporting route data:', filteredRoutes);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Route History
            </CardTitle>
            <Button variant="outline" size="sm" onClick={exportRouteData}>
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by driver or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FunnelIcon className="h-4 w-4" />
              {filteredRoutes.length} of {routes.length} routes
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Routes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading routes...</p>
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No routes found</p>
              </div>
            ) : (
              filteredRoutes.map((route) => (
                <div
                  key={route.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRoute?.id === route.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{route.driverName}</p>
                      <p className="text-sm text-gray-600">{route.vehiclePlate}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(route.status)}>
                      {route.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Date</p>
                      <p className="font-medium">{formatDate(route.startTime)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium">{formatDuration(route.duration)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Distance</p>
                      <p className="font-medium">{route.distance.toFixed(1)} mi</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Avg Speed</p>
                      <p className="font-medium">{route.averageSpeed.toFixed(1)} mph</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Route Details */}
        <Card>
          <CardHeader>
            <CardTitle>Route Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRoute ? (
              <div className="space-y-6">
                {/* Route Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TruckIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Vehicle</span>
                    </div>
                    <p className="text-sm text-gray-600">{selectedRoute.vehiclePlate}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Time</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatTime(selectedRoute.startTime)} - {selectedRoute.endTime ? formatTime(selectedRoute.endTime) : 'Ongoing'}
                    </p>
                  </div>
                </div>

                {/* Route Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Total Distance</p>
                    <p className="text-lg font-semibold">{selectedRoute.totalDistance.toFixed(1)} mi</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Fuel Consumed</p>
                    <p className="text-lg font-semibold">{selectedRoute.fuelConsumed.toFixed(1)} gal</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Max Speed</p>
                    <p className="text-lg font-semibold">{selectedRoute.maxSpeed.toFixed(1)} mph</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Total Stops</p>
                    <p className="text-lg font-semibold">{selectedRoute.stops}</p>
                  </div>
                </div>

                {/* Route Timeline */}
                {selectedRoute.route.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Route Timeline</h4>
                    <div className="space-y-3">
                      {selectedRoute.route.map((point, index) => (
                        <div key={point.id} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(point.eventType || 'default')}`} />
                            {index < selectedRoute.route.length - 1 && (
                              <div className="w-px h-8 bg-gray-300 mt-1" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium capitalize">
                                {point.eventType || 'waypoint'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(point.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{point.address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Select a route to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RouteHistory;