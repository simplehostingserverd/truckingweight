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
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
  TruckIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlayIcon,
  PauseIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Label,
  Switch,
  Slider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress,
} from '@/components/ui';
import Link from 'next/link';

interface PricingRule {
  id: string;
  name: string;
  type:
    | 'base_rate'
    | 'demand_multiplier'
    | 'seasonal_adjustment'
    | 'fuel_surcharge'
    | 'capacity_premium';
  status: 'active' | 'inactive' | 'testing';
  priority: number;
  conditions: {
    equipmentType?: string[];
    routeType?: string[];
    distance?: { min: number; max: number };
    weight?: { min: number; max: number };
    timeOfDay?: { start: string; end: string };
    dayOfWeek?: string[];
    season?: string[];
  };
  adjustment: {
    type: 'percentage' | 'fixed_amount' | 'multiplier';
    value: number;
    min?: number;
    max?: number;
  };
  description: string;
  createdAt: string;
  lastModified: string;
  performance: {
    applicationsCount: number;
    revenueImpact: number;
    acceptanceRate: number;
  };
}

interface PricingMetrics {
  totalQuotes: number;
  averageRate: number;
  acceptanceRate: number;
  revenueIncrease: number;
  modelAccuracy: number;
  activeRules: number;
  lastUpdate: string;
}

interface MarketData {
  lane: string;
  currentRate: number;
  marketRate: number;
  variance: number;
  trend: 'up' | 'down' | 'stable';
  volume: number;
  lastUpdated: string;
}

export default function DynamicPricingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [metrics, setMetrics] = useState<PricingMetrics>({
    totalQuotes: 0,
    averageRate: 0,
    acceptanceRate: 0,
    revenueIncrease: 0,
    modelAccuracy: 0,
    activeRules: 0,
    lastUpdate: '',
  });
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  // Configuration states
  const [dynamicPricingEnabled, setDynamicPricingEnabled] = useState(true);
  const [autoApprovalEnabled, setAutoApprovalEnabled] = useState(false);
  const [maxAdjustment, setMaxAdjustment] = useState([25]);
  const [minConfidence, setMinConfidence] = useState([80]);
  const [updateFrequency, setUpdateFrequency] = useState('hourly');

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockRules: PricingRule[] = [
        {
          id: 'rule-001',
          name: 'Peak Season Premium',
          type: 'seasonal_adjustment',
          status: 'active',
          priority: 1,
          conditions: {
            season: ['summer', 'winter_holidays'],
            equipmentType: ['dry_van', 'refrigerated'],
          },
          adjustment: {
            type: 'percentage',
            value: 15,
            min: 5,
            max: 25,
          },
          description: 'Apply premium pricing during peak shipping seasons',
          createdAt: '2024-12-01T00:00:00Z',
          lastModified: '2025-01-15T10:30:00Z',
          performance: {
            applicationsCount: 1250,
            revenueImpact: 125000,
            acceptanceRate: 78.5,
          },
        },
        {
          id: 'rule-002',
          name: 'High Demand Routes',
          type: 'demand_multiplier',
          status: 'active',
          priority: 2,
          conditions: {
            routeType: ['high_demand'],
            timeOfDay: { start: '14:00', end: '18:00' },
          },
          adjustment: {
            type: 'multiplier',
            value: 1.2,
            min: 1.1,
            max: 1.5,
          },
          description: 'Increase rates on high-demand routes during peak hours',
          createdAt: '2024-11-15T00:00:00Z',
          lastModified: '2025-01-10T14:20:00Z',
          performance: {
            applicationsCount: 850,
            revenueImpact: 95000,
            acceptanceRate: 82.3,
          },
        },
        {
          id: 'rule-003',
          name: 'Fuel Surcharge Adjustment',
          type: 'fuel_surcharge',
          status: 'active',
          priority: 3,
          conditions: {
            distance: { min: 500, max: 9999 },
          },
          adjustment: {
            type: 'percentage',
            value: 8.5,
            min: 5,
            max: 15,
          },
          description: 'Dynamic fuel surcharge based on current fuel prices',
          createdAt: '2024-10-01T00:00:00Z',
          lastModified: '2025-01-18T09:15:00Z',
          performance: {
            applicationsCount: 2100,
            revenueImpact: 180000,
            acceptanceRate: 85.7,
          },
        },
        {
          id: 'rule-004',
          name: 'Capacity Shortage Premium',
          type: 'capacity_premium',
          status: 'testing',
          priority: 4,
          conditions: {
            equipmentType: ['flatbed', 'specialized'],
          },
          adjustment: {
            type: 'percentage',
            value: 20,
            min: 10,
            max: 35,
          },
          description: 'Premium pricing when specialized equipment capacity is low',
          createdAt: '2025-01-01T00:00:00Z',
          lastModified: '2025-01-20T11:45:00Z',
          performance: {
            applicationsCount: 125,
            revenueImpact: 25000,
            acceptanceRate: 65.2,
          },
        },
      ];

      const mockMetrics: PricingMetrics = {
        totalQuotes: 15420,
        averageRate: 2850,
        acceptanceRate: 78.5,
        revenueIncrease: 12.8,
        modelAccuracy: 87.3,
        activeRules: mockRules.filter(r => r.status === 'active').length,
        lastUpdate: '2025-01-20T14:30:00Z',
      };

      const mockMarketData: MarketData[] = [
        {
          lane: 'Los Angeles, CA → Chicago, IL',
          currentRate: 3250,
          marketRate: 3100,
          variance: 4.8,
          trend: 'up',
          volume: 125,
          lastUpdated: '2025-01-20T14:00:00Z',
        },
        {
          lane: 'Atlanta, GA → New York, NY',
          currentRate: 2850,
          marketRate: 2950,
          variance: -3.4,
          trend: 'down',
          volume: 98,
          lastUpdated: '2025-01-20T14:00:00Z',
        },
        {
          lane: 'Dallas, TX → Miami, FL',
          currentRate: 2950,
          marketRate: 2925,
          variance: 0.9,
          trend: 'stable',
          volume: 87,
          lastUpdated: '2025-01-20T14:00:00Z',
        },
        {
          lane: 'Seattle, WA → Denver, CO',
          currentRate: 2650,
          marketRate: 2750,
          variance: -3.6,
          trend: 'down',
          volume: 76,
          lastUpdated: '2025-01-20T14:00:00Z',
        },
      ];

      setPricingRules(mockRules);
      setMetrics(mockMetrics);
      setMarketData(mockMarketData);
    } catch (error) {
      console.error('Error loading pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'testing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'testing':
        return <ClockIcon className="h-4 w-4" />;
      case 'inactive':
        return <PauseIcon className="h-4 w-4" />;
      default:
        return <InformationCircleIcon className="h-4 w-4" />;
    }
  };

  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'base_rate':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'demand_multiplier':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'seasonal_adjustment':
        return <CalendarIcon className="h-5 w-5" />;
      case 'fuel_surcharge':
        return <BoltIcon className="h-5 w-5" />;
      case 'capacity_premium':
        return <TruckIcon className="h-5 w-5" />;
      default:
        return <AdjustmentsHorizontalIcon className="h-5 w-5" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <span className="text-gray-400">→</span>;
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dynamic Pricing</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            AI-powered pricing optimization and market-driven rate adjustments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            View Analytics
          </Button>
          <Link href="/ml/pricing/rules/new">
            <Button>
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Create Rule
            </Button>
          </Link>
        </div>
      </div>

      {/* Pricing Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Quotes</p>
                <p className="text-2xl font-bold">{metrics.totalQuotes.toLocaleString()}</p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+15.3%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Acceptance Rate</p>
                <p className="text-2xl font-bold">{metrics.acceptanceRate.toFixed(1)}%</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+2.1%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue Increase</p>
                <p className="text-2xl font-bold">{metrics.revenueIncrease.toFixed(1)}%</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+1.8%</span>
              <span className="text-gray-500 ml-1">vs baseline</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Model Accuracy</p>
                <p className="text-2xl font-bold">{metrics.modelAccuracy.toFixed(1)}%</p>
              </div>
              <CpuChipIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+0.8%</span>
              <span className="text-gray-500 ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${dynamicPricingEnabled ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
              <div>
                <h3 className="font-medium">Dynamic Pricing System</h3>
                <p className="text-sm text-gray-500">
                  {dynamicPricingEnabled ? 'Active' : 'Inactive'} • Last updated:{' '}
                  {new Date(metrics.lastUpdate).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                {metrics.activeRules} active rules
              </Badge>
              <Button size="sm" variant="outline">
                <Cog6ToothIcon className="h-4 w-4 mr-1" />
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="market">Market Data</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Rate</span>
                      <span>${metrics.averageRate.toLocaleString()}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="text-xs text-gray-500">vs market average</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quote Acceptance</span>
                      <span>{metrics.acceptanceRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.acceptanceRate} className="h-2" />
                    <div className="text-xs text-gray-500">Target: 80%</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Model Confidence</span>
                      <span>{metrics.modelAccuracy.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.modelAccuracy} className="h-2" />
                    <div className="text-xs text-gray-500">Target: 90%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Pricing Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pricingRules
                    .filter(r => r.status === 'active')
                    .slice(0, 4)
                    .map(rule => (
                      <div
                        key={rule.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getRuleTypeIcon(rule.type)}
                          <div>
                            <div className="font-medium">{rule.name}</div>
                            <div className="text-sm text-gray-500">
                              {rule.adjustment.type === 'percentage'
                                ? `${rule.adjustment.value}%`
                                : rule.adjustment.type === 'multiplier'
                                  ? `${rule.adjustment.value}x`
                                  : `$${rule.adjustment.value}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            ${(rule.performance.revenueImpact / 1000).toFixed(0)}K
                          </div>
                          <div className="text-xs text-gray-500">
                            {rule.performance.acceptanceRate.toFixed(1)}% accepted
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Market Rate Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketData.slice(0, 4).map((lane, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{lane.lane}</div>
                        <div className="text-sm text-gray-500">Volume: {lane.volume} loads</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${lane.currentRate.toLocaleString()}</span>
                        {getTrendIcon(lane.trend)}
                      </div>
                      <div className={`text-sm ${getVarianceColor(lane.variance)}`}>
                        {lane.variance > 0 ? '+' : ''}
                        {lane.variance.toFixed(1)}% vs market
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingRules.map(rule => (
              <Card key={rule.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRuleTypeIcon(rule.type)}
                      {rule.name}
                    </div>
                    <Badge className={getStatusColor(rule.status)}>
                      {getStatusIcon(rule.status)}
                      <span className="ml-1">{rule.status}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{rule.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Priority</div>
                        <div className="font-medium">#{rule.priority}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Adjustment</div>
                        <div className="font-medium">
                          {rule.adjustment.type === 'percentage'
                            ? `${rule.adjustment.value}%`
                            : rule.adjustment.type === 'multiplier'
                              ? `${rule.adjustment.value}x`
                              : `$${rule.adjustment.value}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Applications</div>
                        <div className="font-medium">
                          {rule.performance.applicationsCount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Revenue Impact</div>
                        <div className="font-medium text-green-600">
                          ${(rule.performance.revenueImpact / 1000).toFixed(0)}K
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Acceptance Rate</span>
                        <span>{rule.performance.acceptanceRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={rule.performance.acceptanceRate} className="h-2" />
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Modified: {new Date(rule.lastModified).toLocaleDateString()}</span>
                        <span className="capitalize">{rule.type.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Edit Rule
                      </Button>
                      <Button size="sm" variant="outline">
                        {rule.status === 'active' ? (
                          <PauseIcon className="h-4 w-4" />
                        ) : (
                          <PlayIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Rate Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketData.map((lane, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{lane.lane}</div>
                          <div className="text-sm text-gray-500">
                            Last updated: {new Date(lane.lastUpdated).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            ${lane.currentRate.toLocaleString()}
                          </span>
                          {getTrendIcon(lane.trend)}
                        </div>
                        <div className={`text-sm ${getVarianceColor(lane.variance)}`}>
                          {lane.variance > 0 ? '+' : ''}
                          {lane.variance.toFixed(1)}% vs market
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Our Rate</div>
                        <div className="font-medium">${lane.currentRate.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Market Rate</div>
                        <div className="font-medium">${lane.marketRate.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Volume</div>
                        <div className="font-medium">{lane.volume} loads</div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Competitive Position</span>
                        <span>
                          {lane.variance > 0
                            ? 'Above Market'
                            : lane.variance < 0
                              ? 'Below Market'
                              : 'At Market'}
                        </span>
                      </div>
                      <Progress value={50 + lane.variance * 2} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Pricing Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dynamic-pricing">Enable Dynamic Pricing</Label>
                  <p className="text-sm text-gray-500">
                    Automatically adjust pricing based on market conditions
                  </p>
                </div>
                <Switch
                  id="dynamic-pricing"
                  checked={dynamicPricingEnabled}
                  onCheckedChange={setDynamicPricingEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-approval">Auto-approve Quotes</Label>
                  <p className="text-sm text-gray-500">
                    Automatically approve quotes within confidence threshold
                  </p>
                </div>
                <Switch
                  id="auto-approval"
                  checked={autoApprovalEnabled}
                  onCheckedChange={setAutoApprovalEnabled}
                />
              </div>

              <div className="space-y-3">
                <Label>Maximum Price Adjustment: {maxAdjustment[0]}%</Label>
                <Slider
                  value={maxAdjustment}
                  onValueChange={setMaxAdjustment}
                  max={50}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">Maximum percentage change from base rate</p>
              </div>

              <div className="space-y-3">
                <Label>Minimum Confidence Level: {minConfidence[0]}%</Label>
                <Slider
                  value={minConfidence}
                  onValueChange={setMinConfidence}
                  max={95}
                  min={60}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">
                  Minimum model confidence required for automatic pricing
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="update-frequency">Update Frequency</Label>
                <Select value={updateFrequency} onValueChange={setUpdateFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real-time">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  How often to update pricing models with new market data
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
