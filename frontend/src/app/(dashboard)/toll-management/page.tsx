/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved;
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System;
 * Unauthorized copying of this file, via any medium is strictly prohibited;
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission;
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MapIcon,
  PlusIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, Button, Badge } from '@/components/ui';

// Import our toll components
import TollDashboard from '@/components/toll/TollDashboard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TollProvider {
  id: number;
  name: string;
  provider_type: string;
  status: 'active' | 'inactive' | 'error';
  account_count: number;
  last_sync: string;
  balance: number;
  monthly_cost: number;
}

interface TollMetrics {
  totalCost: number;
  totalTransactions: number;
  activeProviders: number;
  costSavings: number;
  averagePerMile: number;
  monthlyTrend: number;
}

export default function TollManagementPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<TollMetrics>({
    totalCost: 0,
    totalTransactions: 0,
    activeProviders: 0,
    costSavings: 0,
    averagePerMile: 0,
    monthlyTrend: 0,
  });
  const [providers, setProviders] = useState<TollProvider[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadTollData();
  }, []);

  const loadTollData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with actual API calls
      const mockMetrics: TollMetrics = {
        totalCost: 15420.5,
        totalTransactions: 1247,
        activeProviders: 3,
        costSavings: 2340.75,
        averagePerMile: 0.12,
        monthlyTrend: 8.5,
      };

      const mockProviders: TollProvider[] = [
        {
          id: 1,
          name: 'PC Miler',
          provider_type: 'route_planning',
          status: 'active',
          account_count: 1,
          last_sync: '2025-01-20T14:30:00Z',
          balance: 500.0,
          monthly_cost: 4250.3,
        },
        {
          id: 2,
          name: 'I-Pass',
          provider_type: 'transponder',
          status: 'active',
          account_count: 2,
          last_sync: '2025-01-20T13:45:00Z',
          balance: 1250.75,
          monthly_cost: 6890.2,
        },
        {
          id: 3,
          name: 'BestPass',
          provider_type: 'payment_system',
          status: 'active',
          account_count: 1,
          last_sync: '2025-01-20T12:15:00Z',
          balance: 2100.0,
          monthly_cost: 4280.0,
        },
        {
          id: 4,
          name: 'PrePass',
          provider_type: 'transponder',
          status: 'inactive',
          account_count: 0,
          last_sync: 'Never',
          balance: 0,
          monthly_cost: 0,
        },
      ];

      setMetrics(mockMetrics);
      setProviders(mockProviders);
    } catch (error) {
      console.error('Error loading toll data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Toll Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage toll providers, optimize routes, and track toll expenses across your fleet
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Export Reports
          </Button>
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Provider
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Toll Costs</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalCost)}</p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className={metrics.monthlyTrend >= 0 ? 'text-green-600' : 'text-red-600'}>
                {metrics.monthlyTrend >= 0 ? '+' : ''}
                {metrics.monthlyTrend.toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold">{metrics.totalTransactions.toLocaleString()}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+12.3%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Providers</p>
                <p className="text-2xl font-bold">{metrics.activeProviders}</p>
              </div>
              <TruckIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">of {providers.length} total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cost Savings</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.costSavings)}</p>
              </div>
              <BanknotesIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+15.2%</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Status Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Toll Provider Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map(provider => (
              <div key={provider.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{provider.name}</h3>
                  <Badge className={getStatusColor(provider.status)}>{provider.status}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span>{provider.provider_type.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Accounts:</span>
                    <span>{provider.account_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Balance:</span>
                    <span className="font-medium">{formatCurrency(provider.balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monthly Cost:</span>
                    <span className="font-medium">{formatCurrency(provider.monthly_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Sync:</span>
                    <span className="text-xs">
                      {provider.last_sync === 'Never'
                        ? 'Never'
                        : new Date(provider.last_sync).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="routes">Route Calculator</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Use the TollDashboard component */}
          <TollDashboard />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Toll Account Management</CardTitle>
              <p className="text-sm text-gray-500">
                Manage your toll provider accounts and transponder assignments
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Cog6ToothIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Account Management
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Configure and manage your toll provider accounts, transponders, and payment
                  methods;
                </p>
                <Button>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Toll Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Toll Route Calculator</CardTitle>
              <p className="text-sm text-gray-500">
                Calculate and optimize toll costs for your routes
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Route Optimization
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Calculate toll costs for different routes and find the most cost-effective paths;
                </p>
                <Button>
                  <MapIcon className="h-5 w-5 mr-2" />
                  Calculate Route Tolls
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Toll Reports & Analytics</CardTitle>
              <p className="text-sm text-gray-500">
                Generate detailed reports on toll expenses and usage patterns
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Toll Analytics
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Analyze toll spending patterns, identify cost-saving opportunities, and generate
                  reports;
                </p>
                <Button>
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
