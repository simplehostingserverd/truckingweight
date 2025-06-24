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
import { logger } from '@/utils/logger';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

interface Driver {
  id: number;
  name: string;
  employeeId: string;
  licenseNumber: string;
  email: string;
}

export default function NewTrainingPage() {
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const driverId = params.id as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(false);
  const [driverLoading, setDriverLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    customType: '',
    description: '',
    instructor: '',
    instructorCompany: '',
    scheduledDate: '',
    completedDate: '',
    expiryDate: '',
    certificateNumber: '',
    cost: '',
    location: '',
    duration: '',
    notes: '',
    status: 'scheduled', // 'scheduled', 'completed', 'pending'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (driverId) {
      loadDriver(driverId);
    }
  }, [driverId]);

  const loadDriver = async (id: string) => {
    try {
      setDriverLoading(true);

      // Mock data - will be replaced with API call
      const mockDrivers: Driver[] = [
        {
          id: 1,
          name: 'John Smith',
          employeeId: 'EMP001',
          licenseNumber: 'DL123456789',
          email: 'john.smith@company.com',
        },
        {
          id: 2,
          name: 'Mike Johnson',
          employeeId: 'EMP002',
          licenseNumber: 'DL987654321',
          email: 'mike.johnson@company.com',
        },
        {
          id: 3,
          name: 'Sarah Wilson',
          employeeId: 'EMP003',
          licenseNumber: 'DL456789123',
          email: 'sarah.wilson@company.com',
        },
        {
          id: 4,
          name: 'Tom Rodriguez',
          employeeId: 'EMP004',
          licenseNumber: 'DL789123456',
          email: 'tom.rodriguez@company.com',
        },
      ];

      const foundDriver = mockDrivers.find(d => d.id.toString() === id);
      setDriver(foundDriver || null);
    } catch (error) {
      console.error('Error loading driver:', error);
    } finally {
      setDriverLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = 'Training type is required';
    }

    if (formData.type === 'other' && !formData.customType.trim()) {
      newErrors.customType = 'Custom training type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Training description is required';
    }

    if (!formData.instructor.trim()) {
      newErrors.instructor = 'Instructor name is required';
    }

    if (formData.status === 'completed' && !formData.completedDate) {
      newErrors.completedDate = 'Completion date is required for completed training';
    }

    if (formData.status === 'scheduled' && !formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required for scheduled training';
    }

    if (formData.cost && isNaN(Number(formData.cost))) {
      newErrors.cost = 'Cost must be a valid number';
    }

    if (formData.duration && isNaN(Number(formData.duration))) {
      newErrors.duration = 'Duration must be a valid number';
    }

    if (formData.scheduledDate && formData.completedDate) {
      const scheduledDate = new Date(formData.scheduledDate);
      const completedDate = new Date(formData.completedDate);
      if (completedDate < scheduledDate) {
        newErrors.completedDate = 'Completion date cannot be before scheduled date';
      }
    }

    if (formData.completedDate && formData.expiryDate) {
      const completedDate = new Date(formData.completedDate);
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= completedDate) {
        newErrors.expiryDate = 'Expiry date must be after completion date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare the data for submission
      const trainingData = {
        driverId: Number(driverId),
        type: formData.type === 'other' ? formData.customType : formData.type,
        description: formData.description,
        instructor: formData.instructor,
        instructorCompany: formData.instructorCompany,
        scheduledDate: formData.scheduledDate || null,
        completedDate: formData.completedDate || null,
        expiryDate: formData.expiryDate || null,
        certificateNumber: formData.certificateNumber || null,
        cost: formData.cost ? Number(formData.cost) : null,
        location: formData.location || null,
        duration: formData.duration ? Number(formData.duration) : null,
        notes: formData.notes || null,
        status: formData.status,
      };

      // TODO: Replace with actual API call
      logger.info('Creating training record', trainingData, 'TrainingForm');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect back to driver qualifications detail page
      router.push(`/driver-qualifications/${driverId}`);
    } catch (error) {
      console.error('Error creating training record:', error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  const trainingTypes = [
    { value: 'defensive_driving', label: 'Defensive Driving' },
    { value: 'hazmat_training', label: 'HAZMAT Training' },
    { value: 'safety_training', label: 'Safety Training' },
    { value: 'advanced_driving', label: 'Advanced Driving' },
    { value: 'first_aid_cpr', label: 'First Aid/CPR' },
    { value: 'dot_compliance', label: 'DOT Compliance' },
    { value: 'cargo_handling', label: 'Cargo Handling' },
    { value: 'vehicle_inspection', label: 'Vehicle Inspection' },
    { value: 'hours_of_service', label: 'Hours of Service (HOS)' },
    { value: 'winter_driving', label: 'Winter Driving' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'other', label: 'Other (Custom)' },
  ];

  if (driverLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Driver Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The requested driver could not be found.
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
        <Link href={`/driver-qualifications/${driverId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to {driver.name}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Add Training Record</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Schedule or record training for {driver.name}
          </p>
        </div>
      </div>

      {/* Driver Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Driver Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="font-medium">{driver.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
              <p className="font-medium">{driver.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">License Number</p>
              <p className="font-medium">{driver.licenseNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium">{driver.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Training Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              Training Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Training Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={value => handleInputChange('type', value)}
                >
                  <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select training type" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainingTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              </div>

              {formData.type === 'other' && (
                <div>
                  <Label htmlFor="customType">Custom Training Type *</Label>
                  <Input
                    id="customType"
                    value={formData.customType}
                    onChange={e => handleInputChange('customType', e.target.value)}
                    placeholder="Enter custom training type"
                    className={errors.customType ? 'border-red-500' : ''}
                  />
                  {errors.customType && (
                    <p className="text-red-500 text-sm mt-1">{errors.customType}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="status">Training Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={value => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Training Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Describe the training content and objectives..."
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Instructor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instructor">Instructor Name *</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={e => handleInputChange('instructor', e.target.value)}
                  placeholder="e.g., John Doe"
                  className={errors.instructor ? 'border-red-500' : ''}
                />
                {errors.instructor && (
                  <p className="text-red-500 text-sm mt-1">{errors.instructor}</p>
                )}
              </div>

              <div>
                <Label htmlFor="instructorCompany">Training Company/Organization</Label>
                <Input
                  id="instructorCompany"
                  value={formData.instructorCompany}
                  onChange={e => handleInputChange('instructorCompany', e.target.value)}
                  placeholder="e.g., Safety Training Institute"
                />
              </div>

              <div>
                <Label htmlFor="location">Training Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Main Office, Online, External Facility"
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  step="0.5"
                  value={formData.duration}
                  onChange={e => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 8"
                  className={errors.duration ? 'border-red-500' : ''}
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates and Certification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Dates and Certification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.status === 'scheduled' && (
                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={e => handleInputChange('scheduledDate', e.target.value)}
                    className={errors.scheduledDate ? 'border-red-500' : ''}
                  />
                  {errors.scheduledDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>
                  )}
                </div>
              )}

              {formData.status === 'completed' && (
                <div>
                  <Label htmlFor="completedDate">Completion Date *</Label>
                  <Input
                    id="completedDate"
                    type="date"
                    value={formData.completedDate}
                    onChange={e => handleInputChange('completedDate', e.target.value)}
                    className={errors.completedDate ? 'border-red-500' : ''}
                  />
                  {errors.completedDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.completedDate}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="expiryDate">Certification Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={e => handleInputChange('expiryDate', e.target.value)}
                  className={errors.expiryDate ? 'border-red-500' : ''}
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="certificateNumber">Certificate Number</Label>
                <Input
                  id="certificateNumber"
                  value={formData.certificateNumber}
                  onChange={e => handleInputChange('certificateNumber', e.target.value)}
                  placeholder="e.g., DDC-2024-001"
                />
              </div>

              <div>
                <Label htmlFor="cost">Training Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={e => handleInputChange('cost', e.target.value)}
                  placeholder="0.00"
                  className={errors.cost ? 'border-red-500' : ''}
                />
                {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes about the training..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Link href={`/driver-qualifications/${driverId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Training Record'}
          </Button>
        </div>
      </form>
    </div>
  );
}
