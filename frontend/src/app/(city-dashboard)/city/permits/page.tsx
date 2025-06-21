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

import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowPathIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlusIcon,
  TruckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Create a client-side only component to avoid hydration issues
const CityPermitsPageClient = () => {
  const [permits, setPermits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Fetch permits data
  const fetchPermits = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Safely access localStorage only on the client side
      if (typeof window === 'undefined') return;

      const cityToken = localStorage.getItem('cityToken');

      if (!cityToken) {
        throw new Error('No authentication token found');
      }

      // Fetch permits
      const response = await fetch('/api/city-permits', {
        headers: {
          Authorization: `Bearer ${cityToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch permits');
      }

      const data = await response.json();
      setPermits(data.permits || []);
    } catch (err: unknown) {
      console.error('Error fetching permits:', err);
      setError(err instanceof Error ? err.message : 'Failed to load permits');
      // Generate dummy data for testing
      generateDummyData();
    } finally {
      setIsLoading(false);
    }
  };

  // Generate dummy data for testing
  const generateDummyData = () => {
    const dummyPermits = [
      {
        id: 1,
        permitNumber: 'OW-2023-001',
        companyName: 'Heavy Haulers Inc.',
        vehicleInfo: 'Peterbilt 389 - TX12345',
        permitType: 'overweight',
        maxWeight: 95000,
        startDate: '2023-11-01',
        endDate: '2023-12-01',
        feeAmount: 250.0,
        paymentStatus: 'Paid',
        status: 'Active',
        createdAt: '2023-10-28T10:30:00Z',
      },
      {
        id: 2,
        permitNumber: 'OS-2023-002',
        companyName: 'Wide Load Transport',
        vehicleInfo: 'Kenworth T800 - TX54321',
        permitType: 'oversize',
        dimensions: {
          length: 75,
          width: 12,
          height: 14,
        },
        startDate: '2023-11-05',
        endDate: '2023-12-05',
        feeAmount: 300.0,
        paymentStatus: 'Paid',
        status: 'Active',
        createdAt: '2023-11-01T14:15:00Z',
      },
      {
        id: 3,
        permitNumber: 'OW-2023-003',
        companyName: 'Construction Materials Co.',
        vehicleInfo: 'Mack Granite - TX98765',
        permitType: 'overweight',
        maxWeight: 88000,
        startDate: '2023-11-10',
        endDate: '2023-12-10',
        feeAmount: 225.0,
        paymentStatus: 'Pending',
        status: 'Pending',
        createdAt: '2023-11-08T09:45:00Z',
      },
      {
        id: 4,
        permitNumber: 'OB-2023-004',
        companyName: 'Mega Movers LLC',
        vehicleInfo: 'Freightliner Cascadia - TX24680',
        permitType: 'both',
        maxWeight: 105000,
        dimensions: {
          length: 85,
          width: 14,
          height: 15,
        },
        startDate: '2023-10-15',
        endDate: '2023-11-15',
        feeAmount: 450.0,
        paymentStatus: 'Paid',
        status: 'Expired',
        createdAt: '2023-10-10T11:20:00Z',
      },
      {
        id: 5,
        permitNumber: 'OS-2023-005',
        companyName: 'Texas Wind Turbines',
        vehicleInfo: 'Volvo VNL - TX13579',
        permitType: 'oversize',
        dimensions: {
          length: 110,
          width: 16,
          height: 16,
        },
        startDate: '2023-11-20',
        endDate: '2023-12-20',
        feeAmount: 500.0,
        paymentStatus: 'Pending',
        status: 'Pending',
        createdAt: '2023-11-15T16:30:00Z',
      },
    ];
    setPermits(dummyPermits);
  };

  // Load permits on component mount
  useEffect(() => {
    fetchPermits();
  }, []);

  // Filter permits based on search query and filters
  const filteredPermits = permits.filter(permit => {
    const matchesSearch =
      searchQuery === '' ||
      permit.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permit.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permit.vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || permit.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesType =
      typeFilter === 'all' || permit.permitType.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get counts for tabs
  const activePermitsCount = permits.filter(permit => permit.status === 'Active').length;
  const pendingPermitsCount = permits.filter(permit => permit.status === 'Pending').length;
  const expiredPermitsCount = permits.filter(permit => permit.status === 'Expired').length;

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Permits</h1>
            <p className="text-gray-400">Manage overweight and oversize vehicle permits</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchPermits} disabled={isLoading}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </Button>
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Issue Permit
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="search" className="text-gray-400">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search by permit #, company, or vehicle..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="status-filter" className="text-gray-400">
              Status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="type-filter" className="text-gray-400">
              Type
            </Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger id="type-filter" className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="overweight">Overweight</SelectItem>
                <SelectItem value="oversize">Oversize</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
            <TabsTrigger value="all">All ({permits.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activePermitsCount})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingPermitsCount})</TabsTrigger>
            <TabsTrigger value="expired">Expired ({expiredPermitsCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <PermitsTable permits={filteredPermits} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <PermitsTable
              permits={permits.filter(permit => permit.status === 'Active')}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <PermitsTable
              permits={permits.filter(permit => permit.status === 'Pending')}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="expired" className="space-y-6">
            <PermitsTable
              permits={permits.filter(permit => permit.status === 'Expired')}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

// Permits table component
const PermitsTable = ({ permits, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full bg-gray-700" />
        ))}
      </div>
    );
  }

  if (permits.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No permits found matching the current filters.</p>
      </div>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-800">
              <TableHead className="text-gray-400">Permit #</TableHead>
              <TableHead className="text-gray-400">Company</TableHead>
              <TableHead className="text-gray-400">Vehicle</TableHead>
              <TableHead className="text-gray-400">Type</TableHead>
              <TableHead className="text-gray-400">Valid Period</TableHead>
              <TableHead className="text-gray-400">Fee</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permits.map(permit => (
              <TableRow key={permit.id} className="border-gray-700 hover:bg-gray-700">
                <TableCell className="font-medium text-white">{permit.permitNumber}</TableCell>
                <TableCell className="text-gray-300">{permit.companyName}</TableCell>
                <TableCell className="text-gray-300">
                  <div className="flex items-center">
                    <TruckIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {permit.vehicleInfo}
                  </div>
                </TableCell>
                <TableCell className="text-gray-300">
                  {permit.permitType === 'overweight'
                    ? 'Overweight'
                    : permit.permitType === 'oversize'
                      ? 'Oversize'
                      : 'Both'}
                </TableCell>
                <TableCell className="text-gray-300">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {new Date(permit.startDate).toLocaleDateString()} -{' '}
                    {new Date(permit.endDate).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-gray-300">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />$
                    {permit.feeAmount.toFixed(2)}
                    <PaymentStatusBadge status={permit.paymentStatus} />
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={permit.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      Print
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Active':
      return (
        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 border-green-500/30">
          <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
          Active
        </Badge>
      );
    case 'Pending':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30">
          <ClockIcon className="h-3.5 w-3.5 mr-1" />
          Pending
        </Badge>
      );
    case 'Expired':
      return (
        <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/20 border-gray-500/30">
          <XCircleIcon className="h-3.5 w-3.5 mr-1" />
          Expired
        </Badge>
      );
    case 'Revoked':
      return (
        <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/20 border-red-500/30">
          <XCircleIcon className="h-3.5 w-3.5 mr-1" />
          Revoked
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

// Payment status badge component
const PaymentStatusBadge = ({ status }) => {
  if (status === 'Paid') {
    return (
      <Badge className="ml-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/20 border-blue-500/30">
        Paid
      </Badge>
    );
  } else if (status === 'Pending') {
    return (
      <Badge className="ml-2 bg-orange-500/20 text-orange-400 hover:bg-orange-500/20 border-orange-500/30">
        Pending
      </Badge>
    );
  }
  return null;
};

// Use dynamic import with SSR disabled to avoid hydration issues
const CityPermitsPage = dynamic(() => Promise.resolve(CityPermitsPageClient), {
  ssr: false,
});

export default function Page() {
  return <CityPermitsPage />;
}
