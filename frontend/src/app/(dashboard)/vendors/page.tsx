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
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  EyeIcon,
  PencilIcon,
  CurrencyDollarIcon,
  ClockIcon,
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

interface Vendor {
  id: number;
  name: string;
  type: string;
  contactName: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentTerms: number;
  preferred: boolean;
  rating: number;
  totalSpent: number;
  lastOrderDate?: string;
  activeContracts: number;
  notes?: string;
  status: 'active' | 'inactive' | 'pending';
}

interface VendorStats {
  totalVendors: number;
  preferredVendors: number;
  totalSpent: number;
  averageRating: number;
  activeContracts: number;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<VendorStats>({
    totalVendors: 0,
    preferredVendors: 0,
    totalSpent: 0,
    averageRating: 0,
    activeContracts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, typeFilter, statusFilter]);

  const loadVendors = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockVendors: Vendor[] = [
        {
          id: 1,
          name: 'Brake Masters',
          type: 'maintenance',
          contactName: 'Mike Johnson',
          email: 'mike@brakemasters.com',
          phone: '(555) 123-4567',
          address: {
            line1: '123 Industrial Blvd',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62701',
          },
          paymentTerms: 30,
          preferred: true,
          rating: 5,
          totalSpent: 45750.0,
          lastOrderDate: '2025-01-15',
          activeContracts: 2,
          status: 'active',
        },
        {
          id: 2,
          name: 'Quick Lube Pro',
          type: 'maintenance',
          contactName: 'Sarah Wilson',
          email: 'sarah@quicklubepro.com',
          phone: '(555) 234-5678',
          address: {
            line1: '456 Service Road',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62702',
          },
          paymentTerms: 15,
          preferred: true,
          rating: 4,
          totalSpent: 12350.0,
          lastOrderDate: '2025-01-12',
          activeContracts: 1,
          status: 'active',
        },
        {
          id: 3,
          name: 'Tire Depot',
          type: 'parts',
          contactName: 'Tom Rodriguez',
          email: 'tom@tiredepot.com',
          phone: '(555) 345-6789',
          address: {
            line1: '789 Highway 55',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62703',
          },
          paymentTerms: 30,
          preferred: false,
          rating: 3,
          totalSpent: 28900.0,
          lastOrderDate: '2024-12-20',
          activeContracts: 0,
          status: 'active',
        },
        {
          id: 4,
          name: 'Engine Repair Specialists',
          type: 'maintenance',
          contactName: 'Lisa Chen',
          email: 'lisa@enginerepair.com',
          phone: '(555) 456-7890',
          address: {
            line1: '321 Mechanic Street',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62704',
          },
          paymentTerms: 30,
          preferred: true,
          rating: 5,
          totalSpent: 67200.0,
          lastOrderDate: '2025-01-10',
          activeContracts: 3,
          status: 'active',
        },
        {
          id: 5,
          name: 'Electrical Repair Shop',
          type: 'maintenance',
          contactName: 'David Brown',
          email: 'david@electricalrepair.com',
          phone: '(555) 567-8901',
          address: {
            line1: '654 Electric Ave',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62705',
          },
          paymentTerms: 30,
          preferred: false,
          rating: 4,
          totalSpent: 15600.0,
          lastOrderDate: '2025-01-08',
          activeContracts: 1,
          status: 'active',
        },
        {
          id: 6,
          name: 'DOT Inspection Center',
          type: 'inspection',
          contactName: 'Jennifer Davis',
          email: 'jennifer@dotinspection.com',
          phone: '(555) 678-9012',
          address: {
            line1: '987 Compliance Road',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62706',
          },
          paymentTerms: 15,
          preferred: true,
          rating: 5,
          totalSpent: 8750.0,
          lastOrderDate: '2025-01-05',
          activeContracts: 1,
          status: 'active',
        },
      ];

      const mockStats: VendorStats = {
        totalVendors: mockVendors.length,
        preferredVendors: mockVendors.filter(vendor => vendor.preferred).length,
        totalSpent: mockVendors.reduce((sum, vendor) => sum + vendor.totalSpent, 0),
        averageRating:
          mockVendors.reduce((sum, vendor) => sum + vendor.rating, 0) / mockVendors.length,
        activeContracts: mockVendors.reduce((sum, vendor) => sum + vendor.activeContracts, 0),
      };

      setVendors(mockVendors);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    if (searchTerm) {
      filtered = filtered.filter(
        vendor =>
          vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.status === statusFilter);
    }

    setFilteredVendors(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'parts':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'inspection':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'fuel':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-500">({rating})</span>
      </div>
    );
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Vendor Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage service providers and supplier relationships
          </p>
        </div>
        <Link href="/vendors/new">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Vendor
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Vendors
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalVendors}</h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Preferred Vendors
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.preferredVendors}</h3>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full flex-shrink-0">
                <StarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</p>
                <h3 className="text-2xl font-bold mt-1">${stats.totalSpent.toLocaleString()}</h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Rating</p>
                <h3 className="text-2xl font-bold mt-1">{stats.averageRating.toFixed(1)}</h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <StarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Contracts
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeContracts}</h3>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
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
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="parts">Parts</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="fuel">Fuel</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BuildingOfficeIcon className="h-5 w-5 mr-2" />
            Vendors ({filteredVendors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map(vendor => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{vendor.name}</div>
                            {vendor.preferred && (
                              <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPinIcon className="h-3 w-3" />
                            {vendor.address.city}, {vendor.address.state}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(vendor.type)}>{vendor.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vendor.contactName}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <PhoneIcon className="h-3 w-3" />
                          {vendor.phone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <EnvelopeIcon className="h-3 w-3" />
                          {vendor.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{renderStars(vendor.rating)}</TableCell>
                    <TableCell>
                      <div className="font-medium">${vendor.totalSpent.toLocaleString()}</div>
                      {vendor.lastOrderDate && (
                        <div className="text-sm text-gray-500">
                          Last: {new Date(vendor.lastOrderDate).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{vendor.paymentTerms} days</div>
                        {vendor.activeContracts > 0 && (
                          <div className="text-green-600">
                            {vendor.activeContracts} contract{vendor.activeContracts > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(vendor.status)}>{vendor.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/vendors/${vendor.id}`}>
                          <Button size="sm" variant="outline">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/vendors/${vendor.id}/edit`}>
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

          {filteredVendors.length === 0 && (
            <div className="text-center py-8">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No vendors found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by adding your first vendor.'}
              </p>
              {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
                <Link href="/vendors/new">
                  <Button className="mt-4">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Vendor
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
