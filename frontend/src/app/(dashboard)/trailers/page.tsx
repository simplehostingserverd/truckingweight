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

import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  CalendarIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import Link from 'next/link';

interface Trailer {
  id: number;
  trailerNumber: string;
  type: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  capacityWeight: number;
  capacityVolume: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  axleCount: number;
  tireCount: number;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  telematicsDeviceId?: string;
  lastInspectionDate?: string;
  nextInspectionDue?: string;
  registrationState: string;
  registrationExpires: string;
  insurancePolicy: string;
  insuranceExpires: string;
  assignedLoad?: string;
  assignedDriver?: string;
}

interface TrailerStats {
  totalTrailers: number;
  availableTrailers: number;
  inUseTrailers: number;
  maintenanceTrailers: number;
  inspectionsDue: number;
  registrationExpiring: number;
}

export default function TrailersPage() {
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [filteredTrailers, setFilteredTrailers] = useState<Trailer[]>([]);
  const [stats, setStats] = useState<TrailerStats>({
    totalTrailers: 0,
    availableTrailers: 0,
    inUseTrailers: 0,
    maintenanceTrailers: 0,
    inspectionsDue: 0,
    registrationExpiring: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadTrailers();
  }, []);

  useEffect(() => {
    filterTrailers();
  }, [trailers, searchTerm, statusFilter, typeFilter]);

  const loadTrailers = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockTrailers: Trailer[] = [
        {
          id: 1,
          trailerNumber: 'TRL-001',
          type: 'dry_van',
          make: 'Great Dane',
          model: 'Everest',
          year: 2023,
          vin: '1GRAA0628PB123456',
          licensePlate: 'TRL001IL',
          capacityWeight: 80000,
          capacityVolume: 3800,
          dimensions: { length: 53, width: 8.5, height: 13.5 },
          axleCount: 2,
          tireCount: 8,
          status: 'in_use',
          currentLocation: {
            lat: 39.7817,
            lng: -89.6501,
            address: 'Springfield, IL',
          },
          telematicsDeviceId: 'TEL-TRL-001',
          lastInspectionDate: '2024-12-15',
          nextInspectionDue: '2025-06-15',
          registrationState: 'IL',
          registrationExpires: '2025-12-31',
          insurancePolicy: 'POL-TRL-001',
          insuranceExpires: '2025-11-30',
          assignedLoad: 'LD-2025-001',
          assignedDriver: 'John Smith',
        },
        {
          id: 2,
          trailerNumber: 'TRL-002',
          type: 'refrigerated',
          make: 'Utility',
          model: 'Reefer',
          year: 2022,
          vin: '1UYVS2538NB234567',
          licensePlate: 'TRL002IL',
          capacityWeight: 80000,
          capacityVolume: 3600,
          dimensions: { length: 53, width: 8.5, height: 13.5 },
          axleCount: 2,
          tireCount: 8,
          status: 'available',
          currentLocation: {
            lat: 39.7817,
            lng: -89.6501,
            address: 'Springfield, IL - Yard',
          },
          telematicsDeviceId: 'TEL-TRL-002',
          lastInspectionDate: '2025-01-10',
          nextInspectionDue: '2025-07-10',
          registrationState: 'IL',
          registrationExpires: '2025-10-31',
          insurancePolicy: 'POL-TRL-002',
          insuranceExpires: '2025-09-30',
        },
        {
          id: 3,
          trailerNumber: 'TRL-003',
          type: 'flatbed',
          make: 'Fontaine',
          model: 'Revolution',
          year: 2021,
          vin: '4FMCU0F70MB345678',
          licensePlate: 'TRL003IL',
          capacityWeight: 80000,
          capacityVolume: 0,
          dimensions: { length: 48, width: 8.5, height: 5 },
          axleCount: 2,
          tireCount: 8,
          status: 'maintenance',
          currentLocation: {
            lat: 39.7817,
            lng: -89.6501,
            address: 'Springfield, IL - Service Center',
          },
          telematicsDeviceId: 'TEL-TRL-003',
          lastInspectionDate: '2024-11-20',
          nextInspectionDue: '2025-05-20',
          registrationState: 'IL',
          registrationExpires: '2025-08-31',
          insurancePolicy: 'POL-TRL-003',
          insuranceExpires: '2025-07-31',
        },
        {
          id: 4,
          trailerNumber: 'TRL-004',
          type: 'dry_van',
          make: 'Wabash',
          model: 'DuraPlate',
          year: 2024,
          vin: '1JJV532W8NL456789',
          licensePlate: 'TRL004IL',
          capacityWeight: 80000,
          capacityVolume: 3850,
          dimensions: { length: 53, width: 8.5, height: 13.5 },
          axleCount: 2,
          tireCount: 8,
          status: 'available',
          currentLocation: {
            lat: 39.7817,
            lng: -89.6501,
            address: 'Springfield, IL - Yard',
          },
          telematicsDeviceId: 'TEL-TRL-004',
          lastInspectionDate: '2025-01-05',
          nextInspectionDue: '2025-07-05',
          registrationState: 'IL',
          registrationExpires: '2025-12-31',
          insurancePolicy: 'POL-TRL-004',
          insuranceExpires: '2025-11-30',
        },
      ];

      const mockStats: TrailerStats = {
        totalTrailers: mockTrailers.length,
        availableTrailers: mockTrailers.filter(t => t.status === 'available').length,
        inUseTrailers: mockTrailers.filter(t => t.status === 'in_use').length,
        maintenanceTrailers: mockTrailers.filter(t => t.status === 'maintenance').length,
        inspectionsDue: mockTrailers.filter(t => {
          if (!t.nextInspectionDue) return false;
          const dueDate = new Date(t.nextInspectionDue);
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          return dueDate <= thirtyDaysFromNow;
        }).length,
        registrationExpiring: mockTrailers.filter(t => {
          const expDate = new Date(t.registrationExpires);
          const sixtyDaysFromNow = new Date();
          sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
          return expDate <= sixtyDaysFromNow;
        }).length,
      };

      setTrailers(mockTrailers);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading trailers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTrailers = () => {
    let filtered = trailers;

    if (searchTerm) {
      filtered = filtered.filter(
        trailer =>
          trailer.trailerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trailer.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trailer.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trailer.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(trailer => trailer.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(trailer => trailer.type === typeFilter);
    }

    setFilteredTrailers(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_use':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'out_of_service':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'dry_van':
        return 'Dry Van';
      case 'refrigerated':
        return 'Refrigerated';
      case 'flatbed':
        return 'Flatbed';
      case 'tanker':
        return 'Tanker';
      case 'container':
        return 'Container';
      default:
        return type;
    }
  };

  const isInspectionDue = (dueDate?: string) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return due <= thirtyDaysFromNow;
  };

  const isRegistrationExpiring = (expDate: string) => {
    const exp = new Date(expDate);
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    return exp <= sixtyDaysFromNow;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Trailers</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage trailer fleet and track utilization
          </p>
        </div>
        <Link href="/trailers/new">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Trailer
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Available Trailers
                </p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">
                  {stats.availableTrailers}
                </h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <TruckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Use</p>
                <h3 className="text-2xl font-bold mt-1 text-blue-600">{stats.inUseTrailers}</h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Inspections Due
                </p>
                <h3 className="text-2xl font-bold mt-1 text-yellow-600">{stats.inspectionsDue}</h3>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Registration Expiring
                </p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">
                  {stats.registrationExpiring}
                </h3>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search trailers..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in_use">In Use</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out_of_service">Out of Service</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="dry_van">Dry Van</SelectItem>
                <SelectItem value="refrigerated">Refrigerated</SelectItem>
                <SelectItem value="flatbed">Flatbed</SelectItem>
                <SelectItem value="tanker">Tanker</SelectItem>
                <SelectItem value="container">Container</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trailers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TruckIcon className="h-5 w-5 mr-2" />
            Trailers ({filteredTrailers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trailer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Inspections</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrailers.map(trailer => (
                  <TableRow key={trailer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{trailer.trailerNumber}</div>
                        <div className="text-sm text-gray-500">
                          {trailer.year} {trailer.make} {trailer.model}
                        </div>
                        <div className="text-xs text-gray-400">VIN: {trailer.vin.slice(-8)}</div>
                        {trailer.telematicsDeviceId && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <SignalIcon className="h-3 w-3" />
                            Telematics
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(trailer.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={getStatusColor(trailer.status)}>
                          {trailer.status.replace('_', ' ')}
                        </Badge>
                        {trailer.assignedLoad && (
                          <div className="text-xs text-blue-600">Load: {trailer.assignedLoad}</div>
                        )}
                        {trailer.assignedDriver && (
                          <div className="text-xs text-gray-500">
                            Driver: {trailer.assignedDriver}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {trailer.currentLocation ? (
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{trailer.currentLocation.address}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{trailer.capacityWeight.toLocaleString()} lbs</div>
                        {trailer.capacityVolume > 0 && (
                          <div className="text-gray-500">{trailer.capacityVolume} ft³</div>
                        )}
                        <div className="text-xs text-gray-400">
                          {trailer.dimensions.length}' × {trailer.dimensions.width}' ×{' '}
                          {trailer.dimensions.height}'
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {trailer.lastInspectionDate && (
                          <div>
                            Last: {new Date(trailer.lastInspectionDate).toLocaleDateString()}
                          </div>
                        )}
                        {trailer.nextInspectionDue && (
                          <div
                            className={
                              isInspectionDue(trailer.nextInspectionDue)
                                ? 'text-red-600'
                                : 'text-gray-500'
                            }
                          >
                            Due: {new Date(trailer.nextInspectionDue).toLocaleDateString()}
                          </div>
                        )}
                        {isInspectionDue(trailer.nextInspectionDue) && (
                          <Badge className="bg-red-100 text-red-800 text-xs">Overdue</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{trailer.registrationState}</div>
                        <div
                          className={
                            isRegistrationExpiring(trailer.registrationExpires)
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }
                        >
                          Exp: {new Date(trailer.registrationExpires).toLocaleDateString()}
                        </div>
                        {isRegistrationExpiring(trailer.registrationExpires) && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Expiring</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/trailers/${trailer.id}`}>
                          <Button size="sm" variant="outline">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/trailers/${trailer.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        {trailer.status === 'maintenance' && (
                          <Button size="sm" variant="outline">
                            <WrenchScrewdriverIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTrailers.length === 0 && (
            <div className="text-center py-8">
              <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No trailers found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by adding your first trailer.'}
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <Link href="/trailers/new">
                  <Button className="mt-4">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Trailer
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
