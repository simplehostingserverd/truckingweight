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
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FireIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrophyIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';

interface SafetyScore {
  id: number;
  driverId: number;
  driverName: string;
  vehicleId?: number;
  vehicleNumber?: string;
  overallScore: number;
  scoreDate: string;
  scoreComponents: {
    hosCompliance: number;
    drivingBehavior: number;
    vehicleInspection: number;
    accidentHistory: number;
    violationHistory: number;
    trainingCompletion: number;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  violations: SafetyViolation[];
  accidents: SafetyAccident[];
  trainingRecords: TrainingRecord[];
  lastUpdate: string;
  trend: 'improving' | 'declining' | 'stable';
  benchmarkComparison: number; // percentage compared to fleet average
}

interface SafetyViolation {
  id: number;
  type:
    | 'speeding'
    | 'hos_violation'
    | 'inspection_failure'
    | 'equipment_violation'
    | 'documentation';
  severity: 'minor' | 'major' | 'severe';
  description: string;
  date: string;
  location?: string;
  fineAmount?: number;
  pointsAssessed: number;
  status: 'open' | 'resolved' | 'contested';
}

interface SafetyAccident {
  id: number;
  type: 'collision' | 'injury' | 'property_damage' | 'near_miss';
  severity: 'minor' | 'major' | 'severe' | 'fatal';
  description: string;
  date: string;
  location: string;
  damageAmount?: number;
  injuriesReported: number;
  preventable: boolean;
  investigationStatus: 'pending' | 'completed' | 'closed';
}

interface TrainingRecord {
  id: number;
  trainingType: string;
  completionDate: string;
  expirationDate?: string;
  score?: number;
  certificateNumber?: string;
  instructor?: string;
  status: 'completed' | 'expired' | 'pending';
}

interface SafetyMetrics {
  fleetAverageScore: number;
  totalDrivers: number;
  highRiskDrivers: number;
  recentViolations: number;
  recentAccidents: number;
  complianceRate: number;
  improvementTrend: number;
  trainingCompletionRate: number;
}

export default function SafetyPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [safetyScores, setSafetyScores] = useState<SafetyScore[]>([]);
  const [metrics, setMetrics] = useState<SafetyMetrics>({
    fleetAverageScore: 0,
    totalDrivers: 0,
    highRiskDrivers: 0,
    recentViolations: 0,
    recentAccidents: 0,
    complianceRate: 0,
    improvementTrend: 0,
    trainingCompletionRate: 0,
  });
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSafetyData();
  }, [selectedDriver, selectedPeriod]);

  const loadSafetyData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockSafetyScores: SafetyScore[] = [
        {
          id: 1,
          driverId: 1,
          driverName: 'Michael Rodriguez',
          vehicleId: 1,
          vehicleNumber: 'FL-2847',
          overallScore: 96,
          scoreDate: '2025-01-20',
          scoreComponents: {
            hosCompliance: 98,
            drivingBehavior: 94,
            vehicleInspection: 97,
            accidentHistory: 100,
            violationHistory: 92,
            trainingCompletion: 95,
          },
          riskLevel: 'low',
          violations: [],
          accidents: [],
          trainingRecords: [
            {
              id: 1,
              trainingType: 'Advanced Defensive Driving Certification',
              completionDate: '2024-12-15',
              expirationDate: '2025-12-15',
              score: 98,
              certificateNumber: 'ADC-2024-FL2847',
              status: 'completed',
            },
            {
              id: 2,
              trainingType: 'DOT Safety Regulations Update',
              completionDate: '2024-11-20',
              expirationDate: '2025-11-20',
              score: 94,
              certificateNumber: 'DSR-2024-FL2847',
              status: 'completed',
            },
          ],
          lastUpdate: '2025-01-20T10:00:00Z',
          trend: 'improving',
          benchmarkComparison: 112, // 12% above fleet average
        },
        {
          id: 2,
          driverId: 2,
          driverName: 'Sarah Johnson',
          vehicleId: 2,
          vehicleNumber: 'TRK-002',
          overallScore: 78,
          scoreDate: '2025-01-20',
          scoreComponents: {
            hosCompliance: 82,
            drivingBehavior: 75,
            vehicleInspection: 88,
            accidentHistory: 70,
            violationHistory: 65,
            trainingCompletion: 90,
          },
          riskLevel: 'medium',
          violations: [
            {
              id: 1,
              type: 'speeding',
              severity: 'minor',
              description: 'Exceeded speed limit by 8 mph',
              date: '2025-01-15',
              location: 'I-94, Michigan',
              fineAmount: 150,
              pointsAssessed: 2,
              status: 'resolved',
            },
          ],
          accidents: [
            {
              id: 1,
              type: 'collision',
              severity: 'minor',
              description: 'Rear-ended at traffic light',
              date: '2024-12-20',
              location: 'Detroit, MI',
              damageAmount: 2500,
              injuriesReported: 0,
              preventable: true,
              investigationStatus: 'completed',
            },
          ],
          trainingRecords: [
            {
              id: 2,
              trainingType: 'Safety Awareness',
              completionDate: '2024-11-10',
              expirationDate: '2025-11-10',
              score: 88,
              status: 'completed',
            },
          ],
          lastUpdate: '2025-01-20T10:00:00Z',
          trend: 'declining',
          benchmarkComparison: 92, // 8% below fleet average
        },
        {
          id: 3,
          driverId: 3,
          driverName: 'Mike Wilson',
          vehicleId: 3,
          vehicleNumber: 'TRK-003',
          overallScore: 65,
          scoreDate: '2025-01-20',
          scoreComponents: {
            hosCompliance: 60,
            drivingBehavior: 55,
            vehicleInspection: 75,
            accidentHistory: 50,
            violationHistory: 45,
            trainingCompletion: 70,
          },
          riskLevel: 'high',
          violations: [
            {
              id: 2,
              type: 'hos_violation',
              severity: 'major',
              description: 'Exceeded 11-hour driving limit',
              date: '2025-01-18',
              pointsAssessed: 5,
              status: 'open',
            },
            {
              id: 3,
              type: 'speeding',
              severity: 'major',
              description: 'Exceeded speed limit by 15 mph',
              date: '2025-01-10',
              location: 'I-75, Ohio',
              fineAmount: 300,
              pointsAssessed: 4,
              status: 'resolved',
            },
          ],
          accidents: [
            {
              id: 2,
              type: 'collision',
              severity: 'major',
              description: 'Side-swipe collision during lane change',
              date: '2024-12-05',
              location: 'Columbus, OH',
              damageAmount: 8500,
              injuriesReported: 1,
              preventable: true,
              investigationStatus: 'completed',
            },
          ],
          trainingRecords: [
            {
              id: 3,
              trainingType: 'HOS Compliance',
              completionDate: '2024-10-15',
              expirationDate: '2025-10-15',
              score: 72,
              status: 'completed',
            },
          ],
          lastUpdate: '2025-01-20T10:00:00Z',
          trend: 'declining',
          benchmarkComparison: 77, // 23% below fleet average
        },
      ];

      const mockMetrics: SafetyMetrics = {
        fleetAverageScore: 85,
        totalDrivers: mockSafetyScores.length,
        highRiskDrivers: mockSafetyScores.filter(
          s => s.riskLevel === 'high' || s.riskLevel === 'critical'
        ).length,
        recentViolations: mockSafetyScores.reduce(
          (sum, s) => sum + s.violations.filter(v => v.status === 'open').length,
          0
        ),
        recentAccidents: mockSafetyScores.reduce(
          (sum, s) =>
            sum +
            s.accidents.filter(
              a => new Date(a.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length,
          0
        ),
        complianceRate: 87.5,
        improvementTrend: 5.2, // percentage improvement
        trainingCompletionRate: 92.3,
      };

      setSafetyScores(mockSafetyScores);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackgroundColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 80) return 'bg-blue-100 dark:bg-blue-900/30';
    if (score >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (score >= 60) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      case 'critical':
        return <FireIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ShieldCheckIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '➡️';
    }
  };

  const filteredScores = safetyScores.filter(score => {
    if (selectedDriver !== 'all' && score.driverId.toString() !== selectedDriver) return false;
    if (riskFilter !== 'all' && score.riskLevel !== riskFilter) return false;
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Safety Scores & Performance
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Driver safety monitoring, risk assessment, and performance tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Safety Report
          </Button>
          <Button>
            <TrophyIcon className="h-5 w-5 mr-2" />
            Safety Awards
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Fleet Average Score
                </p>
                <h3
                  className={`text-2xl font-bold mt-1 ${getScoreColor(metrics.fleetAverageScore)}`}
                >
                  {metrics.fleetAverageScore}
                </h3>
                <p className="text-xs text-gray-500">out of 100</p>
              </div>
              <div
                className={`p-3 rounded-full flex-shrink-0 ${getScoreBackgroundColor(metrics.fleetAverageScore)}`}
              >
                <ShieldCheckIcon
                  className={`h-6 w-6 ${getScoreColor(metrics.fleetAverageScore)}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  High Risk Drivers
                </p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">{metrics.highRiskDrivers}</h3>
                <p className="text-xs text-gray-500">require attention</p>
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Compliance Rate
                </p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">
                  {metrics.complianceRate}%
                </h3>
                <p className="text-xs text-gray-500">overall compliance</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Training Completion
                </p>
                <h3 className="text-2xl font-bold mt-1 text-blue-600">
                  {metrics.trainingCompletionRate}%
                </h3>
                <p className="text-xs text-gray-500">completion rate</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <SparklesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Safety Dashboard</TabsTrigger>
          <TabsTrigger value="scores">Driver Scores</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* High Risk Drivers Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                High Risk Drivers Requiring Immediate Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safetyScores
                  .filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical')
                  .map(score => (
                    <div
                      key={score.id}
                      className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <UserIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{score.driverName}</span>
                            <Badge className={getRiskColor(score.riskLevel)}>
                              {score.riskLevel.toUpperCase()} RISK
                            </Badge>
                            <span className="text-sm">{getTrendIcon(score.trend)}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Vehicle: {score.vehicleNumber} • Score: {score.overallScore}/100
                          </div>
                          <div className="text-xs text-gray-400">
                            {score.violations.filter(v => v.status === 'open').length} open
                            violations •
                            {
                              score.accidents.filter(
                                a =>
                                  new Date(a.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                              ).length
                            }{' '}
                            recent accidents
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(score.overallScore)}`}>
                          {score.overallScore}
                        </div>
                        <Button size="sm" className="mt-2">
                          Action Plan
                        </Button>
                      </div>
                    </div>
                  ))}
                {safetyScores.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical')
                  .length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No High Risk Drivers
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All drivers are currently within acceptable safety parameters.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Safety Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safetyScores
                    .sort((a, b) => b.overallScore - a.overallScore)
                    .slice(0, 3)
                    .map((score, index) => (
                      <div
                        key={score.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : index === 1
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{score.driverName}</div>
                            <div className="text-sm text-gray-500">{score.vehicleNumber}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getScoreColor(score.overallScore)}`}>
                            {score.overallScore}
                          </div>
                          <div className="text-xs text-gray-500">
                            {score.benchmarkComparison}% vs fleet avg
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Safety Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safetyScores
                    .flatMap(score => [
                      ...score.violations
                        .filter(
                          v => new Date(v.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        )
                        .map(v => ({
                          type: 'violation',
                          driverName: score.driverName,
                          description: v.description,
                          date: v.date,
                          severity: v.severity,
                        })),
                      ...score.accidents
                        .filter(
                          a => new Date(a.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        )
                        .map(a => ({
                          type: 'accident',
                          driverName: score.driverName,
                          description: a.description,
                          date: a.date,
                          severity: a.severity,
                        })),
                    ])
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map((event, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div
                          className={`p-2 rounded-lg ${
                            event.type === 'violation'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30'
                              : 'bg-red-100 dark:bg-red-900/30'
                          }`}
                        >
                          {event.type === 'violation' ? (
                            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <FireIcon className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{event.driverName}</div>
                          <div className="text-sm text-gray-600">{event.description}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(event.date).toLocaleDateString()} • {event.severity}{' '}
                            {event.type}
                          </div>
                        </div>
                      </div>
                    ))}
                  {safetyScores.every(
                    s =>
                      s.violations.filter(
                        v => new Date(v.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length === 0 &&
                      s.accidents.filter(
                        a => new Date(a.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length === 0
                  ) && (
                    <div className="text-center py-4">
                      <CheckCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No recent safety events</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scores" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Drivers</SelectItem>
                    <SelectItem value="1">John Smith</SelectItem>
                    <SelectItem value="2">Sarah Johnson</SelectItem>
                    <SelectItem value="3">Mike Wilson</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="critical">Critical Risk</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Driver Safety Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScores.map(score => (
              <Card key={score.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      {score.driverName}
                    </div>
                    <div className="flex items-center gap-1">
                      {getRiskIcon(score.riskLevel)}
                      <span className="text-sm">{getTrendIcon(score.trend)}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(score.overallScore)}`}>
                        {score.overallScore}
                      </div>
                      <Badge className={getRiskColor(score.riskLevel)}>
                        {score.riskLevel.toUpperCase()} RISK
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {score.benchmarkComparison}% vs fleet average
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>HOS Compliance</span>
                        <span className={getScoreColor(score.scoreComponents.hosCompliance)}>
                          {score.scoreComponents.hosCompliance}%
                        </span>
                      </div>
                      <Progress value={score.scoreComponents.hosCompliance} className="h-2" />

                      <div className="flex justify-between text-sm">
                        <span>Driving Behavior</span>
                        <span className={getScoreColor(score.scoreComponents.drivingBehavior)}>
                          {score.scoreComponents.drivingBehavior}%
                        </span>
                      </div>
                      <Progress value={score.scoreComponents.drivingBehavior} className="h-2" />

                      <div className="flex justify-between text-sm">
                        <span>Vehicle Inspection</span>
                        <span className={getScoreColor(score.scoreComponents.vehicleInspection)}>
                          {score.scoreComponents.vehicleInspection}%
                        </span>
                      </div>
                      <Progress value={score.scoreComponents.vehicleInspection} className="h-2" />
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{score.vehicleNumber}</span>
                        <span>{new Date(score.lastUpdate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {(score.violations.length > 0 || score.accidents.length > 0) && (
                      <div className="pt-2">
                        {score.violations.filter(v => v.status === 'open').length > 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs mr-2">
                            {score.violations.filter(v => v.status === 'open').length} violations
                          </Badge>
                        )}
                        {score.accidents.filter(
                          a => new Date(a.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                        ).length > 0 && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            {
                              score.accidents.filter(
                                a =>
                                  new Date(a.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                              ).length
                            }{' '}
                            accidents
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Safety Violations Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safetyScores
                  .flatMap(score =>
                    score.violations.map(violation => ({
                      ...violation,
                      driverName: score.driverName,
                      vehicleNumber: score.vehicleNumber,
                    }))
                  )
                  .sort((a, b) => {
                    if (a.status === 'open' && b.status !== 'open') return -1;
                    if (a.status !== 'open' && b.status === 'open') return 1;
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                  })
                  .map(violation => (
                    <div
                      key={`${violation.driverName}-${violation.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{violation.driverName}</span>
                          <Badge
                            className={
                              violation.severity === 'severe'
                                ? 'bg-red-100 text-red-800'
                                : violation.severity === 'major'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {violation.severity}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {violation.type.replace('_', ' ')}
                          </Badge>
                          <Badge
                            className={
                              violation.status === 'open'
                                ? 'bg-red-100 text-red-800'
                                : violation.status === 'resolved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {violation.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{violation.description}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          Date: {new Date(violation.date).toLocaleDateString()} • Vehicle:{' '}
                          {violation.vehicleNumber} • Points: {violation.pointsAssessed}
                          {violation.fineAmount && ` • Fine: $${violation.fineAmount}`}
                          {violation.location && ` • Location: ${violation.location}`}
                        </div>
                      </div>
                      <div className="text-right">
                        {violation.status === 'open' && (
                          <Button size="sm" className="mr-2">
                            Resolve
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                {safetyScores.every(s => s.violations.length === 0) && (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Violations Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All drivers are currently in compliance with safety regulations.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Safety Training Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safetyScores
                  .flatMap(score =>
                    score.trainingRecords.map(training => ({
                      ...training,
                      driverName: score.driverName,
                      vehicleNumber: score.vehicleNumber,
                    }))
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()
                  )
                  .map(training => (
                    <div
                      key={`${training.driverName}-${training.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{training.driverName}</span>
                          <Badge variant="outline">{training.trainingType}</Badge>
                          <Badge
                            className={
                              training.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : training.status === 'expired'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {training.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Completed: {new Date(training.completionDate).toLocaleDateString()}
                          {training.expirationDate && (
                            <span>
                              {' '}
                              • Expires: {new Date(training.expirationDate).toLocaleDateString()}
                            </span>
                          )}
                          {training.score && <span> • Score: {training.score}%</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Vehicle: {training.vehicleNumber}
                          {training.certificateNumber &&
                            ` • Certificate: ${training.certificateNumber}`}
                          {training.instructor && ` • Instructor: ${training.instructor}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <Button size="sm" variant="outline">
                          View Certificate
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
