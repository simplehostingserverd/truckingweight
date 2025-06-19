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
  CurrencyDollarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Badge,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Equipment {
  id: number;
  name: string;
  type: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpires?: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  assignedToVehicle?: {
    id: number;
    name: string;
  };
  assignedToTrailer?: {
    id: number;
    name: string;
  };
  purchasePrice?: number;
  currentValue?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDue?: string;
}

interface EquipmentStats {
  totalEquipment: number;
  availableEquipment: number;
  assignedEquipment: number;
  maintenanceEquipment: number;
  totalValue: number;
  warrantyExpiring: number;
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<EquipmentStats>({
    totalEquipment: 0,
    availableEquipment: 0,
    assignedEquipment: 0,
    maintenanceEquipment: 0,
    totalValue: 0,
    warrantyExpiring: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadEquipment();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [equipment, searchTerm, statusFilter, typeFilter]);

  const loadEquipment = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockEquipment: Equipment[] = [
        {
          id: 1,
          name: 'Reefer Unit - Carrier X4',
          type: 'reefer_unit',
          serialNumber: 'CRR-X4-001',
          manufacturer: 'Carrier',
          model: 'X4 7300',
          purchaseDate: '2023-03-15',
          warrantyExpires: '2026-03-15',
          status: 'assigned',
          assignedToTrailer: { id: 2, name: 'TRL-002' },
          purchasePrice: 28500.0,
          currentValue: 24000.0,
          lastMaintenanceDate: '2024-12-10',
          nextMaintenanceDue: '2025-06-10',
        },
        {
          id: 2,
          name: 'Hydraulic Lift Gate',
          type: 'lift_gate',
          serialNumber: 'HLG-2024-001',
          manufacturer: 'Waltco',
          model: 'FXDM 44',
          purchaseDate: '2024-01-20',
          warrantyExpires: '2027-01-20',
          status: 'assigned',
          assignedToVehicle: { id: 1, name: 'Freightliner #001' },
          purchasePrice: 8500.0,
          currentValue: 7800.0,
          lastMaintenanceDate: '2024-11-15',
          nextMaintenanceDue: '2025-05-15',
        },
        {
          id: 3,
          name: 'Load Securing Straps (Set)',
          type: 'straps',
          serialNumber: 'LSS-2023-015',
          manufacturer: 'Kinedyne',
          model: 'Heavy Duty 4" x 30\'',
          purchaseDate: '2023-08-10',
          status: 'available',
          purchasePrice: 450.0,
          currentValue: 350.0,
        },
        {
          id: 4,
          name: 'Tire Chains (Set)',
          type: 'chains',
          serialNumber: 'TC-2022-008',
          manufacturer: 'Pewag',
          model: 'Servo SUV',
          purchaseDate: '2022-11-05',
          status: 'assigned',
          assignedToVehicle: { id: 3, name: 'Kenworth #003' },
          purchasePrice: 850.0,
          currentValue: 600.0,
        },
        {
          id: 5,
          name: 'Heavy Duty Tarp System',
          type: 'tarps',
          serialNumber: 'HDT-2024-003',
          manufacturer: 'Shur-Co',
          model: 'Roll Rite',
          purchaseDate: '2024-02-28',
          warrantyExpires: '2026-02-28',
          status: 'assigned',
          assignedToTrailer: { id: 3, name: 'TRL-003' },
          purchasePrice: 3200.0,
          currentValue: 2900.0,
          lastMaintenanceDate: '2024-12-01',
          nextMaintenanceDue: '2025-06-01',
        },
        {
          id: 6,
          name: 'GPS Tracking Device',
          type: 'gps_tracker',
          serialNumber: 'GPS-2023-012',
          manufacturer: 'Geotab',
          model: 'GO9',
          purchaseDate: '2023-06-12',
          warrantyExpires: '2025-06-12',
          status: 'maintenance',
          purchasePrice: 350.0,
          currentValue: 250.0,
        },
      ];

      const mockStats: EquipmentStats = {
        totalEquipment: mockEquipment.length,
        availableEquipment: mockEquipment.filter(e => e.status === 'available').length,
        assignedEquipment: mockEquipment.filter(e => e.status === 'assigned').length,
        maintenanceEquipment: mockEquipment.filter(e => e.status === 'maintenance').length,
        totalValue: mockEquipment.reduce((sum, e) => sum + (e.currentValue || 0), 0),
        warrantyExpiring: mockEquipment.filter(e => {
          if (!e.warrantyExpires) return false;
          const expDate = new Date(e.warrantyExpires);
          const sixtyDaysFromNow = new Date();
          sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
          return expDate <= sixtyDaysFromNow;
        }).length,
      };

      setEquipment(mockEquipment);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEquipment = () => {
    let filtered = equipment;

    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.serialNumber &&
            item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.manufacturer && item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    setFilteredEquipment(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'retired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'reefer_unit':
        return 'Reefer Unit';
      case 'lift_gate':
        return 'Lift Gate';
      case 'straps':
        return 'Straps';
      case 'chains':
        return 'Chains';
      case 'tarps':
        return 'Tarps';
      case 'gps_tracker':
        return 'GPS Tracker';
      default:
        return type.replace('_', ' ');
    }
  };

  const isWarrantyExpiring = (expDate?: string) => {
    if (!expDate) return false;
    const exp = new Date(expDate);
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    return exp <= sixtyDaysFromNow;
  };

  const isMaintenanceDue = (dueDate?: string) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return due <= thirtyDaysFromNow;
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Equipment</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage fleet equipment and accessories
          </p>
        </div>
        <Link href="/equipment/new">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Equipment
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
                  Total Equipment
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalEquipment}</h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available</p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">
                  {stats.availableEquipment}
                </h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <WrenchScrewdriverIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
                <h3 className="text-2xl font-bold mt-1">${stats.totalValue.toLocaleString()}</h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Warranty Expiring
                </p>
                <h3 className="text-2xl font-bold mt-1 text-yellow-600">
                  {stats.warrantyExpiring}
                </h3>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
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
                placeholder="Search equipment..."
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
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="reefer_unit">Reefer Unit</SelectItem>
                <SelectItem value="lift_gate">Lift Gate</SelectItem>
                <SelectItem value="straps">Straps</SelectItem>
                <SelectItem value="chains">Chains</SelectItem>
                <SelectItem value="tarps">Tarps</SelectItem>
                <SelectItem value="gps_tracker">GPS Tracker</SelectItem>
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

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
            Equipment ({filteredEquipment.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Warranty</TableHead>
                  <TableHead>Maintenance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.manufacturer && item.model && (
                          <div className="text-sm text-gray-500">
                            {item.manufacturer} {item.model}
                          </div>
                        )}
                        {item.serialNumber && (
                          <div className="text-xs text-gray-400">S/N: {item.serialNumber}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(item.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.assignedToVehicle ? (
                        <div className="flex items-center gap-1">
                          <TruckIcon className="h-3 w-3 text-blue-500" />
                          <Link
                            href={`/vehicles/${item.assignedToVehicle.id}`}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {item.assignedToVehicle.name}
                          </Link>
                        </div>
                      ) : item.assignedToTrailer ? (
                        <div className="flex items-center gap-1">
                          <TruckIcon className="h-3 w-3 text-green-500" />
                          <Link
                            href={`/trailers/${item.assignedToTrailer.id}`}
                            className="text-green-600 hover:underline text-sm"
                          >
                            {item.assignedToTrailer.name}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {item.currentValue && (
                          <div className="font-medium">${item.currentValue.toLocaleString()}</div>
                        )}
                        {item.purchasePrice && (
                          <div className="text-gray-500">
                            Orig: ${item.purchasePrice.toLocaleString()}
                          </div>
                        )}
                        {item.purchaseDate && (
                          <div className="text-xs text-gray-400">
                            {new Date(item.purchaseDate).getFullYear()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.warrantyExpires ? (
                        <div className="text-sm">
                          <div
                            className={
                              isWarrantyExpiring(item.warrantyExpires)
                                ? 'text-red-600'
                                : 'text-gray-500'
                            }
                          >
                            {new Date(item.warrantyExpires).toLocaleDateString()}
                          </div>
                          {isWarrantyExpiring(item.warrantyExpires) && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              Expiring
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No warranty</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.nextMaintenanceDue ? (
                        <div className="text-sm">
                          {item.lastMaintenanceDate && (
                            <div className="text-gray-500">
                              Last: {new Date(item.lastMaintenanceDate).toLocaleDateString()}
                            </div>
                          )}
                          <div
                            className={
                              isMaintenanceDue(item.nextMaintenanceDue)
                                ? 'text-red-600'
                                : 'text-gray-500'
                            }
                          >
                            Due: {new Date(item.nextMaintenanceDue).toLocaleDateString()}
                          </div>
                          {isMaintenanceDue(item.nextMaintenanceDue) && (
                            <Badge className="bg-red-100 text-red-800 text-xs">Due</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No schedule</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/equipment/${item.id}`}>
                          <Button size="sm" variant="outline">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/equipment/${item.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEquipment.length === 0 && (
            <div className="text-center py-8">
              <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No equipment found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by adding your first piece of equipment.'}
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <Link href="/equipment/new">
                  <Button className="mt-4">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Equipment
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
