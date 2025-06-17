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
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TruckIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  PlusIcon,
  PrinterIcon,
  XMarkIcon,
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
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
} from '@/components/ui';
import Link from 'next/link';

interface DVIRReport {
  id: number;
  driverId: number;
  driverName: string;
  vehicleId: number;
  vehicleNumber: string;
  trailerId?: number;
  trailerNumber?: string;
  inspectionDate: string;
  inspectionType: 'pre_trip' | 'post_trip' | 'en_route';
  odometer: number;
  engineHours: number;
  location: string;
  overallStatus: 'satisfactory' | 'defects_corrected' | 'defects_need_correction';
  defects: DVIRDefect[];
  inspectionItems: DVIRInspectionItem[];
  driverSignature?: string;
  mechanicSignature?: string;
  supervisorSignature?: string;
  certificationStatus: 'pending' | 'certified' | 'rejected';
  certifiedAt?: string;
  notes?: string;
  weatherConditions?: string;
  fuelLevel?: number;
  nextInspectionDue?: string;
}

interface DVIRDefect {
  id: number;
  category: string;
  item: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'open' | 'corrected' | 'deferred';
  correctedBy?: string;
  correctedAt?: string;
  correctionNotes?: string;
  requiresOutOfService: boolean;
}

interface DVIRInspectionItem {
  id: number;
  category: string;
  item: string;
  status: 'satisfactory' | 'defective' | 'not_applicable';
  notes?: string;
}

interface DVIRMetrics {
  totalInspections: number;
  satisfactoryInspections: number;
  inspectionsWithDefects: number;
  criticalDefects: number;
  pendingCorrections: number;
  complianceRate: number;
  avgInspectionTime: number;
  outOfServiceVehicles: number;
}

const INSPECTION_CATEGORIES = [
  {
    name: 'Engine Compartment',
    items: [
      'Engine Oil Level',
      'Coolant Level',
      'Power Steering Fluid',
      'Windshield Washer Fluid',
      'Battery',
      'Belts',
      'Hoses',
      'Air Filter',
    ],
  },
  {
    name: 'Cab/Interior',
    items: [
      'Steering Wheel',
      'Horn',
      'Windshield',
      'Mirrors',
      'Seat Belts',
      'Emergency Equipment',
      'Gauges',
      'Warning Lights',
    ],
  },
  {
    name: 'Lights & Electrical',
    items: [
      'Headlights',
      'Tail Lights',
      'Turn Signals',
      'Brake Lights',
      'Hazard Lights',
      'Clearance Lights',
      'Reflectors',
    ],
  },
  {
    name: 'Brakes',
    items: [
      'Service Brakes',
      'Parking Brake',
      'Brake Lines',
      'Brake Chambers',
      'Slack Adjusters',
      'Brake Drums/Rotors',
    ],
  },
  {
    name: 'Tires & Wheels',
    items: [
      'Tire Condition',
      'Tire Pressure',
      'Wheel Rims',
      'Lug Nuts',
      'Valve Stems',
      'Spare Tire',
    ],
  },
  {
    name: 'Suspension & Steering',
    items: ['Steering Components', 'Suspension System', 'Shock Absorbers', 'Springs', 'U-Bolts'],
  },
  {
    name: 'Exhaust System',
    items: ['Exhaust Pipes', 'Muffler', 'Exhaust Mounting', 'DEF System', 'DPF System'],
  },
  {
    name: 'Frame & Body',
    items: ['Frame', 'Body Panels', 'Doors', 'Bumpers', 'Mud Flaps', 'Steps', 'Handholds'],
  },
];

export default function DVIRPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dvirReports, setDvirReports] = useState<DVIRReport[]>([]);
  const [metrics, setMetrics] = useState<DVIRMetrics>({
    totalInspections: 0,
    satisfactoryInspections: 0,
    inspectionsWithDefects: 0,
    criticalDefects: 0,
    pendingCorrections: 0,
    complianceRate: 0,
    avgInspectionTime: 0,
    outOfServiceVehicles: 0,
  });
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDVIRData();
  }, [selectedDriver, selectedVehicle, selectedDate]);

  const loadDVIRData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockDVIRReports: DVIRReport[] = [
        {
          id: 1,
          driverId: 1,
          driverName: 'John Smith',
          vehicleId: 1,
          vehicleNumber: 'TRK-001',
          trailerId: 1,
          trailerNumber: 'TRL-001',
          inspectionDate: '2025-01-20T06:00:00Z',
          inspectionType: 'pre_trip',
          odometer: 125000,
          engineHours: 8500,
          location: 'Chicago Terminal',
          overallStatus: 'satisfactory',
          defects: [],
          inspectionItems: [
            {
              id: 1,
              category: 'Engine Compartment',
              item: 'Engine Oil Level',
              status: 'satisfactory',
            },
            { id: 2, category: 'Brakes', item: 'Service Brakes', status: 'satisfactory' },
            { id: 3, category: 'Tires & Wheels', item: 'Tire Condition', status: 'satisfactory' },
          ],
          driverSignature: 'John Smith',
          certificationStatus: 'certified',
          certifiedAt: '2025-01-20T06:15:00Z',
          notes: 'All systems checked and operational',
          weatherConditions: 'Clear',
          fuelLevel: 85,
          nextInspectionDue: '2025-01-21T06:00:00Z',
        },
        {
          id: 2,
          driverId: 2,
          driverName: 'Sarah Johnson',
          vehicleId: 2,
          vehicleNumber: 'TRK-002',
          inspectionDate: '2025-01-20T05:30:00Z',
          inspectionType: 'pre_trip',
          odometer: 98500,
          engineHours: 7200,
          location: 'Detroit Hub',
          overallStatus: 'defects_need_correction',
          defects: [
            {
              id: 1,
              category: 'Lights & Electrical',
              item: 'Brake Lights',
              description: 'Left rear brake light not functioning',
              severity: 'major',
              status: 'open',
              requiresOutOfService: false,
            },
            {
              id: 2,
              category: 'Tires & Wheels',
              item: 'Tire Pressure',
              description: 'Front right tire pressure low (75 PSI)',
              severity: 'minor',
              status: 'corrected',
              correctedBy: 'Mike Mechanic',
              correctedAt: '2025-01-20T07:00:00Z',
              correctionNotes: 'Tire inflated to proper pressure (110 PSI)',
              requiresOutOfService: false,
            },
          ],
          inspectionItems: [
            {
              id: 4,
              category: 'Lights & Electrical',
              item: 'Brake Lights',
              status: 'defective',
              notes: 'Left rear not working',
            },
            {
              id: 5,
              category: 'Tires & Wheels',
              item: 'Tire Pressure',
              status: 'defective',
              notes: 'Front right low',
            },
            {
              id: 6,
              category: 'Engine Compartment',
              item: 'Engine Oil Level',
              status: 'satisfactory',
            },
          ],
          driverSignature: 'Sarah Johnson',
          certificationStatus: 'pending',
          notes: 'Vehicle requires brake light repair before operation',
          weatherConditions: 'Light Rain',
          fuelLevel: 60,
        },
        {
          id: 3,
          driverId: 3,
          driverName: 'Mike Wilson',
          vehicleId: 3,
          vehicleNumber: 'TRK-003',
          inspectionDate: '2025-01-20T18:00:00Z',
          inspectionType: 'post_trip',
          odometer: 156200,
          engineHours: 9850,
          location: 'Boston Terminal',
          overallStatus: 'defects_corrected',
          defects: [
            {
              id: 3,
              category: 'Brakes',
              item: 'Brake Lines',
              description: 'Minor air leak in rear brake line',
              severity: 'major',
              status: 'corrected',
              correctedBy: 'Tom Technician',
              correctedAt: '2025-01-20T19:30:00Z',
              correctionNotes: 'Replaced faulty brake line fitting',
              requiresOutOfService: true,
            },
          ],
          inspectionItems: [
            {
              id: 7,
              category: 'Brakes',
              item: 'Brake Lines',
              status: 'defective',
              notes: 'Air leak detected',
            },
            {
              id: 8,
              category: 'Engine Compartment',
              item: 'Coolant Level',
              status: 'satisfactory',
            },
            {
              id: 9,
              category: 'Suspension & Steering',
              item: 'Steering Components',
              status: 'satisfactory',
            },
          ],
          driverSignature: 'Mike Wilson',
          mechanicSignature: 'Tom Technician',
          supervisorSignature: 'Jane Supervisor',
          certificationStatus: 'certified',
          certifiedAt: '2025-01-20T20:00:00Z',
          notes: 'Brake system repaired and tested. Vehicle cleared for service.',
          weatherConditions: 'Clear',
          fuelLevel: 45,
        },
      ];

      const mockMetrics: DVIRMetrics = {
        totalInspections: mockDVIRReports.length,
        satisfactoryInspections: mockDVIRReports.filter(r => r.overallStatus === 'satisfactory')
          .length,
        inspectionsWithDefects: mockDVIRReports.filter(r => r.defects.length > 0).length,
        criticalDefects: mockDVIRReports.reduce(
          (sum, r) => sum + r.defects.filter(d => d.severity === 'critical').length,
          0
        ),
        pendingCorrections: mockDVIRReports.reduce(
          (sum, r) => sum + r.defects.filter(d => d.status === 'open').length,
          0
        ),
        complianceRate: 92.5,
        avgInspectionTime: 15, // minutes
        outOfServiceVehicles: mockDVIRReports.filter(r =>
          r.defects.some(d => d.requiresOutOfService && d.status === 'open')
        ).length,
      };

      setDvirReports(mockDVIRReports);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading DVIR data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'satisfactory':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'defects_corrected':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'defects_need_correction':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'satisfactory':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'defects_corrected':
        return <WrenchScrewdriverIcon className="h-4 w-4 text-blue-500" />;
      case 'defects_need_correction':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClipboardDocumentListIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'major':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getDefectStatusColor = (status: string) => {
    switch (status) {
      case 'corrected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'open':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'deferred':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredReports = dvirReports.filter(report => {
    if (selectedDriver !== 'all' && report.driverId.toString() !== selectedDriver) return false;
    if (selectedVehicle !== 'all' && report.vehicleId.toString() !== selectedVehicle) return false;
    if (statusFilter !== 'all' && report.overallStatus !== statusFilter) return false;
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">DVIR Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Driver Vehicle Inspection Reports and defect management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <PrinterIcon className="h-5 w-5 mr-2" />
            Export Reports
          </Button>
          <Link href="/dvir/create">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              New Inspection
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Inspections
                </p>
                <h3 className="text-2xl font-bold mt-1 text-blue-600">
                  {metrics.totalInspections}
                </h3>
                <p className="text-xs text-gray-500">this period</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                <p className="text-xs text-gray-500">DOT compliance</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pending Corrections
                </p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">
                  {metrics.pendingCorrections}
                </h3>
                <p className="text-xs text-gray-500">open defects</p>
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
                  Out of Service
                </p>
                <h3 className="text-2xl font-bold mt-1 text-orange-600">
                  {metrics.outOfServiceVehicles}
                </h3>
                <p className="text-xs text-gray-500">vehicles</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full flex-shrink-0">
                <XMarkIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="defects">Defects</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Critical Defects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                Critical Defects Requiring Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dvirReports
                  .filter(r =>
                    r.defects.some(
                      d =>
                        d.status === 'open' && (d.severity === 'critical' || d.requiresOutOfService)
                    )
                  )
                  .map(report =>
                    report.defects
                      .filter(
                        d =>
                          d.status === 'open' &&
                          (d.severity === 'critical' || d.requiresOutOfService)
                      )
                      .map(defect => (
                        <div
                          key={`${report.id}-${defect.id}`}
                          className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{report.vehicleNumber}</span>
                              <Badge className={getSeverityColor(defect.severity)}>
                                {defect.severity}
                              </Badge>
                              <Badge variant="outline">{defect.category}</Badge>
                              {defect.requiresOutOfService && (
                                <Badge className="bg-red-100 text-red-800">Out of Service</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {defect.item}: {defect.description}
                            </p>
                            <p className="text-xs text-gray-400">
                              Driver: {report.driverName} •{' '}
                              {new Date(report.inspectionDate).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Button size="sm" className="mr-2">
                              Assign Repair
                            </Button>
                            <Button size="sm" variant="outline">
                              Details
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                {dvirReports.every(
                  r =>
                    !r.defects.some(
                      d =>
                        d.status === 'open' && (d.severity === 'critical' || d.requiresOutOfService)
                    )
                ) && (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Critical Defects
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All vehicles are in satisfactory condition for operation.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Inspections */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Inspections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dvirReports.slice(0, 5).map(report => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <TruckIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{report.vehicleNumber}</div>
                        <div className="text-sm text-gray-500">
                          Driver: {report.driverName} •{' '}
                          {report.inspectionType.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(report.inspectionDate).toLocaleString()} • {report.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-2 justify-center">
                        {getStatusIcon(report.overallStatus)}
                        <Badge className={getStatusColor(report.overallStatus)}>
                          {report.overallStatus.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      {report.defects.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {report.defects.length} defects found
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <Button size="sm" variant="outline">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vehicles</SelectItem>
                    <SelectItem value="1">TRK-001</SelectItem>
                    <SelectItem value="2">TRK-002</SelectItem>
                    <SelectItem value="3">TRK-003</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                    <SelectItem value="defects_corrected">Defects Corrected</SelectItem>
                    <SelectItem value="defects_need_correction">Needs Correction</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inspections Table */}
          <Card>
            <CardHeader>
              <CardTitle>DVIR Inspections ({filteredReports.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Defects</TableHead>
                      <TableHead>Certification</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map(report => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TruckIcon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{report.vehicleNumber}</div>
                              {report.trailerNumber && (
                                <div className="text-sm text-gray-500">
                                  + {report.trailerNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span className="font-medium">{report.driverName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {new Date(report.inspectionDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(report.inspectionDate).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {report.inspectionType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(report.overallStatus)}
                            <Badge className={getStatusColor(report.overallStatus)}>
                              {report.overallStatus.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.defects.length > 0 ? (
                            <div>
                              <span className="font-medium text-red-600">
                                {report.defects.length}
                              </span>
                              <div className="text-xs text-gray-500">
                                {report.defects.filter(d => d.status === 'open').length} open
                              </div>
                            </div>
                          ) : (
                            <span className="text-green-600">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              report.certificationStatus === 'certified'
                                ? 'bg-green-100 text-green-800'
                                : report.certificationStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {report.certificationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            {report.certificationStatus === 'pending' && (
                              <Button size="sm">Certify</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Defect Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dvirReports
                  .flatMap(report =>
                    report.defects.map(defect => ({
                      ...defect,
                      vehicleNumber: report.vehicleNumber,
                      driverName: report.driverName,
                      inspectionDate: report.inspectionDate,
                      reportId: report.id,
                    }))
                  )
                  .sort((a, b) => {
                    if (a.status === 'open' && b.status !== 'open') return -1;
                    if (a.status !== 'open' && b.status === 'open') return 1;
                    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
                    if (a.severity !== 'critical' && b.severity === 'critical') return 1;
                    return 0;
                  })
                  .map(defect => (
                    <div
                      key={`${defect.reportId}-${defect.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{defect.vehicleNumber}</span>
                          <Badge className={getSeverityColor(defect.severity)}>
                            {defect.severity}
                          </Badge>
                          <Badge className={getDefectStatusColor(defect.status)}>
                            {defect.status}
                          </Badge>
                          <Badge variant="outline">{defect.category}</Badge>
                          {defect.requiresOutOfService && (
                            <Badge className="bg-red-100 text-red-800">Out of Service</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">{defect.item}:</span> {defect.description}
                        </p>
                        <div className="text-xs text-gray-400 mt-1">
                          Found by: {defect.driverName} •{' '}
                          {new Date(defect.inspectionDate).toLocaleString()}
                          {defect.correctedBy && (
                            <span>
                              {' '}
                              • Corrected by: {defect.correctedBy} on{' '}
                              {defect.correctedAt && new Date(defect.correctedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {defect.correctionNotes && (
                          <p className="text-sm text-green-600 mt-1">
                            Correction: {defect.correctionNotes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {defect.status === 'open' && (
                          <Button size="sm" className="mr-2">
                            Mark Corrected
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                {dvirReports.every(r => r.defects.length === 0) && (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Defects Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All recent inspections show vehicles in satisfactory condition.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DVIR Reports & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Inspection Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Inspections:</span>
                        <span className="font-medium">{metrics.totalInspections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Satisfactory:</span>
                        <span className="font-medium text-green-600">
                          {metrics.satisfactoryInspections}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>With Defects:</span>
                        <span className="font-medium text-red-600">
                          {metrics.inspectionsWithDefects}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compliance Rate:</span>
                        <span className="font-medium text-green-600">
                          {metrics.complianceRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Inspection Time:</span>
                        <span className="font-medium">{metrics.avgInspectionTime} min</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Daily Inspection Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Defect Trend Analysis
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Vehicle Condition Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Driver Performance Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        DOT Compliance Report
                      </Button>
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
