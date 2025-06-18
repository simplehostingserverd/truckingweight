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
import { Cog6ToothIcon, MagnifyingGlassIcon, ShoppingCartIcon, CurrencyDollarIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, Button, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import Link from 'next/link';

interface Part {
  id: number;
  partNumber: string;
  description: string;
  manufacturer: string;
  category: string;
  unitCost: number;
  quantityOnHand: number;
  minimumStockLevel: number;
  vendor: string;
  location?: string;
  lastOrderDate?: string;
  averageUsage?: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
}

interface InventoryStats {
  totalParts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categoriesCount: number;
  averageTurnover: number;
}

export default function PartsInventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalParts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    categoriesCount: 0,
    averageTurnover: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadPartsInventory();
  }, []);

  useEffect(() => {
    filterParts();
  }, [parts, searchTerm, categoryFilter, statusFilter]);

  const loadPartsInventory = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockParts: Part[] = [
        {
          id: 1,
          partNumber: 'BP-001',
          description: 'Brake Pads - Heavy Duty',
          manufacturer: 'Bendix',
          category: 'Brakes',
          unitCost: 125.5,
          quantityOnHand: 24,
          minimumStockLevel: 10,
          vendor: 'Brake Masters',
          location: 'A-1-3',
          lastOrderDate: '2025-01-10',
          averageUsage: 8,
          status: 'in_stock',
        },
        {
          id: 2,
          partNumber: 'OF-002',
          description: 'Oil Filter - Synthetic',
          manufacturer: 'Fram',
          category: 'Engine',
          unitCost: 18.75,
          quantityOnHand: 5,
          minimumStockLevel: 15,
          vendor: 'Quick Lube Pro',
          location: 'B-2-1',
          lastOrderDate: '2025-01-05',
          averageUsage: 12,
          status: 'low_stock',
        },
        {
          id: 3,
          partNumber: 'TR-003',
          description: 'Tire - 295/75R22.5',
          manufacturer: 'Michelin',
          category: 'Tires',
          unitCost: 485.0,
          quantityOnHand: 0,
          minimumStockLevel: 8,
          vendor: 'Tire Depot',
          location: 'C-1-1',
          lastOrderDate: '2024-12-20',
          averageUsage: 4,
          status: 'out_of_stock',
        },
        {
          id: 4,
          partNumber: 'AL-004',
          description: 'Alternator - 12V 150A',
          manufacturer: 'Delco',
          category: 'Electrical',
          unitCost: 275.0,
          quantityOnHand: 6,
          minimumStockLevel: 3,
          vendor: 'Electrical Repair Shop',
          location: 'D-3-2',
          lastOrderDate: '2025-01-08',
          averageUsage: 2,
          status: 'in_stock',
        },
        {
          id: 5,
          partNumber: 'CS-005',
          description: 'Coolant System Thermostat',
          manufacturer: 'Gates',
          category: 'Cooling',
          unitCost: 45.25,
          quantityOnHand: 12,
          minimumStockLevel: 5,
          vendor: 'Engine Repair Specialists',
          location: 'E-1-4',
          lastOrderDate: '2025-01-12',
          averageUsage: 3,
          status: 'in_stock',
        },
        {
          id: 6,
          partNumber: 'HY-006',
          description: 'Hydraulic Hose - 1/2" x 36"',
          manufacturer: 'Parker',
          category: 'Hydraulics',
          unitCost: 32.5,
          quantityOnHand: 3,
          minimumStockLevel: 8,
          vendor: 'Hydraulic Supply Co',
          location: 'F-2-3',
          lastOrderDate: '2024-12-28',
          averageUsage: 6,
          status: 'low_stock',
        },
      ];

      const mockStats: InventoryStats = {
        totalParts: mockParts.length,
        totalValue: mockParts.reduce((sum, part) => sum + part.unitCost * part.quantityOnHand, 0),
        lowStockItems: mockParts.filter(part => part.status === 'low_stock').length,
        outOfStockItems: mockParts.filter(part => part.status === 'out_of_stock').length,
        categoriesCount: new Set(mockParts.map(part => part.category)).size,
        averageTurnover: 4.2,
      };

      setParts(mockParts);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading parts inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterParts = () => {
    let filtered = parts;

    if (searchTerm) {
      filtered = filtered.filter(
        part =>
          part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(part => part.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(part => part.status === statusFilter);
    }

    setFilteredParts(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'discontinued':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'low_stock':
      case 'out_of_stock':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStockLevel = (part: Part) => {
    if (part.quantityOnHand === 0) return 'Out of Stock';
    if (part.quantityOnHand <= part.minimumStockLevel) return 'Low Stock';
    return 'In Stock';
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Parts Inventory</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage parts inventory and track stock levels
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/parts/order">
            <Button variant="outline">
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Order Parts
            </Button>
          </Link>
          <Link href="/parts/new">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Part
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Inventory Value
                </p>
                <h3 className="text-2xl font-bold mt-1">${stats.totalValue.toLocaleString()}</h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Low Stock Items
                </p>
                <h3 className="text-2xl font-bold mt-1 text-yellow-600">{stats.lowStockItems}</h3>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Out of Stock</p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.outOfStockItems}</h3>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Parts</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalParts}</h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <Cog6ToothIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                placeholder="Search parts..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Brakes">Brakes</SelectItem>
                <SelectItem value="Engine">Engine</SelectItem>
                <SelectItem value="Tires">Tires</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Cooling">Cooling</SelectItem>
                <SelectItem value="Hydraulics">Hydraulics</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Parts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Parts Inventory ({filteredParts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.map(part => (
                  <TableRow key={part.id}>
                    <TableCell>
                      <div className="font-medium">{part.partNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium">{part.description}</div>
                        <div className="text-sm text-gray-500">Vendor: {part.vendor}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{part.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{part.manufacturer}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(part.status)}
                        <div>
                          <div className="font-medium">
                            {part.quantityOnHand} / {part.minimumStockLevel}
                          </div>
                          <Badge className={getStatusColor(part.status)}>
                            {getStockLevel(part)}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${part.unitCost.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${(part.unitCost * part.quantityOnHand).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{part.location || 'Not assigned'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/parts/${part.id}`}>
                          <Button size="sm" variant="outline">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/parts/${part.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        {(part.status === 'low_stock' || part.status === 'out_of_stock') && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <ShoppingCartIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredParts.length === 0 && (
            <div className="text-center py-8">
              <Cog6ToothIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No parts found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by adding your first part to inventory.'}
              </p>
              {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                <Link href="/parts/new">
                  <Button className="mt-4">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Part
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
