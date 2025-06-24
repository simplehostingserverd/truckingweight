/**
 * Copyright (c) 2025 Cargo Scale Pro. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserIcon,
  TruckIcon,
  ClockIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Progress,
} from '@/components/ui';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const SafetyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const safetyMetrics = [
    { metric: 'Overall Safety Score', value: 98.7, target: 99.0, trend: 'up' },
    { metric: 'Incident-Free Days', value: 45, target: 60, trend: 'up' },
    { metric: 'Driver Compliance', value: 94.2, target: 95.0, trend: 'down' },
    { metric: 'Vehicle Inspections', value: 100, target: 100, trend: 'stable' },
  ];

  const incidentTrends = [
    { month: 'Aug', minor: 2, major: 1, critical: 0, total: 3 },
    { month: 'Sep', minor: 1, major: 0, critical: 0, total: 1 },
    { month: 'Oct', minor: 3, major: 0, critical: 0, total: 3 },
    { month: 'Nov', minor: 0, major: 0, critical: 0, total: 0 },
    { month: 'Dec', minor: 1, major: 0, critical: 0, total: 1 },
    { month: 'Jan', minor: 2, major: 0, critical: 0, total: 2 },
  ];

  const recentIncidents = [
    {
      id: 'INC-001',
      date: '2025-01-18',
      type: 'Minor Collision',
      driver: 'John Smith',
      vehicle: 'TRK-045',
      severity: 'minor',
      status: 'resolved',
      description: 'Backing incident in parking lot',
    },
    {
      id: 'INC-002',
      date: '2025-01-15',
      type: 'Traffic Violation',
      driver: 'Mike Wilson',
      vehicle: 'TRK-023',
      severity: 'minor',
      status: 'under_review',
      description: 'Speeding citation - 5 mph over limit',
    },
    {
      id: 'INC-003',
      date: '2025-01-12',
      type: 'Equipment Issue',
      driver: 'Sarah Johnson',
      vehicle: 'TRK-067',
      severity: 'minor',
      status: 'resolved',
      description: 'Brake light malfunction detected',
    },
  ];

  const driverSafetyScores = [
    { name: 'Lisa Davis', score: 98.5, violations: 0, training: 'current', status: 'excellent' },
    { name: 'John Smith', score: 92.1, violations: 1, training: 'current', status: 'good' },
    { name: 'Sarah Johnson', score: 89.7, violations: 0, training: 'due', status: 'good' },
    {
      name: 'Mike Wilson',
      score: 78.3,
      violations: 2,
      training: 'overdue',
      status: 'needs_improvement',
    },
    { name: 'Tom Brown', score: 95.2, violations: 0, training: 'current', status: 'excellent' },
  ];

  const trainingStatus = [
    { category: 'Defensive Driving', completed: 85, total: 100, percentage: 85 },
    { category: 'DOT Regulations', completed: 92, total: 100, percentage: 92 },
    { category: 'Hazmat Handling', completed: 78, total: 100, percentage: 78 },
    { category: 'Emergency Procedures', completed: 88, total: 100, percentage: 88 },
  ];

  const complianceChecks = [
    { check: 'Daily Vehicle Inspections', status: 'compliant', percentage: 100 },
    { check: 'Driver Hours Compliance', status: 'compliant', percentage: 98.5 },
    { check: 'Drug & Alcohol Testing', status: 'compliant', percentage: 100 },
    { check: 'Medical Certifications', status: 'warning', percentage: 94.2 },
    { check: 'License Renewals', status: 'compliant', percentage: 97.8 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'major':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'needs_improvement':
        return 'bg-red-100 text-red-800';
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrainingStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-green-100 text-green-800';
      case 'due':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Safety Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {safetyMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.metric}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.metric === 'Incident-Free Days'
                      ? metric.value
                      : `${metric.value}${metric.metric.includes('Score') || metric.metric.includes('Compliance') || metric.metric.includes('Inspections') ? '%' : ''}`}
                  </p>
                  <div className="flex items-center mt-1">
                    {metric.trend === 'up' && (
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    {metric.trend === 'down' && (
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-1" />
                    )}
                    <span
                      className={`text-sm ${
                        metric.trend === 'up'
                          ? 'text-green-600'
                          : metric.trend === 'down'
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                      }`}
                    >
                      Target: {metric.target}
                      {metric.metric.includes('Score') ||
                      metric.metric.includes('Compliance') ||
                      metric.metric.includes('Inspections')
                        ? '%'
                        : ''}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="drivers">Driver Safety</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incident Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Safety Incident Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incidentTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="minor" stackId="a" fill="#FCD34D" name="Minor" />
                      <Bar dataKey="major" stackId="a" fill="#F97316" name="Major" />
                      <Bar dataKey="critical" stackId="a" fill="#EF4444" name="Critical" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">8</div>
                    <div className="text-sm text-gray-600">Minor Incidents</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">1</div>
                    <div className="text-sm text-gray-600">Major Incidents</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Critical Incidents</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Training Completion Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingStatus.map((training, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{training.category}</span>
                        <span className="text-sm text-gray-600">
                          {training.completed}/{training.total} ({training.percentage}%)
                        </span>
                      </div>
                      <Progress value={training.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Next Training Session: January 25, 2025
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Emergency Response Procedures - 15 drivers scheduled
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Safety Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentIncidents.map(incident => (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">{incident.id}</TableCell>
                      <TableCell>{incident.date}</TableCell>
                      <TableCell>{incident.type}</TableCell>
                      <TableCell>{incident.driver}</TableCell>
                      <TableCell>{incident.vehicle}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Driver Safety Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Safety Score</TableHead>
                    <TableHead>Violations</TableHead>
                    <TableHead>Training Status</TableHead>
                    <TableHead>Overall Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverSafetyScores.map((driver, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                driver.score >= 95
                                  ? 'bg-green-500 w-full'
                                  : driver.score >= 85
                                    ? 'bg-yellow-500 w-5/6'
                                    : 'bg-red-500 w-3/4'
                              }`}
                            />
                          </div>
                          <span className="text-sm">{driver.score}</span>
                        </div>
                      </TableCell>
                      <TableCell>{driver.violations}</TableCell>
                      <TableCell>
                        <Badge className={getTrainingStatusColor(driver.training)}>
                          {driver.training}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(driver.status)}>
                          {driver.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceChecks.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <DocumentTextIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{check.check}</div>
                        <div className="text-sm text-gray-600">{check.percentage}% compliant</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(check.status)}>
                        {check.status.replace('_', ' ')}
                      </Badge>
                      {check.status === 'warning' && (
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      )}
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
};

export default SafetyDashboard;
