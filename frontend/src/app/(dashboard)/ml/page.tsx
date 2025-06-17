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
  CpuChipIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  BoltIcon,
  TruckIcon,
  CalendarIcon,
  DocumentTextIcon,
  BeakerIcon,
  AdjustmentsHorizontalIcon,
  ChartPieIcon,
  LightBulbIcon,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress,
} from '@/components/ui';
import Link from 'next/link';

interface MLModel {
  id: string;
  name: string;
  type:
    | 'eta_prediction'
    | 'dynamic_pricing'
    | 'maintenance_prediction'
    | 'route_optimization'
    | 'demand_forecasting';
  status: 'active' | 'training' | 'inactive' | 'error' | 'pending';
  version: string;
  accuracy: number;
  lastTrained: string;
  lastPrediction: string;
  totalPredictions: number;
  successRate: number;
  description: string;
  features: string[];
  trainingData: {
    samples: number;
    lastUpdate: string;
    sources: string[];
  };
  performance: {
    latency: number; // ms
    throughput: number; // predictions/hour
    errorRate: number;
    confidence: number;
  };
  configuration: {
    autoRetrain: boolean;
    retrainThreshold: number;
    maxPredictions: number;
    alertThreshold: number;
  };
}

interface Prediction {
  id: string;
  modelId: string;
  modelName: string;
  type: string;
  input: Record<string, any>;
  output: Record<string, any>;
  confidence: number;
  timestamp: string;
  executionTime: number;
  status: 'success' | 'error' | 'pending';
  actualOutcome?: Record<string, any>;
  accuracy?: number;
}

interface MLMetrics {
  totalModels: number;
  activeModels: number;
  totalPredictions: number;
  averageAccuracy: number;
  averageLatency: number;
  errorRate: number;
  costSavings: number;
  revenueImpact: number;
}

export default function MLManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [models, setModels] = useState<MLModel[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [metrics, setMetrics] = useState<MLMetrics>({
    totalModels: 0,
    activeModels: 0,
    totalPredictions: 0,
    averageAccuracy: 0,
    averageLatency: 0,
    errorRate: 0,
    costSavings: 0,
    revenueImpact: 0,
  });
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMLData();
  }, []);

  const loadMLData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockModels: MLModel[] = [
        {
          id: 'eta-model-v2',
          name: 'ETA Prediction Model',
          type: 'eta_prediction',
          status: 'active',
          version: '2.1.3',
          accuracy: 94.2,
          lastTrained: '2025-01-18T10:30:00Z',
          lastPrediction: '2025-01-20T14:45:00Z',
          totalPredictions: 15420,
          successRate: 98.7,
          description:
            'AI-powered estimated time of arrival predictions using traffic, weather, and driver performance data',
          features: [
            'distance',
            'traffic_conditions',
            'weather',
            'driver_experience',
            'vehicle_type',
            'time_of_day',
          ],
          trainingData: {
            samples: 125000,
            lastUpdate: '2025-01-18T10:30:00Z',
            sources: ['GPS tracking', 'Traffic APIs', 'Weather APIs', 'Driver logs'],
          },
          performance: {
            latency: 45,
            throughput: 2400,
            errorRate: 1.3,
            confidence: 94.2,
          },
          configuration: {
            autoRetrain: true,
            retrainThreshold: 90.0,
            maxPredictions: 10000,
            alertThreshold: 85.0,
          },
        },
        {
          id: 'pricing-model-v1',
          name: 'Dynamic Pricing Model',
          type: 'dynamic_pricing',
          status: 'active',
          version: '1.4.2',
          accuracy: 87.8,
          lastTrained: '2025-01-15T08:15:00Z',
          lastPrediction: '2025-01-20T14:30:00Z',
          totalPredictions: 8950,
          successRate: 96.4,
          description:
            'Market-driven pricing optimization based on demand, capacity, and competitive analysis',
          features: [
            'distance',
            'demand_index',
            'fuel_prices',
            'seasonal_factors',
            'equipment_type',
            'market_conditions',
          ],
          trainingData: {
            samples: 85000,
            lastUpdate: '2025-01-15T08:15:00Z',
            sources: ['Load board data', 'Market rates', 'Fuel price APIs', 'Historical pricing'],
          },
          performance: {
            latency: 120,
            throughput: 1800,
            errorRate: 3.6,
            confidence: 87.8,
          },
          configuration: {
            autoRetrain: true,
            retrainThreshold: 85.0,
            maxPredictions: 5000,
            alertThreshold: 80.0,
          },
        },
        {
          id: 'maintenance-model-v3',
          name: 'Predictive Maintenance Model',
          type: 'maintenance_prediction',
          status: 'training',
          version: '3.0.1',
          accuracy: 91.5,
          lastTrained: '2025-01-20T06:00:00Z',
          lastPrediction: '2025-01-20T12:15:00Z',
          totalPredictions: 3240,
          successRate: 94.8,
          description:
            'Predictive maintenance alerts using telematics data and maintenance history',
          features: [
            'mileage',
            'engine_hours',
            'fault_codes',
            'maintenance_history',
            'telematics_data',
            'component_age',
          ],
          trainingData: {
            samples: 45000,
            lastUpdate: '2025-01-20T06:00:00Z',
            sources: [
              'Telematics',
              'Maintenance records',
              'Fault codes',
              'Component specifications',
            ],
          },
          performance: {
            latency: 200,
            throughput: 1200,
            errorRate: 5.2,
            confidence: 91.5,
          },
          configuration: {
            autoRetrain: true,
            retrainThreshold: 88.0,
            maxPredictions: 2000,
            alertThreshold: 85.0,
          },
        },
        {
          id: 'route-opt-model-v1',
          name: 'Route Optimization Model',
          type: 'route_optimization',
          status: 'inactive',
          version: '1.2.0',
          accuracy: 82.3,
          lastTrained: '2025-01-10T14:20:00Z',
          lastPrediction: '2025-01-19T16:45:00Z',
          totalPredictions: 1850,
          successRate: 89.2,
          description:
            'AI-powered route optimization for fuel efficiency and delivery time optimization',
          features: [
            'origin',
            'destination',
            'stops',
            'traffic_patterns',
            'fuel_efficiency',
            'driver_preferences',
          ],
          trainingData: {
            samples: 32000,
            lastUpdate: '2025-01-10T14:20:00Z',
            sources: ['GPS routes', 'Traffic data', 'Fuel consumption', 'Delivery records'],
          },
          performance: {
            latency: 350,
            throughput: 800,
            errorRate: 10.8,
            confidence: 82.3,
          },
          configuration: {
            autoRetrain: false,
            retrainThreshold: 80.0,
            maxPredictions: 1000,
            alertThreshold: 75.0,
          },
        },
        {
          id: 'demand-forecast-v2',
          name: 'Demand Forecasting Model',
          type: 'demand_forecasting',
          status: 'error',
          version: '2.0.5',
          accuracy: 76.9,
          lastTrained: '2025-01-12T11:30:00Z',
          lastPrediction: '2025-01-18T09:20:00Z',
          totalPredictions: 920,
          successRate: 78.4,
          description:
            'Market demand forecasting for capacity planning and strategic decision making',
          features: [
            'historical_demand',
            'seasonal_patterns',
            'economic_indicators',
            'market_trends',
            'competitor_analysis',
          ],
          trainingData: {
            samples: 28000,
            lastUpdate: '2025-01-12T11:30:00Z',
            sources: ['Load board data', 'Market reports', 'Economic data', 'Industry trends'],
          },
          performance: {
            latency: 500,
            throughput: 400,
            errorRate: 21.6,
            confidence: 76.9,
          },
          configuration: {
            autoRetrain: true,
            retrainThreshold: 75.0,
            maxPredictions: 500,
            alertThreshold: 70.0,
          },
        },
      ];

      const mockPredictions: Prediction[] = [
        {
          id: 'pred-001',
          modelId: 'eta-model-v2',
          modelName: 'ETA Prediction Model',
          type: 'eta_prediction',
          input: {
            loadId: 'LD-2025-001234',
            distance: 450,
            trafficConditions: 'moderate',
            weatherConditions: 'clear',
          },
          output: {
            estimatedArrivalTime: '2025-01-22T14:30:00Z',
            confidenceScore: 0.94,
            factors: {
              traffic: 0.15,
              weather: 0.05,
              driverPerformance: 0.12,
              routeComplexity: 0.08,
            },
          },
          confidence: 94.2,
          timestamp: '2025-01-20T14:45:00Z',
          executionTime: 45,
          status: 'success',
          actualOutcome: {
            actualArrivalTime: '2025-01-22T14:25:00Z',
          },
          accuracy: 98.5,
        },
        {
          id: 'pred-002',
          modelId: 'pricing-model-v1',
          modelName: 'Dynamic Pricing Model',
          type: 'dynamic_pricing',
          input: {
            origin: { lat: 40.7128, lng: -74.006 },
            destination: { lat: 34.0522, lng: -118.2437 },
            loadType: 'dry_goods',
            weight: 25000,
            equipmentType: 'dry_van',
          },
          output: {
            baseRate: 3250.0,
            adjustedRate: 3575.0,
            adjustmentFactors: {
              demand: 1.08,
              fuel: 1.02,
              seasonal: 1.0,
              capacity: 1.05,
              market: 1.03,
            },
            confidenceScore: 0.878,
          },
          confidence: 87.8,
          timestamp: '2025-01-20T14:30:00Z',
          executionTime: 120,
          status: 'success',
        },
        {
          id: 'pred-003',
          modelId: 'maintenance-model-v3',
          modelName: 'Predictive Maintenance Model',
          type: 'maintenance_prediction',
          input: {
            vehicleId: 'VH-247',
            mileage: 125000,
            engineHours: 3200,
            lastMaintenance: '2024-12-15',
          },
          output: {
            predictions: [
              {
                componentType: 'brakes',
                failureProbability: 0.23,
                estimatedFailureDate: '2025-03-15',
                recommendedAction: 'schedule_maintenance',
                costImpact: 1200,
              },
            ],
          },
          confidence: 91.5,
          timestamp: '2025-01-20T12:15:00Z',
          executionTime: 200,
          status: 'success',
        },
      ];

      const mockMetrics: MLMetrics = {
        totalModels: mockModels.length,
        activeModels: mockModels.filter(m => m.status === 'active').length,
        totalPredictions: mockModels.reduce((sum, m) => sum + m.totalPredictions, 0),
        averageAccuracy: mockModels.reduce((sum, m) => sum + m.accuracy, 0) / mockModels.length,
        averageLatency:
          mockModels.reduce((sum, m) => sum + m.performance.latency, 0) / mockModels.length,
        errorRate:
          mockModels.reduce((sum, m) => sum + m.performance.errorRate, 0) / mockModels.length,
        costSavings: 125000,
        revenueImpact: 285000,
      };

      setModels(mockModels);
      setPredictions(mockPredictions);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading ML data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'training':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'training':
        return <ArrowPathIcon className="h-4 w-4 animate-spin" />;
      case 'inactive':
        return <PauseIcon className="h-4 w-4" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <InformationCircleIcon className="h-4 w-4" />;
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'eta_prediction':
        return <ClockIcon className="h-5 w-5" />;
      case 'dynamic_pricing':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'maintenance_prediction':
        return <WrenchScrewdriverIcon className="h-5 w-5" />;
      case 'route_optimization':
        return <TruckIcon className="h-5 w-5" />;
      case 'demand_forecasting':
        return <ChartBarIcon className="h-5 w-5" />;
      default:
        return <CpuChipIcon className="h-5 w-5" />;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredModels = models.filter(model => {
    if (selectedModel !== 'all' && model.type !== selectedModel) return false;
    if (selectedStatus !== 'all' && model.status !== selectedStatus) return false;
    return true;
  });

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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">AI & ML Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Machine learning model management, prediction tracking, and AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Export Reports
          </Button>
          <Link href="/ml/models/new">
            <Button>
              <BeakerIcon className="h-5 w-5 mr-2" />
              Deploy Model
            </Button>
          </Link>
        </div>
      </div>

      {/* ML Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Models</p>
                <p className="text-2xl font-bold">{metrics.activeModels}</p>
              </div>
              <CpuChipIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">of {metrics.totalModels} total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Accuracy</p>
                <p className="text-2xl font-bold">{metrics.averageAccuracy.toFixed(1)}%</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+2.3%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Predictions</p>
                <p className="text-2xl font-bold">{metrics.totalPredictions.toLocaleString()}</p>
              </div>
              <BoltIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+18.7%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cost Savings</p>
                <p className="text-2xl font-bold">${(metrics.costSavings / 1000).toFixed(0)}K</p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+$25K</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      {models.some(m => m.status === 'error' || m.accuracy < 80) && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Model Performance Alert
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {models.filter(m => m.status === 'error').length} models have errors and{' '}
                  {models.filter(m => m.accuracy < 80).length} models are below accuracy threshold.
                  Review model performance and consider retraining.
                </p>
              </div>
              <Button size="sm" variant="outline">
                Review Models
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Model Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {models.slice(0, 5).map(model => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getModelTypeIcon(model.type)}
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-gray-500">v{model.version}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getAccuracyColor(model.accuracy)}`}>
                          {model.accuracy.toFixed(1)}%
                        </div>
                        <Badge className={getStatusColor(model.status)}>
                          {getStatusIcon(model.status)}
                          <span className="ml-1">{model.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions.slice(0, 5).map(prediction => (
                    <div
                      key={prediction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getModelTypeIcon(prediction.type)}
                        <div>
                          <div className="font-medium">{prediction.modelName}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(prediction.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {(prediction.confidence * 100).toFixed(1)}% confidence
                        </div>
                        <div className="text-xs text-gray-500">{prediction.executionTime}ms</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health & Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Latency</span>
                    <span>{metrics.averageLatency.toFixed(0)}ms</span>
                  </div>
                  <Progress
                    value={Math.max(0, 100 - metrics.averageLatency / 10)}
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500">Target: &lt;100ms</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Error Rate</span>
                    <span>{metrics.errorRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.max(0, 100 - metrics.errorRate * 10)} className="h-2" />
                  <div className="text-xs text-gray-500">Target: &lt;5%</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Model Uptime</span>
                    <span>99.7%</span>
                  </div>
                  <Progress value={99.7} className="h-2" />
                  <div className="text-xs text-gray-500">Target: &gt;99%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Business Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ${(metrics.costSavings / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-500">Cost Savings</div>
                  <div className="text-xs text-gray-400 mt-1">This month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    ${(metrics.revenueImpact / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-500">Revenue Impact</div>
                  <div className="text-xs text-gray-400 mt-1">This month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {(
                      ((metrics.costSavings + metrics.revenueImpact) / metrics.totalPredictions) *
                      1000
                    ).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">ROI per Prediction</div>
                  <div className="text-xs text-gray-400 mt-1">Average</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {(metrics.totalPredictions / 30).toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-500">Daily Predictions</div>
                  <div className="text-xs text-gray-400 mt-1">Average</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Model Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="eta_prediction">ETA Prediction</SelectItem>
                    <SelectItem value="dynamic_pricing">Dynamic Pricing</SelectItem>
                    <SelectItem value="maintenance_prediction">Maintenance Prediction</SelectItem>
                    <SelectItem value="route_optimization">Route Optimization</SelectItem>
                    <SelectItem value="demand_forecasting">Demand Forecasting</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedModel('all');
                    setSelectedStatus('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map(model => (
              <Card key={model.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getModelTypeIcon(model.type)}
                      {model.name}
                    </div>
                    <Badge className={getStatusColor(model.status)}>
                      {getStatusIcon(model.status)}
                      <span className="ml-1">{model.status}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Version</div>
                        <div className="font-medium">v{model.version}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Accuracy</div>
                        <div className={`font-medium ${getAccuracyColor(model.accuracy)}`}>
                          {model.accuracy.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Predictions</div>
                        <div className="font-medium">{model.totalPredictions.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Success Rate</div>
                        <div className="font-medium">{model.successRate.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-2">Performance</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Latency</span>
                          <span>{model.performance.latency}ms</span>
                        </div>
                        <Progress
                          value={Math.max(0, 100 - model.performance.latency / 10)}
                          className="h-1"
                        />
                        <div className="flex justify-between text-xs">
                          <span>Throughput</span>
                          <span>{model.performance.throughput}/hr</span>
                        </div>
                        <Progress
                          value={Math.min(100, model.performance.throughput / 30)}
                          className="h-1"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-2">Features</div>
                      <div className="flex flex-wrap gap-1">
                        {model.features.slice(0, 3).map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature.replace('_', ' ')}
                          </Badge>
                        ))}
                        {model.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{model.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                        </span>
                        <span>Training samples: {model.trainingData.samples.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/ml/models/${model.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Cog6ToothIcon className="h-4 w-4" />
                      </Button>
                      {model.status === 'active' ? (
                        <Button size="sm" variant="outline">
                          <PauseIcon className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <PlayIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredModels.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CpuChipIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Models Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No models match your current filters.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedModel('all');
                      setSelectedStatus('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map(prediction => (
                  <div key={prediction.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getModelTypeIcon(prediction.type)}
                        <div>
                          <div className="font-medium">{prediction.modelName}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(prediction.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(prediction.status)}>
                          {prediction.status}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          {(prediction.confidence * 100).toFixed(1)}% confidence
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 mb-2">Input</div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs">
                          <pre>{JSON.stringify(prediction.input, null, 2)}</pre>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-2">Output</div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs">
                          <pre>{JSON.stringify(prediction.output, null, 2)}</pre>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t text-xs text-gray-500">
                      <span>Execution time: {prediction.executionTime}ms</span>
                      {prediction.accuracy && (
                        <span>Actual accuracy: {prediction.accuracy.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LightBulbIcon className="h-5 w-5" />
                AI-Powered Business Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Model Performance Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                          <ChartBarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100">
                            Model Performance Optimization
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            ETA Prediction model shows 94.2% accuracy. Consider retraining with
                            recent traffic pattern data to improve accuracy during peak hours by an
                            estimated 2-3%.
                          </p>
                          <div className="mt-3">
                            <Badge className="bg-blue-100 text-blue-800 text-xs">High Impact</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                          <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900 dark:text-green-100">
                            Dynamic Pricing Opportunity
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Dynamic pricing model identifies 15% revenue increase potential on
                            high-demand routes during peak seasons. Implement surge pricing
                            strategy.
                          </p>
                          <div className="mt-3">
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Revenue Growth
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                          <WrenchScrewdriverIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                            Predictive Maintenance Alert
                          </h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            Maintenance prediction model indicates 23% probability of brake system
                            failure in Vehicle #247 within 30 days. Schedule preventive maintenance
                            immediately.
                          </p>
                          <div className="mt-3">
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              Preventive Action
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                          <TruckIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-purple-900 dark:text-purple-100">
                            Route Optimization Insight
                          </h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                            Route optimization model suggests alternative routing for
                            Chicago-Atlanta lane could reduce fuel costs by 8% and improve delivery
                            times by 12%.
                          </p>
                          <div className="mt-3">
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              Cost Reduction
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Predictive Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Predictive Analytics & Forecasting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Demand Forecast</h4>
                          <Badge className="bg-blue-100 text-blue-800">Next 30 Days</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          AI models predict 28% increase in shipping demand for Q2 2025,
                          particularly in e-commerce and retail sectors. Consider capacity expansion
                          strategies.
                        </p>
                        <div className="text-sm">
                          <span className="font-medium">Recommendation:</span> Increase fleet
                          capacity by 15% or establish strategic partnerships to handle overflow
                          demand.
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Market Pricing Trends</h4>
                          <Badge className="bg-green-100 text-green-800">Next Quarter</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Dynamic pricing analysis indicates 12% average rate increase potential in
                          refrigerated transport due to seasonal produce demand and capacity
                          constraints.
                        </p>
                        <div className="text-sm">
                          <span className="font-medium">Recommendation:</span> Adjust pricing
                          strategy for refrigerated loads and prioritize temperature-controlled
                          equipment acquisition.
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Maintenance Cost Prediction</h4>
                          <Badge className="bg-yellow-100 text-yellow-800">Next 6 Months</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Predictive maintenance models forecast $45,000 in preventable maintenance
                          costs through early intervention on 8 vehicles showing early failure
                          indicators.
                        </p>
                        <div className="text-sm">
                          <span className="font-medium">Recommendation:</span> Implement proactive
                          maintenance schedule based on AI predictions to reduce emergency repairs
                          by 60%.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Model Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Model Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <CpuChipIcon className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">Deploy Customer Churn Prediction Model</h4>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">New Model</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Based on customer interaction patterns and payment history, deploy a churn
                          prediction model to identify at-risk customers and implement retention
                          strategies.
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm">Deploy Model</Button>
                          <Button size="sm" variant="outline">
                            Learn More
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <BeakerIcon className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium">Enhance Driver Performance Model</h4>
                          <Badge className="bg-green-100 text-green-800 text-xs">Enhancement</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Integrate telematics data with driver performance metrics to create a
                          comprehensive driver scoring system that predicts safety incidents and
                          fuel efficiency.
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm">Enhance Model</Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <AdjustmentsHorizontalIcon className="h-5 w-5 text-purple-600" />
                          <h4 className="font-medium">Optimize Load Matching Algorithm</h4>
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            Optimization
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Implement advanced load-to-truck matching using multi-objective
                          optimization to maximize revenue, minimize deadhead miles, and improve
                          driver satisfaction.
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm">Optimize Algorithm</Button>
                          <Button size="sm" variant="outline">
                            Simulate Results
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
