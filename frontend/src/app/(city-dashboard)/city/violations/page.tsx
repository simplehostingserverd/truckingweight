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
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PlusIcon,
  TruckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
const CityViolationsPageClient = () => {
  const [violations, setViolations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Fetch violations data
  const fetchViolations = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Safely access localStorage only on the client side
      if (typeof window === 'undefined') return;

      const cityToken = localStorage.getItem('cityToken');

      if (!cityToken) {
        throw new Error('No authentication token found');
      }

      // Fetch violations
      const response = await fetch('/api/city-violations', {
        headers: {
          Authorization: `Bearer ${cityToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch violations');
      }

      const data = await response.json();
      setViolations(data.violations || []);
    } catch (err) {
      console.error('Error fetching violations:', err);
      setError(err.message || 'Failed to load violations');
      // Generate dummy data for testing
      generateDummyData();
    } finally {
      setIsLoading(false);
    }
  };

  // Generate dummy data for testing
  const generateDummyData = () => {
    const dummyViolations = [
      {
        id: 1,
        violationNumber: 'V-2023-001',
        companyName: 'Heavy Haulers Inc.',
        vehicleInfo: 'Peterbilt 389 - TX12345',
        violationType: 'overweight',
        violationDate: '2023-11-05',
        location: '123 Main St',
        weight: 105000,
        permittedWeight: 95000,
        overageAmount: 10000,
        fineAmount: 500.0,
        paymentStatus: 'Paid',
        status: 'Closed',
        notes: 'Driver acknowledged violation and paid fine on site.',
        createdAt: '2023-11-05T10:30:00Z',
      },
      {
        id: 2,
        violationNumber: 'V-2023-002',
        companyName: 'Wide Load Transport',
        vehicleInfo: 'Kenworth T800 - TX54321',
        violationType: 'oversize',
        violationDate: '2023-11-08',
        location: '456 Highway 10',
        dimensions: {
          width: 14,
          permittedWidth: 12,
          overageAmount: 2,
        },
        fineAmount: 350.0,
        paymentStatus: 'Pending',
        status: 'Open',
        notes: 'Citation issued, awaiting payment.',
        createdAt: '2023-11-08T14:15:00Z',
      },
      {
        id: 3,
        violationNumber: 'V-2023-003',
        companyName: 'Construction Materials Co.',
        vehicleInfo: 'Mack Granite - TX98765',
        violationType: 'no_permit',
        violationDate: '2023-11-10',
        location: '789 Center Ave',
        weight: 88000,
        fineAmount: 750.0,
        paymentStatus: 'Pending',
        status: 'Open',
        notes: 'Vehicle had no valid permit for weight. Driver claimed unaware of requirements.',
        createdAt: '2023-11-10T09:45:00Z',
      },
      {
        id: 4,
        violationNumber: 'V-2023-004',
        companyName: 'Mega Movers LLC',
        vehicleInfo: 'Freightliner Cascadia - TX24680',
        violationType: 'both',
        violationDate: '2023-10-20',
        location: 'Industrial Park Scale',
        weight: 110000,
        permittedWeight: 105000,
        overageAmount: 5000,
        dimensions: {
          height: 16,
          permittedHeight: 15,
          overageAmount: 1,
        },
        fineAmount: 850.0,
        paymentStatus: 'Paid',
        status: 'Closed',
        notes: 'Multiple violations. Company representative came to pay fine.',
        createdAt: '2023-10-20T11:20:00Z',
      },
      {
        id: 5,
        violationNumber: 'V-2023-005',
        companyName: 'Texas Wind Turbines',
        vehicleInfo: 'Volvo VNL - TX13579',
        violationType: 'expired_permit',
        violationDate: '2023-11-16',
        location: 'Highway 10 Scale',
        dimensions: {
          length: 110,
          width: 16,
          height: 16,
        },
        fineAmount: 400.0,
        paymentStatus: 'Disputed',
        status: 'Under Review',
        notes: "Company claims they filed for renewal but hasn't been processed yet.",
        createdAt: '2023-11-16T16:30:00Z',
      },
    ];
    setViolations(dummyViolations);
  };

  // Load violations on component mount
  useEffect(() => {
    fetchViolations();
  }, []);

  // Filter violations based on search query and filters
  const filteredViolations = violations.filter(violation => {
    const matchesSearch =
      searchQuery === '' ||
      violation.violationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      violation.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      violation.vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || violation.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesType =
      typeFilter === 'all' || violation.violationType.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get counts for tabs
  const openViolationsCount = violations.filter(violation => violation.status === 'Open').length;
  const closedViolationsCount = violations.filter(
    violation => violation.status === 'Closed'
  ).length;
  const reviewViolationsCount = violations.filter(
    violation => violation.status === 'Under Review'
  ).length;

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Violations</h1>
            <p className="text-gray-400">Track and manage commercial vehicle violations</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchViolations} disabled={isLoading}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </Button>
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Record Violation
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
              placeholder="Search by violation #, company, or vehicle..."
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="under review">Under Review</SelectItem>
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
                <SelectItem value="no_permit">No Permit</SelectItem>
                <SelectItem value="expired_permit">Expired Permit</SelectItem>
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
            <TabsTrigger value="all">All ({violations.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({openViolationsCount})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({closedViolationsCount})</TabsTrigger>
            <TabsTrigger value="review">Under Review ({reviewViolationsCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <ViolationsTable violations={filteredViolations} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="open" className="space-y-6">
            <ViolationsTable
              violations={violations.filter(violation => violation.status === 'Open')}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="closed" className="space-y-6">
            <ViolationsTable
              violations={violations.filter(violation => violation.status === 'Closed')}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <ViolationsTable
              violations={violations.filter(violation => violation.status === 'Under Review')}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

// Violations table component
const ViolationsTable = ({ violations, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full bg-gray-700" />
        ))}
      </div>
    );
  }

  if (violations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No violations found matching the current filters.</p>
      </div>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-800">
              <TableHead className="text-gray-400">Violation #</TableHead>
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Company</TableHead>
              <TableHead className="text-gray-400">Vehicle</TableHead>
              <TableHead className="text-gray-400">Type</TableHead>
              <TableHead className="text-gray-400">Location</TableHead>
              <TableHead className="text-gray-400">Fine</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {violations.map(violation => (
              <TableRow key={violation.id} className="border-gray-700 hover:bg-gray-700">
                <TableCell className="font-medium text-white">
                  {violation.violationNumber}
                </TableCell>
                <TableCell className="text-gray-300">
                  {new Date(violation.violationDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-gray-300">{violation.companyName}</TableCell>
                <TableCell className="text-gray-300">
                  <div className="flex items-center">
                    <TruckIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {violation.vehicleInfo}
                  </div>
                </TableCell>
                <TableCell className="text-gray-300">
                  {violation.violationType === 'overweight'
                    ? 'Overweight'
                    : violation.violationType === 'oversize'
                      ? 'Oversize'
                      : violation.violationType === 'both'
                        ? 'Both'
                        : violation.violationType === 'no_permit'
                          ? 'No Permit'
                          : 'Expired Permit'}
                </TableCell>
                <TableCell className="text-gray-300">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {violation.location}
                  </div>
                </TableCell>
                <TableCell className="text-gray-300">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />$
                    {violation.fineAmount.toFixed(2)}
                    <PaymentStatusBadge status={violation.paymentStatus} />
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={violation.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <DocumentTextIcon className="h-4 w-4" />
                      <span className="sr-only">Print</span>
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
    case 'Open':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30">
          <ClockIcon className="h-3.5 w-3.5 mr-1" />
          Open
        </Badge>
      );
    case 'Closed':
      return (
        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 border-green-500/30">
          <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
          Closed
        </Badge>
      );
    case 'Under Review':
      return (
        <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/20 border-blue-500/30">
          <DocumentTextIcon className="h-3.5 w-3.5 mr-1" />
          Under Review
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
      <Badge className="ml-2 bg-green-500/20 text-green-400 hover:bg-green-500/20 border-green-500/30">
        Paid
      </Badge>
    );
  } else if (status === 'Pending') {
    return (
      <Badge className="ml-2 bg-orange-500/20 text-orange-400 hover:bg-orange-500/20 border-orange-500/30">
        Pending
      </Badge>
    );
  } else if (status === 'Disputed') {
    return (
      <Badge className="ml-2 bg-red-500/20 text-red-400 hover:bg-red-500/20 border-red-500/30">
        Disputed
      </Badge>
    );
  }
  return null;
};

// Use dynamic import with SSR disabled to avoid hydration issues
const CityViolationsPage = dynamic(() => Promise.resolve(CityViolationsPageClient), {
  ssr: false,
});

export default function Page() {
  return <CityViolationsPage />;
}
