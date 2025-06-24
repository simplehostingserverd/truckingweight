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
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  email?: string;
  phone?: string;
  hireDate?: string;
  employeeId?: string;
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

export default function DriverQualificationDetailPage() {
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const driverId = params.id as string;

  const [qualification, setQualification] = useState<DriverQualification | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (driverId) {
      loadDriverQualification(driverId);
    }
  }, [driverId]);

  const loadDriverQualification = async (id: string) => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API call
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
          email: 'john.smith@company.com',
          phone: '(555) 123-4567',
          hireDate: '2023-01-15',
          employeeId: 'EMP001',
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
          email: 'mike.johnson@company.com',
          phone: '(555) 234-5678',
          hireDate: '2023-06-01',
          employeeId: 'EMP002',
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
          email: 'sarah.wilson@company.com',
          phone: '(555) 345-6789',
          hireDate: '2022-11-10',
          employeeId: 'EMP003',
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
          email: 'tom.rodriguez@company.com',
          phone: '(555) 456-7890',
          hireDate: '2023-03-20',
          employeeId: 'EMP004',
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

      const foundQualification = mockQualifications.find(q => q.driverId.toString() === id);
      setQualification(foundQualification || null);
    } catch (error) {
      console.error('Error loading driver qualification:', error);
    } finally {
      setLoading(false);
    }
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
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'expiring':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'expired':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'suspended':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    return expiry < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!qualification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Driver Qualification Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The requested driver qualification could not be found.
          </p>
          <Link href="/driver-qualifications">
            <Button>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Driver Qualifications
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/driver-qualifications">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Qualifications
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {qualification.driverName}
            </h1>
            <div className="flex items-center gap-2">
              {getStatusIcon(qualification.overallStatus)}
              <Badge className={getStatusColor(qualification.overallStatus)}>
                {qualification.overallStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Employee ID: {qualification.employeeId} • License: {qualification.licenseNumber}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/driver-qualifications/${driverId}/edit`}>
            <Button variant="outline">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Link href={`/driver-qualifications/${driverId}/training/new`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Training
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert for expiring/expired qualifications */}
      {(qualification.overallStatus === 'expiring' ||
        qualification.overallStatus === 'expired') && (
        <Alert variant="destructive" className="mb-6">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            {qualification.overallStatus === 'expired'
              ? 'This driver has expired qualifications and should not be assigned to routes until renewed.'
              : 'This driver has qualifications expiring soon. Please schedule renewals immediately.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Driver Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium">{qualification.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <p className="font-medium">{qualification.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hire Date</p>
              <p className="font-medium">
                {qualification.hireDate
                  ? new Date(qualification.hireDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              License Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">License Class</p>
              <p className="font-medium">{qualification.licenseClass}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">License Number</p>
              <p className="font-medium">{qualification.licenseNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expires</p>
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {new Date(qualification.licenseExpiry).toLocaleDateString()}
                </p>
                {isExpiringSoon(qualification.licenseExpiry) && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    Expiring Soon
                  </Badge>
                )}
                {isExpired(qualification.licenseExpiry) && (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Expired
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">HAZMAT Endorsement</span>
              <Badge variant={qualification.hazmatEndorsement ? 'default' : 'secondary'}>
                {qualification.hazmatEndorsement ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">TWIC Card</span>
              <Badge variant={qualification.twiccCard ? 'default' : 'secondary'}>
                {qualification.twiccCard ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">DOT Physical</span>
              <Badge variant={qualification.dotPhysical ? 'default' : 'secondary'}>
                {qualification.dotPhysical ? 'Current' : 'Expired'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
