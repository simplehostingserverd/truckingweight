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

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BellIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { driverTrackingService } from '@/services/driverTrackingService';
import { toast } from '@/hooks/use-toast';

interface GeofenceZone {
  id: string;
  name: string;
  description?: string;
  type: 'allowed' | 'restricted' | 'warning';
  shape: 'circle' | 'polygon';
  coordinates: {
    latitude: number;
    longitude: number;
    radius?: number; // for circle
    points?: { lat: number; lng: number }[]; // for polygon
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  schedule?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    days: string[];
  };
}

interface GeofenceViolation {
  id: string;
  zoneId: string;
  zoneName: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehiclePlate: string;
  violationType: 'entry' | 'exit' | 'speeding' | 'unauthorized_stop';
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  notes?: string;
}

interface EnhancedGeofencingProps {
  onZoneSelect?: (zoneId: string) => void;
  onViolationSelect?: (violationId: string) => void;
}

const EnhancedGeofencing = () => {
  const [zones, setZones] = useState<GeofenceZone[]>([]);
  const [violations, setViolations] = useState<GeofenceViolation[]>([]);
  const [selectedZone, setSelectedZone] = useState<GeofenceZone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('zones');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingZone, setEditingZone] = useState<GeofenceZone | null>(null);
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [isEditingZone, setIsEditingZone] = useState(false);
  const [violationFilter, setViolationFilter] = useState<string>('all');

  // Form state for zone creation/editing
  const [zoneForm, setZoneForm] = useState<Partial<GeofenceZone>>({
    name: '',
    description: '',
    type: 'allowed',
    shape: 'circle',
    isActive: true,
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    schedule: {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
  });

  // Mock data for demonstration
  const generateMockZones = (): GeofenceZone[] => {
    return [
      {
        id: '1',
        name: 'Main Depot',
        description: 'Primary loading and unloading facility',
        type: 'allowed',
        shape: 'circle',
        coordinates: {
          latitude: 40.7589,
          longitude: -73.9851,
          radius: 500,
        },
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
        schedule: {
          enabled: true,
          startTime: '06:00',
          endTime: '22:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
      },
      {
        id: '2',
        name: 'Restricted Area - Downtown',
        description: 'No truck access during business hours',
        type: 'restricted',
        shape: 'polygon',
        coordinates: {
          latitude: 40.7505,
          longitude: -73.9934,
          points: [
            { lat: 40.7505, lng: -73.9934 },
            { lat: 40.7515, lng: -73.9924 },
            { lat: 40.7495, lng: -73.9914 },
            { lat: 40.7485, lng: -73.9944 },
          ],
        },
        isActive: true,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
        schedule: {
          enabled: true,
          startTime: '08:00',
          endTime: '18:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
      },
      {
        id: '3',
        name: 'Customer Zone A',
        description: 'Delivery zone for Customer A',
        type: 'allowed',
        shape: 'circle',
        coordinates: {
          latitude: 40.7282,
          longitude: -74.0776,
          radius: 200,
        },
        isActive: true,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
        notifications: {
          email: false,
          sms: false,
          push: true,
        },
      },
    ];
  };

  const generateMockViolations = (): GeofenceViolation[] => {
    return [
      {
        id: '1',
        zoneId: '2',
        zoneName: 'Restricted Area - Downtown',
        driverId: 'DRV001',
        driverName: 'John Smith',
        vehicleId: 'VEH001',
        vehiclePlate: 'TRK-001',
        violationType: 'entry',
        timestamp: '2024-01-15T14:30:00Z',
        location: {
          latitude: 40.7505,
          longitude: -73.9934,
          address: '456 Broadway, New York, NY',
        },
        severity: 'high',
        status: 'active',
        notes: 'Driver entered restricted zone during business hours',
      },
      {
        id: '2',
        zoneId: '1',
        zoneName: 'Main Depot',
        driverId: 'DRV002',
        driverName: 'Sarah Johnson',
        vehicleId: 'VEH002',
        vehiclePlate: 'TRK-002',
        violationType: 'unauthorized_stop',
        timestamp: '2024-01-15T12:15:00Z',
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
          address: '123 Main St, New York, NY',
        },
        severity: 'medium',
        status: 'acknowledged',
        notes: 'Extended stop time exceeded policy limits',
      },
      {
        id: '3',
        zoneId: '3',
        zoneName: 'Customer Zone A',
        driverId: 'DRV003',
        driverName: 'Mike Wilson',
        vehicleId: 'VEH003',
        vehiclePlate: 'TRK-003',
        violationType: 'exit',
        timestamp: '2024-01-15T16:45:00Z',
        location: {
          latitude: 40.7282,
          longitude: -74.0776,
          address: '789 West Side Ave, Jersey City, NJ',
        },
        severity: 'low',
        status: 'resolved',
        notes: 'Delivery completed, normal exit',
      },
    ];
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [zonesData, violationsData] = await Promise.all([
          driverTrackingService.getGeofences(),
          // Note: violations would typically be fetched separately
          // For now, we'll use empty array until backend implements violations endpoint
          Promise.resolve([] as GeofenceViolation[])
        ]);
        
        setZones(zonesData);
        setViolations(violationsData);
      } catch (error) {
        console.error('Error fetching geofencing data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch geofencing data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getZoneTypeColor = (type: string) => {
    switch (type) {
      case 'allowed':
        return 'bg-green-500';
      case 'restricted':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getZoneTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'allowed':
        return 'default';
      case 'restricted':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleCreateZone = () => {
    const newZone: GeofenceZone = {
      ...zoneForm,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as GeofenceZone;

    setZones([...zones, newZone]);
    setIsCreatingZone(false);
    setZoneForm({
      name: '',
      description: '',
      type: 'allowed',
      shape: 'circle',
      isActive: true,
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
    });
  };

  const handleEditZone = () => {
    if (selectedZone) {
      const updatedZones = zones.map(zone =>
        zone.id === selectedZone.id
          ? { ...zoneForm, id: selectedZone.id, updatedAt: new Date().toISOString() } as GeofenceZone
          : zone
      );
      setZones(updatedZones);
      setIsEditingZone(false);
      setSelectedZone(null);
    }
  };

  const handleDeleteZone = (zoneId: string) => {
    setZones(zones.filter(zone => zone.id !== zoneId));
    if (selectedZone?.id === zoneId) {
      setSelectedZone(null);
    }
  };

  const toggleZoneStatus = (zoneId: string) => {
    const updatedZones = zones.map(zone =>
      zone.id === zoneId
        ? { ...zone, isActive: !zone.isActive, updatedAt: new Date().toISOString() }
        : zone
    );
    setZones(updatedZones);
  };

  const acknowledgeViolation = (violationId: string) => {
    const updatedViolations = violations.map(violation =>
      violation.id === violationId
        ? { ...violation, status: 'acknowledged' as const }
        : violation
    );
    setViolations(updatedViolations);
  };

  const resolveViolation = (violationId: string) => {
    const updatedViolations = violations.map(violation =>
      violation.id === violationId
        ? { ...violation, status: 'resolved' as const }
        : violation
    );
    setViolations(updatedViolations);
  };

  const filteredViolations = violations.filter(violation => {
    if (violationFilter === 'all') return true;
    return violation.status === violationFilter;
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Tabs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5" />
              Enhanced Geofencing
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'zones' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('zones')}
              >
                Zones ({zones.length})
              </Button>
              <Button
                variant={activeTab === 'violations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('violations')}
              >
                Violations ({violations.filter(v => v.status === 'active').length})
              </Button>
              <Button
                variant={activeTab === 'analytics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Zones Tab */}
      {activeTab === 'zones' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Zone List */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Geofence Zones</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setIsCreatingZone(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Zone
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedZone?.id === zone.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedZone(zone)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getZoneTypeColor(zone.type)}`} />
                      <div>
                        <p className="font-medium">{zone.name}</p>
                        <p className="text-sm text-gray-600">{zone.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getZoneTypeBadgeVariant(zone.type)}>
                        {zone.type}
                      </Badge>
                      <Switch
                        checked={zone.isActive}
                        onCheckedChange={() => toggleZoneStatus(zone.id)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="h-3 w-3" />
                      {zone.shape} zone
                    </div>
                    <div className="flex items-center gap-1">
                      <BellIcon className="h-3 w-3" />
                      {Object.values(zone.notifications).filter(Boolean).length} alerts
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Zone Details/Form */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {isCreatingZone ? 'Create New Zone' : isEditingZone ? 'Edit Zone' : 'Zone Details'}
                </CardTitle>
                {selectedZone && !isEditingZone && !isCreatingZone && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setZoneForm(selectedZone);
                        setIsEditingZone(true);
                      }}
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteZone(selectedZone.id)}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(isCreatingZone || isEditingZone) ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Zone Name</label>
                    <Input
                      value={zoneForm.name || ''}
                      onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                      placeholder="Enter zone name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      value={zoneForm.description || ''}
                      onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                      placeholder="Enter zone description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Zone Type</label>
                      <Select
                        value={zoneForm.type}
                        onValueChange={(value) => setZoneForm({ ...zoneForm, type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="allowed">Allowed</SelectItem>
                          <SelectItem value="restricted">Restricted</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Shape</label>
                      <Select
                        value={zoneForm.shape}
                        onValueChange={(value) => setZoneForm({ ...zoneForm, shape: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="polygon">Polygon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreatingZone(false);
                        setIsEditingZone(false);
                        setZoneForm({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={isCreatingZone ? handleCreateZone : handleEditZone}
                    >
                      {isCreatingZone ? 'Create Zone' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              ) : selectedZone ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <Badge variant={getZoneTypeBadgeVariant(selectedZone.type)}>
                        {selectedZone.type}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Shape</p>
                      <p className="font-medium capitalize">{selectedZone.shape}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge variant={selectedZone.isActive ? 'default' : 'secondary'}>
                        {selectedZone.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">{formatDate(selectedZone.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Notifications</p>
                    <div className="flex gap-2">
                      {selectedZone.notifications.email && <Badge variant="outline">Email</Badge>}
                      {selectedZone.notifications.sms && <Badge variant="outline">SMS</Badge>}
                      {selectedZone.notifications.push && <Badge variant="outline">Push</Badge>}
                    </div>
                  </div>
                  
                  {selectedZone.schedule?.enabled && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Schedule</p>
                      <p className="text-sm">
                        {selectedZone.schedule.startTime} - {selectedZone.schedule.endTime}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedZone.schedule.days.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <EyeIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Select a zone to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div className="space-y-6">
          {/* Violation Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Select value={violationFilter} onValueChange={setViolationFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Violations</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-600">
                  {filteredViolations.length} violations
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Violations List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Violations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredViolations.map((violation) => (
                <div
                  key={violation.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(violation.severity)}`} />
                      <div>
                        <p className="font-medium">{violation.driverName}</p>
                        <p className="text-sm text-gray-600">{violation.vehiclePlate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityBadgeVariant(violation.severity)}>
                        {violation.severity}
                      </Badge>
                      <Badge variant="outline">
                        {violation.violationType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Zone</p>
                      <p className="font-medium">{violation.zoneName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">{formatDate(violation.timestamp)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{violation.location.address}</p>
                    </div>
                  </div>
                  
                  {violation.notes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="text-sm">{violation.notes}</p>
                    </div>
                  )}
                  
                  {violation.status === 'active' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeViolation(violation.id)}
                      >
                        Acknowledge
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => resolveViolation(violation.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Zones</p>
                  <p className="text-2xl font-bold">{zones.length}</p>
                </div>
                <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Violations</p>
                  <p className="text-2xl font-bold text-red-600">
                    {violations.filter(v => v.status === 'active').length}
                  </p>
                </div>
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold">{violations.length}</p>
                </div>
                <ClockIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Compliance Rate</p>
                  <p className="text-2xl font-bold text-green-600">94.2%</p>
                </div>
                <ShieldCheckIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedGeofencing;