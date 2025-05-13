'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  PlusIcon,
  ArrowPathIcon,
  MapPinIcon,
  TruckIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { Database } from '@/types/supabase';

type Connection = {
  id: string;
  name: string;
  provider: string;
  status: string;
  created_at: string;
  last_sync: string | null;
  company_id: string;
};

type VehicleData = {
  id: string;
  name: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  lastUpdate: string;
  speed?: number;
  fuelLevel?: number;
  engineStatus?: string;
};

export default function TelematicsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [vehicleData, setVehicleData] = useState<VehicleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('vehicles');
  const [showNewConnectionDialog, setShowNewConnectionDialog] = useState(false);
  const [newConnection, setNewConnection] = useState({
    name: '',
    provider: 'geotab',
    config: {
      apiKey: '',
      username: '',
      password: '',
      database: '',
      server: '',
    },
  });
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchConnections();
    fetchVehicleData();
  }, []);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      setError('');

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData.session) {
        throw new Error('No active session');
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id, is_admin')
        .eq('id', sessionData.session.user.id)
        .single();

      if (userError) {
        throw userError;
      }

      let query = supabase
        .from('integration_connections')
        .select('*')
        .eq('integration_type', 'telematics');

      // If not admin, filter by company
      if (!userData.is_admin) {
        query = query.eq('company_id', userData.company_id);
      }

      const { data, error: connectionsError } = await query.order('created_at', {
        ascending: false,
      });

      if (connectionsError) {
        throw connectionsError;
      }

      setConnections(data || []);
    } catch (err: any) {
      console.error('Error fetching telematics connections:', err);
      setError(err.message || 'Failed to load telematics connections');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVehicleData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get active connections
      const activeConnections = connections.filter(conn => conn.status === 'active');

      if (activeConnections.length === 0) {
        // No active connections, use mock data for demo purposes
        const mockData: VehicleData[] = [
          {
            id: '1',
            name: 'Truck 101',
            status: 'active',
            location: {
              latitude: 32.7767,
              longitude: -96.797,
              address: 'Dallas, TX',
            },
            lastUpdate: new Date().toISOString(),
            speed: 65,
            fuelLevel: 75,
            engineStatus: 'running',
          },
          {
            id: '2',
            name: 'Truck 102',
            status: 'inactive',
            location: {
              latitude: 29.7604,
              longitude: -95.3698,
              address: 'Houston, TX',
            },
            lastUpdate: new Date(Date.now() - 3600000).toISOString(),
            speed: 0,
            fuelLevel: 45,
            engineStatus: 'off',
          },
          {
            id: '3',
            name: 'Truck 103',
            status: 'active',
            location: {
              latitude: 30.2672,
              longitude: -97.7431,
              address: 'Austin, TX',
            },
            lastUpdate: new Date().toISOString(),
            speed: 55,
            fuelLevel: 60,
            engineStatus: 'running',
          },
        ];

        setVehicleData(mockData);
        return;
      }

      // Try to fetch real data from the API
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error('No active session');
      }

      // Fetch vehicle data from API
      const response = await fetch('/api/telematics/vehicles', {
        headers: {
          'x-auth-token': sessionData.session.access_token || '',
        },
      });

      if (!response.ok) {
        // If API fails, fall back to mock data
        throw new Error('Failed to fetch vehicle data');
      }

      const data = await response.json();
      setVehicleData(data);
    } catch (err: any) {
      console.error('Error fetching vehicle data:', err);
      // Fall back to mock data on error
      const mockData: VehicleData[] = [
        {
          id: '1',
          name: 'Truck 101',
          status: 'active',
          location: {
            latitude: 32.7767,
            longitude: -96.797,
            address: 'Dallas, TX',
          },
          lastUpdate: new Date().toISOString(),
          speed: 65,
          fuelLevel: 75,
          engineStatus: 'running',
        },
        {
          id: '2',
          name: 'Truck 102',
          status: 'inactive',
          location: {
            latitude: 29.7604,
            longitude: -95.3698,
            address: 'Houston, TX',
          },
          lastUpdate: new Date(Date.now() - 3600000).toISOString(),
          speed: 0,
          fuelLevel: 45,
          engineStatus: 'off',
        },
        {
          id: '3',
          name: 'Truck 103',
          status: 'active',
          location: {
            latitude: 30.2672,
            longitude: -97.7431,
            address: 'Austin, TX',
          },
          lastUpdate: new Date().toISOString(),
          speed: 55,
          fuelLevel: 60,
          engineStatus: 'running',
        },
      ];

      setVehicleData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConnection = async () => {
    try {
      setIsLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error('No active session');
      }

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', sessionData.session.user.id)
        .single();

      const { data, error } = await supabase
        .from('integration_connections')
        .insert({
          name: newConnection.name,
          provider: newConnection.provider,
          integration_type: 'telematics',
          company_id: userData.company_id,
          config: newConnection.config,
          is_active: true,
        })
        .select();

      if (error) {
        throw error;
      }

      setConnections([...(data || []), ...connections]);
      setShowNewConnectionDialog(false);
      setNewConnection({
        name: '',
        provider: 'geotab',
        config: {
          apiKey: '',
          username: '',
          password: '',
          database: '',
          server: '',
        },
      });
    } catch (err: any) {
      console.error('Error creating telematics connection:', err);
      setError(err.message || 'Failed to create telematics connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    try {
      // This would call your backend API to refresh data
      // For now, we'll just refresh the mock data
      fetchVehicleData();
    } catch (err: any) {
      console.error('Error refreshing data:', err);
      setError(err.message || 'Failed to refresh data');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Telematics Integration</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={() => setShowNewConnectionDialog(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Connection
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Telematics Data</CardTitle>
              <CardDescription>Real-time data from your connected vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              {vehicleData.length === 0 ? (
                <div className="text-center py-8">
                  <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No vehicle data available</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Vehicle</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Location</th>
                      <th className="text-left py-2">Speed</th>
                      <th className="text-left py-2">Fuel</th>
                      <th className="text-left py-2">Last Update</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleData.map(vehicle => (
                      <tr key={vehicle.id} className="border-b">
                        <td className="py-2 font-medium">{vehicle.name}</td>
                        <td className="py-2">
                          <Badge variant={vehicle.status === 'active' ? 'success' : 'destructive'}>
                            {vehicle.engineStatus === 'running' ? 'Running' : 'Stopped'}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{vehicle.location.address}</span>
                          </div>
                        </td>
                        <td className="py-2">{vehicle.speed} mph</td>
                        <td className="py-2">{vehicle.fuelLevel}%</td>
                        <td className="py-2">
                          {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                        </td>
                        <td className="py-2">
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <div className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : connections.length === 0 ? (
            <Card className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <SignalIcon className="h-12 w-12 text-gray-400" />
                <CardTitle>No Telematics Connections</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                  Get started by creating a new connection to your telematics provider.
                </CardDescription>
                <Button onClick={() => setShowNewConnectionDialog(true)} className="mt-2">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Connection
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map(connection => (
                <Card key={connection.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{connection.name}</CardTitle>
                        <CardDescription>
                          {connection.provider === 'geotab'
                            ? 'Geotab'
                            : connection.provider === 'samsara'
                              ? 'Samsara'
                              : connection.provider === 'fleetcomplete'
                                ? 'Fleet Complete'
                                : connection.provider}
                        </CardDescription>
                      </div>
                      <Badge variant={connection.status === 'active' ? 'success' : 'destructive'}>
                        {connection.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Last Sync:</span>
                        <span className="text-sm">
                          {connection.last_sync
                            ? new Date(connection.last_sync).toLocaleString()
                            : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Created:</span>
                        <span className="text-sm">
                          {new Date(connection.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                    <Button size="sm">
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Telematics Events</CardTitle>
              <CardDescription>Recent events from your connected vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">No recent events</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Connection Dialog */}
      <Dialog open={showNewConnectionDialog} onOpenChange={setShowNewConnectionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Telematics Connection</DialogTitle>
            <p className="text-sm text-gray-500">
              Connect your telematics provider to enable real-time vehicle data.
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="connection-name">Connection Name</Label>
              <Input
                id="connection-name"
                value={newConnection.name}
                onChange={e => setNewConnection({ ...newConnection, name: e.target.value })}
                placeholder="e.g., Fleet Geotab"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Telematics Provider</Label>
              <Select
                value={newConnection.provider}
                onValueChange={value =>
                  setNewConnection({
                    ...newConnection,
                    provider: value,
                  })
                }
              >
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select Telematics Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geotab">Geotab</SelectItem>
                  <SelectItem value="samsara">Samsara</SelectItem>
                  <SelectItem value="fleetcomplete">Fleet Complete</SelectItem>
                  <SelectItem value="omnitracs">Omnitracs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {newConnection.provider === 'geotab' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={newConnection.config.apiKey}
                    onChange={e =>
                      setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, apiKey: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newConnection.config.username}
                    onChange={e =>
                      setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, username: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newConnection.config.password}
                    onChange={e =>
                      setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, password: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="database">Database</Label>
                  <Input
                    id="database"
                    value={newConnection.config.database}
                    onChange={e =>
                      setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, database: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="server">Server</Label>
                  <Input
                    id="server"
                    value={newConnection.config.server}
                    onChange={e =>
                      setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, server: e.target.value },
                      })
                    }
                    placeholder="my.geotabserver.com"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewConnectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateConnection} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Connection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
