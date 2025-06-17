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
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CalendarIcon,
  AcademicCapIcon,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import Link from 'next/link';

interface DriverQualification {
  id: number;
  driverId: number;
  driverName: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  medicalCertExpiry?: string;
  hazmatEndorsement: boolean;
  hazmatExpiry?: string;
  twiccCard: boolean;
  twiccExpiry?: string;
  dotPhysical: boolean;
  dotPhysicalExpiry?: string;
  drugTestDate?: string;
  drugTestResult?: 'pass' | 'fail' | 'pending';
  backgroundCheck: boolean;
  backgroundCheckDate?: string;
  trainingRecords: TrainingRecord[];
  violations: ViolationRecord[];
  overallStatus: 'qualified' | 'expiring' | 'expired' | 'suspended';
}

interface TrainingRecord {
  id: number;
  type: string;
  description: string;
  completedDate: string;
  expiryDate?: string;
  instructor?: string;
  certificateNumber?: string;
  status: 'completed' | 'expired' | 'pending';
}

interface ViolationRecord {
  id: number;
  type: string;
  description: string;
  date: string;
  severity: 'minor' | 'major' | 'serious';
  resolved: boolean;
  points?: number;
}

interface QualificationStats {
  totalDrivers: number;
  qualifiedDrivers: number;
  expiringQualifications: number;
  expiredQualifications: number;
  suspendedDrivers: number;
  hazmatCertified: number;
}

export default function DriverQualificationsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [qualifications, setQualifications] = useState<DriverQualification[]>([]);
  const [filteredQualifications, setFilteredQualifications] = useState<DriverQualification[]>([]);
  const [stats, setStats] = useState<QualificationStats>({
    totalDrivers: 0,
    qualifiedDrivers: 0,
    expiringQualifications: 0,
    expiredQualifications: 0,
    suspendedDrivers: 0,
    hazmatCertified: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [licenseClassFilter, setLicenseClassFilter] = useState('all');

  useEffect(() => {
    loadQualifications();
  }, []);

  useEffect(() => {
    filterQualifications();
  }, [qualifications, searchTerm, statusFilter, licenseClassFilter]);

  const loadQualifications = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockQualifications: DriverQualification[] = [
        {
          id: 1,
          driverId: 1,
          driverName: 'John Smith',
          licenseNumber: 'DL123456789',
          licenseClass: 'CDL-A',
          licenseExpiry: '2025-08-15',
          medicalCertExpiry: '2025-06-20',
          hazmatEndorsement: true,
          hazmatExpiry: '2025-12-10',
          twiccCard: true,
          twiccExpiry: '2026-03-15',
          dotPhysical: true,
          dotPhysicalExpiry: '2025-06-20',
          drugTestDate: '2024-12-15',
          drugTestResult: 'pass',
          backgroundCheck: true,
          backgroundCheckDate: '2024-01-10',
          trainingRecords: [
            {
              id: 1,
              type: 'Defensive Driving',
              description: 'Advanced defensive driving course',
              completedDate: '2024-11-15',
              expiryDate: '2025-11-15',
              instructor: 'Safety Training Institute',
              certificateNumber: 'DDC-2024-001',
              status: 'completed',
            },
            {
              id: 2,
              type: 'HAZMAT Training',
              description: 'Hazardous materials handling certification',
              completedDate: '2024-10-20',
              expiryDate: '2025-10-20',
              instructor: 'HAZMAT Safety Corp',
              certificateNumber: 'HMT-2024-045',
              status: 'completed',
            },
          ],
          violations: [],
          overallStatus: 'qualified',
        },
        {
          id: 2,
          driverId: 2,
          driverName: 'Mike Johnson',
          licenseNumber: 'DL987654321',
          licenseClass: 'CDL-B',
          licenseExpiry: '2025-03-20',
          medicalCertExpiry: '2025-02-15',
          hazmatEndorsement: false,
          twiccCard: false,
          dotPhysical: true,
          dotPhysicalExpiry: '2025-02-15',
          drugTestDate: '2025-01-05',
          drugTestResult: 'pass',
          backgroundCheck: true,
          backgroundCheckDate: '2024-06-15',
          trainingRecords: [
            {
              id: 3,
              type: 'Safety Training',
              description: 'Basic safety and compliance training',
              completedDate: '2024-09-10',
              expiryDate: '2025-09-10',
              instructor: 'Fleet Safety Academy',
              certificateNumber: 'FSA-2024-089',
              status: 'completed',
            },
          ],
          violations: [
            {
              id: 1,
              type: 'Speeding',
              description: 'Exceeded speed limit by 8 mph',
              date: '2024-08-15',
              severity: 'minor',
              resolved: true,
              points: 2,
            },
          ],
          overallStatus: 'expiring',
        },
        {
          id: 3,
          driverId: 3,
          driverName: 'Sarah Wilson',
          licenseNumber: 'DL456789123',
          licenseClass: 'CDL-A',
          licenseExpiry: '2026-01-10',
          medicalCertExpiry: '2025-12-05',
          hazmatEndorsement: true,
          hazmatExpiry: '2025-11-30',
          twiccCard: true,
          twiccExpiry: '2025-09-20',
          dotPhysical: true,
          dotPhysicalExpiry: '2025-12-05',
          drugTestDate: '2024-11-20',
          drugTestResult: 'pass',
          backgroundCheck: true,
          backgroundCheckDate: '2024-03-12',
          trainingRecords: [
            {
              id: 4,
              type: 'Advanced Driving',
              description: 'Advanced commercial vehicle operation',
              completedDate: '2024-12-01',
              expiryDate: '2026-12-01',
              instructor: 'Professional Drivers Institute',
              certificateNumber: 'PDI-2024-156',
              status: 'completed',
            },
          ],
          violations: [],
          overallStatus: 'qualified',
        },
        {
          id: 4,
          driverId: 4,
          driverName: 'Tom Rodriguez',
          licenseNumber: 'DL789123456',
          licenseClass: 'CDL-A',
          licenseExpiry: '2024-12-30',
          medicalCertExpiry: '2024-11-15',
          hazmatEndorsement: false,
          twiccCard: false,
          dotPhysical: false,
          drugTestDate: '2024-06-10',
          drugTestResult: 'pass',
          backgroundCheck: true,
          backgroundCheckDate: '2024-01-20',
          trainingRecords: [],
          violations: [
            {
              id: 2,
              type: 'HOS Violation',
              description: 'Exceeded daily driving limit',
              date: '2024-10-05',
              severity: 'major',
              resolved: false,
              points: 5,
            },
          ],
          overallStatus: 'expired',
        },
      ];

      const mockStats: QualificationStats = {
        totalDrivers: mockQualifications.length,
        qualifiedDrivers: mockQualifications.filter(q => q.overallStatus === 'qualified').length,
        expiringQualifications: mockQualifications.filter(q => q.overallStatus === 'expiring')
          .length,
        expiredQualifications: mockQualifications.filter(q => q.overallStatus === 'expired').length,
        suspendedDrivers: mockQualifications.filter(q => q.overallStatus === 'suspended').length,
        hazmatCertified: mockQualifications.filter(q => q.hazmatEndorsement).length,
      };

      setQualifications(mockQualifications);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading qualifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQualifications = () => {
    let filtered = qualifications;

    if (searchTerm) {
      filtered = filtered.filter(
        qual =>
          qual.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qual.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(qual => qual.overallStatus === statusFilter);
    }

    if (licenseClassFilter !== 'all') {
      filtered = filtered.filter(qual => qual.licenseClass === licenseClassFilter);
    }

    setFilteredQualifications(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'suspended':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'qualified':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'expiring':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'expired':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'suspended':
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Driver Qualifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage driver certifications, training, and compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/driver-qualifications/training">
            <Button variant="outline">
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              Schedule Training
            </Button>
          </Link>
          <Link href="/driver-qualifications/new">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Qualification
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Qualified Drivers
                </p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.qualifiedDrivers}</h3>
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
                  Expiring Soon
                </p>
                <h3 className="text-2xl font-bold mt-1 text-yellow-600">
                  {stats.expiringQualifications}
                </h3>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  HAZMAT Certified
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.hazmatCertified}</h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Expired/Suspended
                </p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">
                  {stats.expiredQualifications + stats.suspendedDrivers}
                </h3>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Expiring Qualifications Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-500" />
                Expiring Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualifications
                  .filter(q => q.overallStatus === 'expiring' || q.overallStatus === 'expired')
                  .slice(0, 5)
                  .map(qual => (
                    <div
                      key={qual.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{qual.driverName}</span>
                          <Badge className={getStatusColor(qual.overallStatus)}>
                            {qual.overallStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {qual.licenseClass} - {qual.licenseNumber}
                        </p>
                        <div className="text-xs text-gray-400 mt-1">
                          {isExpiringSoon(qual.licenseExpiry) && (
                            <span className="text-red-600">
                              License expires: {new Date(qual.licenseExpiry).toLocaleDateString()}
                            </span>
                          )}
                          {isExpiringSoon(qual.medicalCertExpiry) && (
                            <span className="text-red-600 ml-2">
                              Medical cert expires:{' '}
                              {qual.medicalCertExpiry &&
                                new Date(qual.medicalCertExpiry).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Link href={`/driver-qualifications/${qual.id}`}>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>License Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['CDL-A', 'CDL-B', 'CDL-C'].map(licenseClass => {
                    const count = qualifications.filter(
                      q => q.licenseClass === licenseClass
                    ).length;
                    return (
                      <div key={licenseClass} className="flex justify-between items-center">
                        <span className="text-gray-600">{licenseClass}</span>
                        <span className="font-medium">{count} drivers</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endorsements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">HAZMAT</span>
                    <span className="font-medium">{stats.hazmatCertified} drivers</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">TWIC Card</span>
                    <span className="font-medium">
                      {qualifications.filter(q => q.twiccCard).length} drivers
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">DOT Physical</span>
                    <span className="font-medium">
                      {qualifications.filter(q => q.dotPhysical).length} drivers
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="qualifications" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search drivers..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="expiring">Expiring</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={licenseClassFilter} onValueChange={setLicenseClassFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="License Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="CDL-A">CDL-A</SelectItem>
                    <SelectItem value="CDL-B">CDL-B</SelectItem>
                    <SelectItem value="CDL-C">CDL-C</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setLicenseClassFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Qualifications Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Driver Qualifications ({filteredQualifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Medical/DOT</TableHead>
                      <TableHead>Endorsements</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQualifications.map(qual => (
                      <TableRow key={qual.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{qual.driverName}</div>
                            <div className="text-sm text-gray-500">ID: {qual.driverId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{qual.licenseClass}</div>
                            <div className="text-sm text-gray-500">{qual.licenseNumber}</div>
                            <div
                              className={`text-xs ${isExpiringSoon(qual.licenseExpiry) ? 'text-red-600' : 'text-gray-400'}`}
                            >
                              Expires: {new Date(qual.licenseExpiry).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {qual.medicalCertExpiry && (
                              <div
                                className={`text-xs ${isExpiringSoon(qual.medicalCertExpiry) ? 'text-red-600' : 'text-gray-500'}`}
                              >
                                Medical: {new Date(qual.medicalCertExpiry).toLocaleDateString()}
                              </div>
                            )}
                            {qual.dotPhysical && qual.dotPhysicalExpiry && (
                              <div
                                className={`text-xs ${isExpiringSoon(qual.dotPhysicalExpiry) ? 'text-red-600' : 'text-gray-500'}`}
                              >
                                DOT: {new Date(qual.dotPhysicalExpiry).toLocaleDateString()}
                              </div>
                            )}
                            {qual.drugTestDate && (
                              <div className="text-xs text-gray-500">
                                Drug Test: {new Date(qual.drugTestDate).toLocaleDateString()}
                                {qual.drugTestResult && (
                                  <Badge
                                    className={`ml-1 text-xs ${qual.drugTestResult === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                  >
                                    {qual.drugTestResult}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {qual.hazmatEndorsement && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs">
                                HAZMAT
                                {qual.hazmatExpiry && isExpiringSoon(qual.hazmatExpiry) && (
                                  <span className="text-red-600 ml-1">!</span>
                                )}
                              </Badge>
                            )}
                            {qual.twiccCard && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                TWIC
                                {qual.twiccExpiry && isExpiringSoon(qual.twiccExpiry) && (
                                  <span className="text-red-600 ml-1">!</span>
                                )}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(qual.overallStatus)}
                            <Badge className={getStatusColor(qual.overallStatus)}>
                              {qual.overallStatus}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/driver-qualifications/${qual.id}`}>
                              <Button size="sm" variant="outline">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/driver-qualifications/${qual.id}/edit`}>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualifications
                  .flatMap(qual =>
                    qual.trainingRecords.map(training => ({
                      ...training,
                      driverName: qual.driverName,
                      driverId: qual.driverId,
                    }))
                  )
                  .slice(0, 10)
                  .map(training => (
                    <div
                      key={`${training.driverId}-${training.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{training.driverName}</span>
                          <Badge className="bg-blue-100 text-blue-800">{training.type}</Badge>
                          <Badge
                            className={
                              training.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {training.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{training.description}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          Completed: {new Date(training.completedDate).toLocaleDateString()}
                          {training.expiryDate && (
                            <span
                              className={`ml-2 ${isExpiringSoon(training.expiryDate) ? 'text-red-600' : ''}`}
                            >
                              Expires: {new Date(training.expiryDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Button size="sm" variant="outline">
                          <DocumentTextIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Violation Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualifications
                  .flatMap(qual =>
                    qual.violations.map(violation => ({
                      ...violation,
                      driverName: qual.driverName,
                      driverId: qual.driverId,
                    }))
                  )
                  .map(violation => (
                    <div
                      key={`${violation.driverId}-${violation.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{violation.driverName}</span>
                          <Badge
                            className={`${
                              violation.severity === 'serious'
                                ? 'bg-red-100 text-red-800'
                                : violation.severity === 'major'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {violation.severity}
                          </Badge>
                          <Badge
                            className={
                              violation.resolved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {violation.resolved ? 'Resolved' : 'Open'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {violation.type}: {violation.description}
                        </p>
                        <div className="text-xs text-gray-400 mt-1">
                          Date: {new Date(violation.date).toLocaleDateString()}
                          {violation.points && (
                            <span className="ml-2 text-red-600">{violation.points} points</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Button size="sm" variant="outline">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                {qualifications.every(qual => qual.violations.length === 0) && (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Violations
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All drivers have clean records with no violations.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
