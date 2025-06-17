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
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TruckIcon,
  StarIcon,
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

interface Customer {
  id: number;
  name: string;
  type: 'shipper' | 'broker' | 'consignee' | 'both';
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
  creditLimit?: number;
  currentBalance: number;
  totalRevenue: number;
  activeLoads: number;
  completedLoads: number;
  rating: number;
  preferred: boolean;
  mcNumber?: string;
  dotNumber?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLoadDate?: string;
  averageRate?: number;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  preferredCustomers: number;
  totalRevenue: number;
  averageRating: number;
  activeLoads: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    preferredCustomers: 0,
    totalRevenue: 0,
    averageRating: 0,
    activeLoads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, typeFilter, statusFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockCustomers: Customer[] = [
        {
          id: 1,
          name: 'ABC Logistics',
          type: 'shipper',
          contactName: 'John Smith',
          email: 'john@abclogistics.com',
          phone: '(555) 123-4567',
          address: {
            line1: '123 Industrial Blvd',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
          },
          paymentTerms: 30,
          creditLimit: 50000.0,
          currentBalance: 12500.0,
          totalRevenue: 285000.0,
          activeLoads: 3,
          completedLoads: 45,
          rating: 5,
          preferred: true,
          status: 'active',
          lastLoadDate: '2025-01-15',
          averageRate: 2.85,
        },
        {
          id: 2,
          name: 'XYZ Shipping',
          type: 'broker',
          contactName: 'Sarah Wilson',
          email: 'sarah@xyzshipping.com',
          phone: '(555) 234-5678',
          address: {
            line1: '456 Commerce St',
            city: 'Atlanta',
            state: 'GA',
            zipCode: '30309',
          },
          paymentTerms: 15,
          creditLimit: 75000.0,
          currentBalance: 8900.0,
          totalRevenue: 420000.0,
          activeLoads: 5,
          completedLoads: 78,
          rating: 4,
          preferred: true,
          mcNumber: 'MC-123456',
          dotNumber: 'DOT-789012',
          status: 'active',
          lastLoadDate: '2025-01-17',
          averageRate: 3.2,
        },
        {
          id: 3,
          name: 'Global Transport',
          type: 'shipper',
          contactName: 'Mike Johnson',
          email: 'mike@globaltransport.com',
          phone: '(555) 345-6789',
          address: {
            line1: '789 Freight Ave',
            city: 'Dallas',
            state: 'TX',
            zipCode: '75201',
          },
          paymentTerms: 30,
          creditLimit: 100000.0,
          currentBalance: 0,
          totalRevenue: 650000.0,
          activeLoads: 2,
          completedLoads: 92,
          rating: 5,
          preferred: true,
          status: 'active',
          lastLoadDate: '2025-01-16',
          averageRate: 3.45,
        },
        {
          id: 4,
          name: 'Freight Solutions',
          type: 'broker',
          contactName: 'Lisa Chen',
          email: 'lisa@freightsolutions.com',
          phone: '(555) 456-7890',
          address: {
            line1: '321 Logistics Ln',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
          },
          paymentTerms: 15,
          creditLimit: 60000.0,
          currentBalance: 15600.0,
          totalRevenue: 380000.0,
          activeLoads: 4,
          completedLoads: 56,
          rating: 3,
          preferred: false,
          mcNumber: 'MC-654321',
          dotNumber: 'DOT-210987',
          status: 'active',
          lastLoadDate: '2025-01-14',
          averageRate: 2.95,
        },
        {
          id: 5,
          name: 'Regional Carriers',
          type: 'consignee',
          contactName: 'Tom Rodriguez',
          email: 'tom@regionalcarriers.com',
          phone: '(555) 567-8901',
          address: {
            line1: '654 Distribution Dr',
            city: 'Phoenix',
            state: 'AZ',
            zipCode: '85001',
          },
          paymentTerms: 30,
          currentBalance: 0,
          totalRevenue: 125000.0,
          activeLoads: 1,
          completedLoads: 23,
          rating: 4,
          preferred: false,
          status: 'active',
          lastLoadDate: '2025-01-12',
          averageRate: 2.75,
        },
      ];

      const mockStats: CustomerStats = {
        totalCustomers: mockCustomers.length,
        activeCustomers: mockCustomers.filter(c => c.status === 'active').length,
        preferredCustomers: mockCustomers.filter(c => c.preferred).length,
        totalRevenue: mockCustomers.reduce((sum, c) => sum + c.totalRevenue, 0),
        averageRating: mockCustomers.reduce((sum, c) => sum + c.rating, 0) / mockCustomers.length,
        activeLoads: mockCustomers.reduce((sum, c) => sum + c.activeLoads, 0),
      };

      setCustomers(mockCustomers);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(
        customer =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(customer => customer.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    setFilteredCustomers(filtered);
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
      case 'shipper':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'broker':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'consignee':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'both':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Customers</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage customer relationships and track performance
          </p>
        </div>
        <Link href="/customers/new">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Customer
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
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold mt-1">${stats.totalRevenue.toLocaleString()}</h3>
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Customers
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeCustomers}</h3>
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Loads</p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeLoads}</h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <TruckIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full flex-shrink-0">
                <StarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
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
                placeholder="Search customers..."
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
                <SelectItem value="shipper">Shipper</SelectItem>
                <SelectItem value="broker">Broker</SelectItem>
                <SelectItem value="consignee">Consignee</SelectItem>
                <SelectItem value="both">Both</SelectItem>
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

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BuildingOfficeIcon className="h-5 w-5 mr-2" />
            Customers ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Loads</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{customer.name}</div>
                            {customer.preferred && (
                              <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPinIcon className="h-3 w-3" />
                            {customer.address.city}, {customer.address.state}
                          </div>
                          {(customer.mcNumber || customer.dotNumber) && (
                            <div className="text-xs text-gray-400">
                              {customer.mcNumber && `MC: ${customer.mcNumber}`}
                              {customer.mcNumber && customer.dotNumber && ' • '}
                              {customer.dotNumber && `DOT: ${customer.dotNumber}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(customer.type)}>{customer.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.contactName}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <PhoneIcon className="h-3 w-3" />
                          {customer.phone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <EnvelopeIcon className="h-3 w-3" />
                          {customer.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {renderStars(customer.rating)}
                        {customer.averageRate && (
                          <div className="text-sm text-gray-500 mt-1">
                            Avg: ${customer.averageRate.toFixed(2)}/mi
                          </div>
                        )}
                        {customer.lastLoadDate && (
                          <div className="text-xs text-gray-400">
                            Last: {new Date(customer.lastLoadDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">${customer.totalRevenue.toLocaleString()}</div>
                        {customer.currentBalance > 0 && (
                          <div className="text-sm text-red-600">
                            Balance: ${customer.currentBalance.toLocaleString()}
                          </div>
                        )}
                        {customer.creditLimit && (
                          <div className="text-xs text-gray-500">
                            Credit: ${customer.creditLimit.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.activeLoads} active</div>
                        <div className="text-sm text-gray-500">
                          {customer.completedLoads} completed
                        </div>
                        <div className="text-xs text-gray-400">
                          {customer.paymentTerms} day terms
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/customers/${customer.id}`}>
                          <Button size="sm" variant="outline">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/customers/${customer.id}/edit`}>
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

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No customers found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by adding your first customer.'}
              </p>
              {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
                <Link href="/customers/new">
                  <Button className="mt-4">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Customer
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
