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

import ErrorBoundary from '@/components/ErrorBoundary';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ScaleIcon,
  ArrowPathIcon,
  PlusIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
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
const CityScalesPageClient = () => {
  const [scales, setScales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Fetch scales data
  const fetchScales = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Safely access localStorage only on the client side
      if (typeof window === 'undefined') return;

      const cityToken = localStorage.getItem('cityToken');

      if (!cityToken) {
        throw new Error('No authentication token found');
      }

      // Fetch scales
      const response = await fetch('/api/city-scales', {
        headers: {
          Authorization: `Bearer ${cityToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scales');
      }

      const data = await response.json();
      setScales(data.scales || []);
    } catch (err) {
      console.error('Error fetching scales:', err);
      setError(err.message || 'Failed to load scales');
      // Generate dummy data for testing
      generateDummyData();
    } finally {
      setIsLoading(false);
    }
  };

  // Generate dummy data for testing
  const generateDummyData = () => {
    const dummyScales = [
      {
        id: 1,
        name: 'Main Street Scale',
        location: '123 Main St',
        scale_type: 'fixed',
        status: 'Active',
        max_capacity: 80000,
        precision: 50,
        calibration_date: '2023-10-15',
        next_calibration_date: '2024-04-15',
      },
      {
        id: 2,
        name: 'Highway 10 Scale',
        location: '456 Highway 10',
        scale_type: 'fixed',
        status: 'Maintenance',
        max_capacity: 100000,
        precision: 100,
        calibration_date: '2023-09-01',
        next_calibration_date: '2024-03-01',
      },
      {
        id: 3,
        name: 'Downtown Scale',
        location: '789 Center Ave',
        scale_type: 'fixed',
        status: 'Active',
        max_capacity: 60000,
        precision: 20,
        calibration_date: '2023-11-10',
        next_calibration_date: '2024-05-10',
      },
      {
        id: 4,
        name: 'Industrial Park Scale',
        location: '789 Industry Blvd',
        scale_type: 'fixed',
        status: 'Active',
        max_capacity: 120000,
        precision: 100,
        calibration_date: '2023-07-05',
        next_calibration_date: '2024-01-05',
      },
      {
        id: 5,
        name: 'Mobile Unit 1',
        location: 'Variable',
        scale_type: 'portable',
        status: 'Active',
        max_capacity: 40000,
        precision: 20,
        calibration_date: '2023-08-01',
        next_calibration_date: '2024-02-01',
      },
    ];
    setScales(dummyScales);
  };

  // Load scales on component mount
  useEffect(() => {
    fetchScales();
  }, []);

  // Filter scales based on search query and filters
  const filteredScales = scales.filter((scale) => {
    const matchesSearch =
      searchQuery === '' ||
      scale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scale.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || scale.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesType =
      typeFilter === 'all' || scale.scale_type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get counts for tabs
  const activeScalesCount = scales.filter((scale) => scale.status === 'Active').length;
  const maintenanceScalesCount = scales.filter((scale) => scale.status === 'Maintenance').length;
  const inactiveScalesCount = scales.filter((scale) => scale.status === 'Inactive').length;

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">City Scales</h1>
            <p className="text-gray-400">Manage and monitor municipal weighing scales</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchScales} disabled={isLoading}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </Button>
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Scale
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
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="portable">Portable</SelectItem>
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
            <TabsTrigger value="all">All ({scales.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeScalesCount})</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance ({maintenanceScalesCount})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive ({inactiveScalesCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <ScalesTable scales={filteredScales} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <ScalesTable
              scales={scales.filter((scale) => scale.status === 'Active')}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <ScalesTable
              scales={scales.filter((scale) => scale.status === 'Maintenance')}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="inactive" className="space-y-6">
            <ScalesTable
              scales={scales.filter((scale) => scale.status === 'Inactive')}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

// Scales table component
const ScalesTable = ({ scales, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full bg-gray-700" />
        ))}
      </div>
    );
  }

  if (scales.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No scales found matching the current filters.</p>
      </div>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-800">
              <TableHead className="text-gray-400">Name</TableHead>
              <TableHead className="text-gray-400">Location</TableHead>
              <TableHead className="text-gray-400">Type</TableHead>
              <TableHead className="text-gray-400">Capacity</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Next Calibration</TableHead>
              <TableHead className="text-gray-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scales.map((scale) => (
              <TableRow key={scale.id} className="border-gray-700 hover:bg-gray-700">
                <TableCell className="font-medium text-white">{scale.name}</TableCell>
                <TableCell className="text-gray-300">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {scale.location}
                  </div>
                </TableCell>
                <TableCell className="text-gray-300">
                  {scale.scale_type === 'fixed' ? 'Fixed' : 'Portable'}
                </TableCell>
                <TableCell className="text-gray-300">
                  {scale.max_capacity.toLocaleString()} lbs
                </TableCell>
                <TableCell>
                  <StatusBadge status={scale.status} />
                </TableCell>
                <TableCell className="text-gray-300">
                  {new Date(scale.next_calibration_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <WrenchScrewdriverIcon className="h-4 w-4" />
                      <span className="sr-only">Calibrate</span>
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
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
    case 'Maintenance':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30">
          <WrenchScrewdriverIcon className="h-3.5 w-3.5 mr-1" />
          Maintenance
        </Badge>
      );
    case 'Inactive':
      return (
        <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/20 border-red-500/30">
          <XCircleIcon className="h-3.5 w-3.5 mr-1" />
          Inactive
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

// Use dynamic import with SSR disabled to avoid hydration issues
const CityScalesPage = dynamic(() => Promise.resolve(CityScalesPageClient), {
  ssr: false,
});

export default function Page() {
  return <CityScalesPage />;
}
