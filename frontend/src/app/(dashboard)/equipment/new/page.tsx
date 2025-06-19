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
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  TruckIcon,
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
import Link from 'next/link';

interface Vehicle {
  id: number;
  name: string;
  make: string;
  model: string;
}

interface Trailer {
  id: number;
  name: string;
  type: string;
}

export default function NewEquipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    description: '',
    purchaseDate: '',
    warrantyExpires: '',
    purchasePrice: '',
    assignmentType: 'none', // 'none', 'vehicle', 'trailer'
    assignedToVehicle: '',
    assignedToTrailer: '',
    location: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadVehiclesAndTrailers();
  }, []);

  const loadVehiclesAndTrailers = async () => {
    try {
      // Mock data - will be replaced with API calls
      const mockVehicles: Vehicle[] = [
        { id: 1, name: 'Freightliner #001', make: 'Freightliner', model: 'Cascadia' },
        { id: 2, name: 'Kenworth #002', make: 'Kenworth', model: 'T680' },
        { id: 3, name: 'Peterbilt #003', make: 'Peterbilt', model: '579' },
      ];

      const mockTrailers: Trailer[] = [
        { id: 1, name: 'TRL-001', type: 'Dry Van' },
        { id: 2, name: 'TRL-002', type: 'Reefer' },
        { id: 3, name: 'TRL-003', type: 'Flatbed' },
      ];

      setVehicles(mockVehicles);
      setTrailers(mockTrailers);
    } catch (error) {
      console.error('Error loading vehicles and trailers:', error);
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

    if (!formData.name.trim()) {
      newErrors.name = 'Equipment name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Equipment type is required';
    }

    if (formData.purchasePrice && isNaN(Number(formData.purchasePrice))) {
      newErrors.purchasePrice = 'Purchase price must be a valid number';
    }

    if (formData.purchaseDate) {
      const purchaseDate = new Date(formData.purchaseDate);
      if (purchaseDate > new Date()) {
        newErrors.purchaseDate = 'Purchase date cannot be in the future';
      }
    }

    if (formData.warrantyExpires && formData.purchaseDate) {
      const warrantyDate = new Date(formData.warrantyExpires);
      const purchaseDate = new Date(formData.purchaseDate);
      if (warrantyDate < purchaseDate) {
        newErrors.warrantyExpires = 'Warranty expiration cannot be before purchase date';
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
      const equipmentData = {
        ...formData,
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : null,
        assignedToVehicle:
          formData.assignmentType === 'vehicle' ? Number(formData.assignedToVehicle) : null,
        assignedToTrailer:
          formData.assignmentType === 'trailer' ? Number(formData.assignedToTrailer) : null,
        status: formData.assignmentType === 'none' ? 'available' : 'assigned',
      };

      // TODO: Replace with actual API call
      console.log('Creating equipment:', equipmentData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to equipment list
      router.push('/equipment');
    } catch (error) {
      console.error('Error creating equipment:', error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  const equipmentTypes = [
    { value: 'reefer_unit', label: 'Reefer Unit' },
    { value: 'lift_gate', label: 'Lift Gate' },
    { value: 'straps', label: 'Load Securing Straps' },
    { value: 'chains', label: 'Tire Chains' },
    { value: 'tarps', label: 'Tarp System' },
    { value: 'gps_tracker', label: 'GPS Tracker' },
    { value: 'dash_cam', label: 'Dash Camera' },
    { value: 'eld_device', label: 'ELD Device' },
    { value: 'tool_box', label: 'Tool Box' },
    { value: 'spare_tire', label: 'Spare Tire' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/equipment">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Equipment
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Add New Equipment</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add new equipment to your fleet inventory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Equipment Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Reefer Unit - Carrier X4"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="type">Equipment Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={value => handleInputChange('type', value)}
                >
                  <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              </div>

              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={e => handleInputChange('manufacturer', e.target.value)}
                  placeholder="e.g., Carrier, Waltco, Kinedyne"
                />
              </div>

              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={e => handleInputChange('model', e.target.value)}
                  placeholder="e.g., X4 7300, FXDM 44"
                />
              </div>

              <div>
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={e => handleInputChange('serialNumber', e.target.value)}
                  placeholder="e.g., CRR-X4-001"
                />
              </div>

              <div>
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Warehouse A, Bay 3"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Additional details about the equipment..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Purchase & Warranty Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Purchase & Warranty Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <div className="relative">
                  <CalendarIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={e => handleInputChange('purchaseDate', e.target.value)}
                    className={`pl-10 ${errors.purchaseDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.purchaseDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.purchaseDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                <div className="relative">
                  <CurrencyDollarIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={e => handleInputChange('purchasePrice', e.target.value)}
                    placeholder="0.00"
                    className={`pl-10 ${errors.purchasePrice ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.purchasePrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.purchasePrice}</p>
                )}
              </div>

              <div>
                <Label htmlFor="warrantyExpires">Warranty Expires</Label>
                <div className="relative">
                  <ShieldCheckIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="warrantyExpires"
                    type="date"
                    value={formData.warrantyExpires}
                    onChange={e => handleInputChange('warrantyExpires', e.target.value)}
                    className={`pl-10 ${errors.warrantyExpires ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.warrantyExpires && (
                  <p className="text-red-500 text-sm mt-1">{errors.warrantyExpires}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TruckIcon className="h-5 w-5 mr-2" />
              Assignment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="assignmentType">Assignment Type</Label>
              <Select
                value={formData.assignmentType}
                onValueChange={value => handleInputChange('assignmentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Assigned (Available)</SelectItem>
                  <SelectItem value="vehicle">Assign to Vehicle</SelectItem>
                  <SelectItem value="trailer">Assign to Trailer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.assignmentType === 'vehicle' && (
              <div>
                <Label htmlFor="assignedToVehicle">Assign to Vehicle</Label>
                <Select
                  value={formData.assignedToVehicle}
                  onValueChange={value => handleInputChange('assignedToVehicle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.name} - {vehicle.make} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.assignmentType === 'trailer' && (
              <div>
                <Label htmlFor="assignedToTrailer">Assign to Trailer</Label>
                <Select
                  value={formData.assignedToTrailer}
                  onValueChange={value => handleInputChange('assignedToTrailer', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trailer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trailers.map(trailer => (
                      <SelectItem key={trailer.id} value={trailer.id.toString()}>
                        {trailer.name} - {trailer.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes or special instructions..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/equipment">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Equipment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
