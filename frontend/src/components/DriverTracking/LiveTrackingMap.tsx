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

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Truck, MapPin, Navigation, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { driverTrackingService, LiveDriver } from '@/services/driverTrackingService';
import { toast } from '@/hooks/use-toast';

const LiveTrackingMap = () => {
  const [drivers, setDrivers] = useState<LiveDriver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<LiveDriver | null>(null);
  const [mapView, setMapView] = useState('all'); // 'all', 'active', 'alerts'
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef(null);

  // Fetch live driver data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await driverTrackingService.getLiveDrivers();
        if (response.success) {
          setDrivers(response.data);
        } else {
          toast({
            title: "Error fetching driver data",
            description: "Could not retrieve live driver information",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching live drivers:', error);
        toast({
          title: "Connection Error",
          description: error.message || "Failed to connect to tracking service",
          variant: "destructive"
        });
        // Use mock data as fallback in development
        if (process.env.NODE_ENV === 'development') {
          setDrivers(generateMockDrivers());
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up auto-refresh
    let intervalId: NodeJS.Timeout;
    if (isAutoRefresh) {
      intervalId = setInterval(fetchData, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [refreshInterval, isAutoRefresh]);
  
  // Filter drivers based on map view and search query
  const filteredDrivers = drivers.filter(driver => {
    // Filter by view type
    const viewFilter = 
      mapView === 'all' ? true : 
      mapView === 'active' ? driver.status === 'active' : 
      mapView === 'alerts' ? (driver.alerts && driver.alerts.length > 0) : 
      true;
    
    // Filter by search query
    const searchFilter = searchQuery === '' ? true : 
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      driver.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    return viewFilter && searchFilter;
  });
  
  const handleDriverSelect = (driver: LiveDriver) => {
    setSelectedDriver(driver);
    // In a real implementation, this would center the map on the driver
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-yellow-500';
      case 'break': return 'bg-blue-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Driver List Panel */}
      <Card className="lg:col-span-1 overflow-auto max-h-[calc(100vh-220px)]">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Drivers ({filteredDrivers.length})</span>
            <div className="flex items-center space-x-2">
              <Switch 
                id="auto-refresh" 
                checked={isAutoRefresh} 
                onCheckedChange={setIsAutoRefresh} 
              />
              <Label htmlFor="auto-refresh">Auto-refresh</Label>
            </div>
          </CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-2">
              <span>Refresh every</span>
              <Select 
                value={refreshInterval.toString()} 
                onValueChange={(value) => setRefreshInterval(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="30s" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10s</SelectItem>
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="60">1m</SelectItem>
                  <SelectItem value="300">5m</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <Input 
              placeholder="Search drivers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex space-x-2">
              <Button 
                variant={mapView === 'all' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setMapView('all')}
              >
                All
              </Button>
              <Button 
                variant={mapView === 'active' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setMapView('active')}
              >
                Active
              </Button>
              <Button 
                variant={mapView === 'alerts' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setMapView('alerts')}
              >
                Alerts
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver) => (
                  <div 
                    key={driver.id} 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedDriver?.id === driver.id ? 'bg-muted border-primary' : 'hover:bg-muted'}`}
                    onClick={() => handleDriverSelect(driver)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium flex items-center">
                          <Truck className="h-4 w-4 mr-1" />
                          {driver.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{driver.vehiclePlate}</div>
                      </div>
                      <Badge className={`${getStatusColor(driver.status)} text-white`}>
                        {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {driver.location.address}
                      </div>
                      <div className="flex items-center text-muted-foreground mt-1">
                        <Navigation className="h-3 w-3 mr-1" />
                        {driver.speed} mph, Heading: {driver.heading}°
                      </div>
                      {driver.route && (
                        <div className="flex items-center text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          ETA: {new Date(driver.route.eta).toLocaleTimeString()}, Progress: {driver.route.progress}%
                        </div>
                      )}
                    </div>
                    
                    {driver.alerts && driver.alerts.length > 0 && (
                      <div className="mt-2">
                        {driver.alerts.map((alert) => (
                          <div key={alert.id} className="flex items-center mt-1">
                            <AlertCircle className={`h-3 w-3 mr-1 ${getSeverityColor(alert.severity).replace('bg-', 'text-')}`} />
                            <span className="text-xs">{alert.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No drivers match your criteria</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Map and Details Panel */}
      <div className="lg:col-span-2 space-y-4">
        {/* Map Card */}
        <Card className="h-[calc(100vh-400px)] min-h-[400px]">
          <CardHeader className="pb-2">
            <CardTitle>Live Tracking Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-full bg-muted rounded-md flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Map will be displayed here</p>
                <p className="text-sm text-muted-foreground">Integrate with Google Maps, Mapbox, or other mapping service</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Driver Details Card */}
        {selectedDriver ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>Driver Details</span>
                <Badge className={`${getStatusColor(selectedDriver.status)} text-white`}>
                  {selectedDriver.status.charAt(0).toUpperCase() + selectedDriver.status.slice(1)}
                </Badge>
              </CardTitle>
              <CardDescription>
                {selectedDriver.name} - {selectedDriver.vehiclePlate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="info">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="route">Route</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Current Location</h4>
                      <p className="text-sm text-muted-foreground">{selectedDriver.location.address}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Last Updated</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedDriver.location.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Speed</h4>
                      <p className="text-sm text-muted-foreground">{selectedDriver.speed} mph</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Heading</h4>
                      <p className="text-sm text-muted-foreground">{selectedDriver.heading}°</p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Contact</Button>
                      <Button size="sm" variant="outline">Message</Button>
                      <Button size="sm" variant="outline">Route</Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="route">
                  {selectedDriver.route ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">Current Route</h4>
                        <p className="text-sm text-muted-foreground">{selectedDriver.route.name}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Progress</h4>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${selectedDriver.route.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0%</span>
                          <span>{selectedDriver.route.progress}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">ETA</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedDriver.route.eta).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <Button size="sm">View Full Route</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No active route</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="alerts">
                  {selectedDriver.alerts && selectedDriver.alerts.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDriver.alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start p-2 border rounded-md">
                          <div className="mr-2 mt-0.5">
                            {alert.severity === 'critical' || alert.severity === 'high' ? (
                              <AlertTriangle className={`h-4 w-4 ${getSeverityColor(alert.severity).replace('bg-', 'text-')}`} />
                            ) : (
                              <AlertCircle className={`h-4 w-4 ${getSeverityColor(alert.severity).replace('bg-', 'text-')}`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-medium">{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert</h4>
                              <Badge className={`${getSeverityColor(alert.severity)} text-white text-xs`}>
                                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </span>
                              <Button size="sm" variant="ghost" className="h-6 px-2">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                <span className="text-xs">Acknowledge</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No alerts</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Select a driver to view details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Mock data for development and testing
const generateMockDrivers = (): LiveDriver[] => {
  const statuses = ['active', 'inactive', 'break', 'offline'];
  const alertTypes = ['speed', 'geofence', 'route', 'maintenance'];
  const alertSeverities = ['low', 'medium', 'high', 'critical'];
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: `driver-${i + 1}`,
    name: `Driver ${i + 1}`,
    vehicleId: `vehicle-${i + 1}`,
    vehiclePlate: `ABC-${1000 + i}`,
    status: statuses[Math.floor(Math.random() * statuses.length)] as any,
    location: {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.006 + (Math.random() - 0.5) * 0.1,
      address: `${100 + i} Broadway, New York, NY`,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
    },
    speed: Math.floor(Math.random() * 75),
    heading: Math.floor(Math.random() * 360),
    route: Math.random() > 0.3 ? {
      id: `route-${i + 1}`,
      name: `Route #${i + 1}`,
      progress: Math.floor(Math.random() * 100),
      eta: new Date(Date.now() + Math.random() * 3600000).toISOString()
    } : undefined,
    alerts: Array.from({ length: Math.floor(Math.random() * 3) }, (_, j) => ({
      id: `alert-${i}-${j}`,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)] as any,
      severity: alertSeverities[Math.floor(Math.random() * alertSeverities.length)] as any,
      message: `Alert: ${alertTypes[Math.floor(Math.random() * alertTypes.length)]} violation detected`,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
    }))
  }));
};

export default LiveTrackingMap;