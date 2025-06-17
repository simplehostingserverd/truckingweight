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

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui';
import {
  PlusIcon,
  SignalIcon,
  WifiIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CloudIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface TelematicsProvider {
  id: string;
  name: string;
  logo: string;
  description: string;
  features: string[];
  connectionType: 'api' | 'hardware' | 'cloud';
  status: 'active' | 'inactive' | 'error' | 'pending';
  lastSync?: string;
  vehiclesConnected?: number;
  dataPoints?: string[];
}

const mockProviders: TelematicsProvider[] = [
  {
    id: 'geotab',
    name: 'Geotab',
    logo: '🚛',
    description: 'Industry-leading fleet management and telematics platform',
    features: [
      'GPS Tracking',
      'Engine Diagnostics',
      'Driver Behavior',
      'Fuel Management',
      'HOS Compliance',
    ],
    connectionType: 'api',
    status: 'active',
    lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    vehiclesConnected: 8,
    dataPoints: ['GPS', 'Engine RPM', 'Speed', 'Fuel Level', 'Engine Temperature', 'Odometer'],
  },
  {
    id: 'samsara',
    name: 'Samsara',
    logo: '📡',
    description: 'Complete fleet operations platform with AI-powered insights',
    features: [
      'Real-time GPS',
      'AI Dash Cams',
      'ELD Compliance',
      'Maintenance Alerts',
      'Route Optimization',
    ],
    connectionType: 'cloud',
    status: 'active',
    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    vehiclesConnected: 4,
    dataPoints: ['GPS', 'Video', 'Driver Behavior', 'Vehicle Health', 'Environmental'],
  },
  {
    id: 'fleetcomplete',
    name: 'Fleet Complete',
    logo: '🛰️',
    description: 'Comprehensive fleet management with advanced analytics',
    features: [
      'Asset Tracking',
      'Driver Safety',
      'Compliance Management',
      'Fuel Cards',
      'Maintenance',
    ],
    connectionType: 'api',
    status: 'pending',
    vehiclesConnected: 0,
    dataPoints: ['GPS', 'Engine Data', 'Driver Scores', 'Maintenance Alerts'],
  },
  {
    id: 'verizon-connect',
    name: 'Verizon Connect',
    logo: '📶',
    description: 'Enterprise fleet management with robust connectivity',
    features: ['Fleet Tracking', 'Mobile Workforce', 'Compliance', 'Analytics', 'Integration APIs'],
    connectionType: 'cloud',
    status: 'inactive',
    vehiclesConnected: 0,
    dataPoints: ['GPS', 'Cellular Data', 'Driver Behavior', 'Vehicle Diagnostics'],
  },
  {
    id: 'custom-hardware',
    name: 'Custom Hardware Integration',
    logo: '🔧',
    description: 'Direct integration with custom telematics hardware devices',
    features: ['OBD-II Port', 'CAN Bus', 'J1939 Protocol', 'Custom Sensors', 'Real-time Data'],
    connectionType: 'hardware',
    status: 'error',
    vehiclesConnected: 2,
    dataPoints: ['Raw CAN Data', 'Custom Sensors', 'OBD-II Codes'],
  },
];

export default function TelematicsIntegration() {
  const [providers, setProviders] = useState<TelematicsProvider[]>(mockProviders);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [connectionConfig, setConnectionConfig] = useState({
    apiKey: '',
    username: '',
    password: '',
    serverUrl: '',
    database: '',
    deviceId: '',
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'api':
        return <CloudIcon className="h-5 w-5" />;
      case 'hardware':
        return <DevicePhoneMobileIcon className="h-5 w-5" />;
      case 'cloud':
        return <WifiIcon className="h-5 w-5" />;
      default:
        return <ComputerDesktopIcon className="h-5 w-5" />;
    }
  };

  const handleAddProvider = () => {
    // In a real app, this would make an API call to configure the integration
    console.warn('Adding provider:', selectedProvider, connectionConfig);
    setShowAddDialog(false);
    setSelectedProvider('');
    setConnectionConfig({
      apiKey: '',
      username: '',
      password: '',
      serverUrl: '',
      database: '',
      deviceId: '',
    });
  };

  const handleTestConnection = (providerId: string) => {
    // In a real app, this would test the connection to the telematics provider
    console.warn('Testing connection for:', providerId);
  };

  const handleSyncData = (providerId: string) => {
    // In a real app, this would trigger a data sync
    console.warn('Syncing data for:', providerId);
    setProviders(
      providers.map(p => (p.id === providerId ? { ...p, lastSync: new Date().toISOString() } : p))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Telematics Integrations
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Connect and manage your 3rd party telematics providers
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map(provider => (
          <Card key={provider.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{provider.logo}</div>
                  <div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      {getConnectionIcon(provider.connectionType)}
                      <span className="text-sm text-gray-500 capitalize">
                        {provider.connectionType}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(provider.status)}
                  <Badge
                    variant={
                      provider.status === 'active'
                        ? 'success'
                        : provider.status === 'error'
                          ? 'destructive'
                          : provider.status === 'pending'
                            ? 'warning'
                            : 'secondary'
                    }
                  >
                    {provider.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {provider.description}
              </p>

              {/* Connection Stats */}
              {provider.status === 'active' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {provider.vehiclesConnected}
                    </div>
                    <div className="text-xs text-gray-500">Vehicles</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {provider.dataPoints?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Data Points</div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {provider.features.slice(0, 3).map(feature => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {provider.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{provider.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Data Points */}
              {provider.dataPoints && provider.dataPoints.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Data Points:</h4>
                  <div className="flex flex-wrap gap-1">
                    {provider.dataPoints.slice(0, 4).map(point => (
                      <Badge key={point} variant="secondary" className="text-xs">
                        {point}
                      </Badge>
                    ))}
                    {provider.dataPoints.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{provider.dataPoints.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Last Sync */}
              {provider.lastSync && (
                <div className="text-xs text-gray-500 mb-4">
                  Last sync: {new Date(provider.lastSync).toLocaleString()}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection(provider.id)}
                  className="flex-1"
                >
                  <SignalIcon className="h-4 w-4 mr-1" />
                  Test
                </Button>
                {provider.status === 'active' && (
                  <Button size="sm" onClick={() => handleSyncData(provider.id)} className="flex-1">
                    Sync Now
                  </Button>
                )}
              </div>

              {/* Error Message */}
              {provider.status === 'error' && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription className="text-xs">
                    Connection failed. Check configuration and try again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Integration Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Telematics Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geotab">Geotab</SelectItem>
                  <SelectItem value="samsara">Samsara</SelectItem>
                  <SelectItem value="fleetcomplete">Fleet Complete</SelectItem>
                  <SelectItem value="verizon-connect">Verizon Connect</SelectItem>
                  <SelectItem value="custom">Custom Hardware</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedProvider && (
              <>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={connectionConfig.apiKey}
                    onChange={e =>
                      setConnectionConfig({
                        ...connectionConfig,
                        apiKey: e.target.value,
                      })
                    }
                    placeholder="Enter API key"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={connectionConfig.username}
                    onChange={e =>
                      setConnectionConfig({
                        ...connectionConfig,
                        username: e.target.value,
                      })
                    }
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="serverUrl">Server URL</Label>
                  <Input
                    id="serverUrl"
                    value={connectionConfig.serverUrl}
                    onChange={e =>
                      setConnectionConfig({
                        ...connectionConfig,
                        serverUrl: e.target.value,
                      })
                    }
                    placeholder="https://api.provider.com"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProvider} disabled={!selectedProvider}>
              Add Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
