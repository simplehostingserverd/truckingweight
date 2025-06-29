/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  ArrowLeftIcon,
  ClockIcon,
  TruckIcon,
  UserIcon,
  MapPinIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface Driver {
  id: number;
  name: string;
  licenseNumber: string;
}

interface Vehicle {
  id: number;
  vehicleNumber: string;
  make: string;
  model: string;
}

export default function CreateHOSLogPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    driverId: '',
    vehicleId: '',
    logDate: new Date().toISOString().split('T')[0],
    dutyStatus: '',
    startTime: '',
    endTime: '',
    location: '',
    odometer: '',
    engineHours: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock data for demonstration
      const mockDrivers: Driver[] = [
        { id: 1, name: 'Michael Rodriguez', licenseNumber: 'CDL-IL-847291' },
        { id: 2, name: 'Jennifer Chen', licenseNumber: 'CDL-IL-394756' },
        { id: 3, name: 'Robert Thompson', licenseNumber: 'CDL-IL-582947' },
        { id: 4, name: 'Sarah Martinez', licenseNumber: 'CDL-IL-739284' },
      ];

      const mockVehicles: Vehicle[] = [
        { id: 1, vehicleNumber: 'FL-2847', make: 'Freightliner', model: 'Cascadia Evolution' },
        { id: 2, vehicleNumber: 'PB-3947', make: 'Peterbilt', model: '579' },
        { id: 3, vehicleNumber: 'KW-5829', make: 'Kenworth', model: 'T680' },
        { id: 4, vehicleNumber: 'VL-7394', make: 'Volvo', model: 'VNL 860' },
      ];

      setDrivers(mockDrivers);
      setVehicles(mockVehicles);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.driverId || !formData.dutyStatus || !formData.startTime) {
        alert('Please fill in all required fields');
        return;
      }

      // In production, this would make an API call
      console.warn('Creating HOS log entry:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect back to HOS logs page
      router.push('/hos-logs');
    } catch (error) {
      console.error('Error creating HOS log:', error);
      alert('Failed to create HOS log entry');
    } finally {
      setLoading(false);
    }
  };

  const dutyStatusOptions = [
    { value: 'off_duty', label: 'Off Duty' },
    { value: 'sleeper_berth', label: 'Sleeper Berth' },
    { value: 'driving', label: 'Driving' },
    { value: 'on_duty_not_driving', label: 'On Duty (Not Driving)' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/hos-logs">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to HOS Logs
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Manual HOS Entry
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create a manual Hours of Service log entry
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              HOS Log Entry Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Driver and Vehicle Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    Driver *
                  </label>
                  <Select value={formData.driverId} onValueChange={(value) => handleInputChange('driverId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Driver" />
                    </SelectTrigger>
                    <SelectContent>
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      {drivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          {driver.name} - {driver.licenseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <TruckIcon className="h-4 w-4 inline mr-1" />
                    Vehicle
                  </label>
                  <Select value={formData.vehicleId} onValueChange={(value) => handleInputChange('vehicleId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          {vehicle.vehicleNumber} - {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date and Duty Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Log Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.logDate}
                    onChange={(e) => handleInputChange('logDate', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duty Status *
                  </label>
                  <Select value={formData.dutyStatus} onValueChange={(value) => handleInputChange('dutyStatus', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Duty Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {dutyStatusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time *
                  </label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                  />
                </div>
              </div>

              {/* Location and Vehicle Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPinIcon className="h-4 w-4 inline mr-1" />
                    Location
                  </label>
                  <Input
                    type="text"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Odometer
                  </label>
                  <Input
                    type="number"
                    placeholder="Miles"
                    value={formData.odometer}
                    onChange={(e) => handleInputChange('odometer', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Engine Hours
                  </label>
                  <Input
                    type="number"
                    placeholder="Hours"
                    value={formData.engineHours}
                    onChange={(e) => handleInputChange('engineHours', e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                  Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Additional notes or remarks..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link href="/hos-logs">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create HOS Entry'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
