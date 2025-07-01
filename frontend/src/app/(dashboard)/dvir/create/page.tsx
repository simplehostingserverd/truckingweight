/*
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved;
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System;
 * Unauthorized copying of this file, via any medium is strictly prohibited;
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission;
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  UserIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DVIRDefect {
  id: string;
  category: string;
  item: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  requiresOutOfService: boolean;
}

interface DVIRInspectionItem {
  id: string;
  category: string;
  item: string;
  status: 'satisfactory' | 'defective' | 'not_applicable';
  notes?: string;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
}

interface Vehicle {
  id: string;
  unitNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
}

interface Trailer {
  id: string;
  unitNumber: string;
  make: string;
  model: string;
  year: number;
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
      'Radiator',
      'Fan',
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
      'Wipers',
      'Heater/Defroster',
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
      'License Plate Light',
    ],
  },
  {
    name: 'Air Brake System',
    items: [
      'Service Brakes',
      'Parking Brake',
      'Brake Lines',
      'Brake Chambers',
      'Slack Adjusters',
      'Brake Drums/Rotors',
      'Air Compressor',
      'Air Tanks',
      'Low Air Warning',
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
      'Tire Tread Depth',
    ],
  },
  {
    name: 'Suspension & Steering',
    items: [
      'Steering Components',
      'Suspension System',
      'Shock Absorbers',
      'Springs',
      'U-Bolts',
      'King Pins',
      'Tie Rods',
    ],
  },
  {
    name: 'Exhaust System',
    items: [
      'Exhaust Pipes',
      'Muffler',
      'Exhaust Mounting',
      'DEF System',
      'DPF System',
      'SCR System',
    ],
  },
  {
    name: 'Frame & Body',
    items: [
      'Frame',
      'Body Panels',
      'Doors',
      'Bumpers',
      'Mud Flaps',
      'Steps',
      'Handholds',
      'Fuel Tank',
    ],
  },
  {
    name: 'Coupling System',
    items: [
      'Fifth Wheel',
      'Kingpin',
      'Safety Chains',
      'Electrical Connection',
      'Air Lines',
      'Landing Gear',
    ],
  },
];

export default function CreateDVIRPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  
  // Form state
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedTrailer, setSelectedTrailer] = useState<string>('');
  const [inspectionType, setInspectionType] = useState<'pre_trip' | 'post_trip' | 'en_route'>('pre_trip');
  const [odometer, setOdometer] = useState<string>('');
  const [engineHours, setEngineHours] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [fuelLevel, setFuelLevel] = useState<string>('');
  const [weatherConditions, setWeatherConditions] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  
  // Inspection items state
  const [inspectionItems, setInspectionItems] = useState<DVIRInspectionItem[]>([]);
  const [defects, setDefects] = useState<DVIRDefect[]>([]);
  const [overallStatus, setOverallStatus] = useState<'satisfactory' | 'defects_corrected' | 'defects_need_correction'>('satisfactory');
  
  // Signature state
  const [driverSignature, setDriverSignature] = useState<string>('');
  
  useEffect(() => {
    loadInitialData();
    initializeInspectionItems();
  }, []);
  
  const loadInitialData = async () => {
    try {
      // Load drivers, vehicles, and trailers
      // For now, using mock data - in production, these would come from API calls
      setDrivers([
        { id: '1', name: 'Michael Rodriguez', licenseNumber: 'CDL123456' },
        { id: '2', name: 'Sarah Johnson', licenseNumber: 'CDL789012' },
        { id: '3', name: 'David Chen', licenseNumber: 'CDL345678' },
        { id: '4', name: 'Maria Garcia', licenseNumber: 'CDL901234' },
      ]);
      
      setVehicles([
        { id: '1', unitNumber: 'FL-2847', make: 'Freightliner', model: 'Cascadia Evolution', year: 2023, vin: '1FUJGHDV8NLAA1234' },
        { id: '2', unitNumber: 'TRK-002', make: 'Peterbilt', model: '579', year: 2022, vin: '1XP5DB9X8ND123456' },
        { id: '3', unitNumber: 'VLV-001', make: 'Volvo', model: 'VNL 860', year: 2024, vin: '4V4NC9EH8PN123456' },
      ]);
      
      setTrailers([
        { id: '1', unitNumber: 'TRL-FL2847', make: 'Great Dane', model: 'Everest', year: 2023 },
        { id: '2', unitNumber: 'TRL-002', make: 'Utility', model: '4000DX', year: 2022 },
        { id: '3', unitNumber: 'TRL-003', make: 'Wabash', model: 'DuraPlate', year: 2024 },
      ]);
      
      // Set current location based on geolocation if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // In production, you would reverse geocode this to get address
            setLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
          },
          () => {
            setLocation('Location not available');
          }
        );
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data');
    }
  };
  
  const initializeInspectionItems = () => {
    const items: DVIRInspectionItem[] = [];
    INSPECTION_CATEGORIES.forEach((category) => {
      category.items.forEach((item, index) => {
        items.push({
          id: `${category.name}-${index}`,
          category: category.name,
          item,
          status: 'satisfactory',
        });
      });
    });
    setInspectionItems(items);
  };
  
  const updateInspectionItem = (itemId: string, status: 'satisfactory' | 'defective' | 'not_applicable', notes?: string) => {
    setInspectionItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, status, notes }
          : item
      )
    );
    
    // If marked as defective, create a defect entry
    if (status === 'defective') {
      const item = inspectionItems.find(i => i.id === itemId);
      if (item && !defects.find(d => d.id === itemId)) {
        const newDefect: DVIRDefect = {
          id: itemId,
          category: item.category,
          item: item.item,
          description: notes || 'Defect noted during inspection',
          severity: 'minor',
          requiresOutOfService: false,
        };
        setDefects(prev => [...prev, newDefect]);
      }
    } else {
      // Remove defect if status changed from defective
      setDefects(prev => prev.filter(d => d.id !== itemId));
    }
  };
  
  const updateDefect = (defectId: string, updates: Partial<DVIRDefect>) => {
    setDefects(prev => 
      prev.map(defect => 
        defect.id === defectId 
          ? { ...defect, ...updates }
          : defect
      )
    );
  };
  
  const removeDefect = (defectId: string) => {
    setDefects(prev => prev.filter(d => d.id !== defectId));
    // Also update the corresponding inspection item
    setInspectionItems(prev => 
      prev.map(item => 
        item.id === defectId 
          ? { ...item, status: 'satisfactory', notes: undefined }
          : item
      )
    );
  };
  
  const addCustomDefect = () => {
    const newDefect: DVIRDefect = {
      id: `custom-${Date.now()}`,
      category: 'Other',
      item: 'Custom Issue',
      description: '',
      severity: 'minor',
      requiresOutOfService: false,
    };
    setDefects(prev => [...prev, newDefect]);
  };
  
  const validateForm = (): boolean => {
    if (!selectedDriver) {
      toast.error('Please select a driver');
      return false;
    }
    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return false;
    }
    if (!odometer) {
      toast.error('Please enter odometer reading');
      return false;
    }
    if (!location) {
      toast.error('Please enter inspection location');
      return false;
    }
    if (!driverSignature) {
      toast.error('Driver signature is required');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Determine overall status based on defects
      let finalStatus: 'satisfactory' | 'defects_corrected' | 'defects_need_correction' = 'satisfactory';
      if (defects.length > 0) {
        const hasUncorrectedDefects = defects.some(d => d.severity === 'critical' || d.requiresOutOfService);
        finalStatus = hasUncorrectedDefects ? 'defects_need_correction' : 'defects_corrected';
      }
      
      const dvirData = {
        driverId: parseInt(selectedDriver),
        vehicleId: parseInt(selectedVehicle),
        trailerId: selectedTrailer ? parseInt(selectedTrailer) : undefined,
        inspectionDate: new Date().toISOString(),
        inspectionType,
        odometer: parseInt(odometer),
        engineHours: engineHours ? parseInt(engineHours) : undefined,
        location,
        overallStatus: finalStatus,
        defects,
        inspectionItems,
        driverSignature,
        notes: generalNotes,
        weatherConditions,
        fuelLevel: fuelLevel ? parseInt(fuelLevel) : undefined,
      };
      
      // In production, this would be an API call
      console.log('DVIR Data to submit:', dvirData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('DVIR report created successfully!');
      router.push('/dvir');
      
    } catch (error) {
      console.error('Error creating DVIR report:', error);
      toast.error('Failed to create DVIR report');
    } finally {
      setLoading(false);
    }
  };
  
  const criticalDefects = defects.filter(d => d.severity === 'critical' || d.requiresOutOfService);
  const hasDefects = defects.length > 0;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dvir">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to DVIR
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create DVIR Report</h1>
            <p className="text-gray-600">Driver Vehicle Inspection Report</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasDefects && (
            <Badge variant={criticalDefects.length > 0 ? "destructive" : "secondary"}>
              {defects.length} Defect{defects.length !== 1 ? 's' : ''}
              {criticalDefects.length > 0 && ` (${criticalDefects.length} Critical)`}
            </Badge>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="basic-info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
          <TabsTrigger value="inspection">Inspection Items</TabsTrigger>
          <TabsTrigger value="defects">Defects & Issues</TabsTrigger>
          <TabsTrigger value="signature">Signature & Submit</TabsTrigger>
        </TabsList>
        
        {/* Basic Information Tab */}
        <TabsContent value="basic-info" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Driver & Vehicle Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Driver & Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="driver">Driver *</Label>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} - {driver.licenseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="vehicle">Vehicle *</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.unitNumber} - {vehicle.year} {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="trailer">Trailer (Optional)</Label>
                  <Select value={selectedTrailer} onValueChange={setSelectedTrailer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trailer (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No trailer</SelectItem>
                      {trailers.map((trailer) => (
                        <SelectItem key={trailer.id} value={trailer.id}>
                          {trailer.unitNumber} - {trailer.year} {trailer.make} {trailer.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* Inspection Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                  Inspection Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Inspection Type *</Label>
                  <RadioGroup value={inspectionType} onValueChange={(value: any) => setInspectionType(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pre_trip" id="pre_trip" />
                      <Label htmlFor="pre_trip">Pre-Trip</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="post_trip" id="post_trip" />
                      <Label htmlFor="post_trip">Post-Trip</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="en_route" id="en_route" />
                      <Label htmlFor="en_route">En-Route</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="odometer">Odometer Reading *</Label>
                    <Input
                      id="odometer"
                      type="number"
                      placeholder="Miles"
                      value={odometer}
                      onChange={(e) => setOdometer(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="engineHours">Engine Hours</Label>
                    <Input
                      id="engineHours"
                      type="number"
                      placeholder="Hours"
                      value={engineHours}
                      onChange={(e) => setEngineHours(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="location">Inspection Location *</Label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fuelLevel">Fuel Level (%)</Label>
                  <Input
                    id="fuelLevel"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    value={fuelLevel}
                    onChange={(e) => setFuelLevel(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="weather">Weather Conditions</Label>
                  <Select value={weatherConditions} onValueChange={setWeatherConditions}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select weather" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">Clear</SelectItem>
                      <SelectItem value="cloudy">Cloudy</SelectItem>
                      <SelectItem value="rain">Rain</SelectItem>
                      <SelectItem value="snow">Snow</SelectItem>
                      <SelectItem value="fog">Fog</SelectItem>
                      <SelectItem value="wind">Windy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="notes">General Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes..."
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Inspection Items Tab */}
        <TabsContent value="inspection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Inspection Checklist</CardTitle>
              <p className="text-sm text-gray-600">
                Mark each item as Satisfactory, Defective, or Not Applicable. Add notes for any defective items.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {INSPECTION_CATEGORIES.map((category) => {
                  const categoryItems = inspectionItems.filter(item => item.category === category.name);
                  const defectiveCount = categoryItems.filter(item => item.status === 'defective').length;
                  
                  return (
                    <div key={category.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          {category.name === 'Engine Compartment' && <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />}
                          {category.name === 'Cab/Interior' && <TruckIcon className="h-5 w-5 mr-2" />}
                          {category.name}
                        </h3>
                        {defectiveCount > 0 && (
                          <Badge variant="destructive">
                            {defectiveCount} Defect{defectiveCount !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid gap-4">
                        {categoryItems.map((item) => (
                          <div key={item.id} className="border rounded p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{item.item}</span>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id={`${item.id}-satisfactory`}
                                    name={item.id}
                                    checked={item.status === 'satisfactory'}
                                    onChange={() => updateInspectionItem(item.id, 'satisfactory')}
                                    className="text-green-600"
                                  />
                                  <Label htmlFor={`${item.id}-satisfactory`} className="text-green-600">
                                    Satisfactory
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id={`${item.id}-defective`}
                                    name={item.id}
                                    checked={item.status === 'defective'}
                                    onChange={() => updateInspectionItem(item.id, 'defective')}
                                    className="text-red-600"
                                  />
                                  <Label htmlFor={`${item.id}-defective`} className="text-red-600">
                                    Defective
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id={`${item.id}-na`}
                                    name={item.id}
                                    checked={item.status === 'not_applicable'}
                                    onChange={() => updateInspectionItem(item.id, 'not_applicable')}
                                    className="text-gray-600"
                                  />
                                  <Label htmlFor={`${item.id}-na`} className="text-gray-600">
                                    N/A
                                  </Label>
                                </div>
                              </div>
                            </div>
                            
                            {item.status === 'defective' && (
                              <div>
                                <Label htmlFor={`${item.id}-notes`}>Defect Description</Label>
                                <Textarea
                                  id={`${item.id}-notes`}
                                  placeholder="Describe the defect..."
                                  value={item.notes || ''}
                                  onChange={(e) => updateInspectionItem(item.id, 'defective', e.target.value)}
                                  rows={2}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Defects Tab */}
        <TabsContent value="defects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Defects & Issues ({defects.length})
                </span>
                <Button onClick={addCustomDefect} variant="outline" size="sm">
                  Add Custom Defect
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {defects.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Defects Found</h3>
                  <p className="text-gray-600">All inspection items are satisfactory.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {defects.map((defect) => (
                    <div key={defect.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{defect.category}</Badge>
                            <Badge 
                              variant={defect.severity === 'critical' ? 'destructive' : 
                                     defect.severity === 'major' ? 'secondary' : 'outline'}
                            >
                              {defect.severity}
                            </Badge>
                            {defect.requiresOutOfService && (
                              <Badge variant="destructive">Out of Service</Badge>
                            )}
                          </div>
                          <h4 className="font-medium">{defect.item}</h4>
                        </div>
                        <Button
                          onClick={() => removeDefect(defect.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Defect Description</Label>
                          <Textarea
                            value={defect.description}
                            onChange={(e) => updateDefect(defect.id, { description: e.target.value })}
                            placeholder="Describe the defect in detail..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label>Severity Level</Label>
                            <Select 
                              value={defect.severity} 
                              onValueChange={(value: any) => updateDefect(defect.id, { severity: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minor">Minor</SelectItem>
                                <SelectItem value="major">Major</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`oos-${defect.id}`}
                              checked={defect.requiresOutOfService}
                              onCheckedChange={(checked) => 
                                updateDefect(defect.id, { requiresOutOfService: !!checked })
                              }
                            />
                            <Label htmlFor={`oos-${defect.id}`} className="text-sm">
                              Requires Out of Service
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Signature & Submit Tab */}
        <TabsContent value="signature" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Inspection Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Driver:</span>
                    <p>{drivers.find(d => d.id === selectedDriver)?.name || 'Not selected'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Vehicle:</span>
                    <p>{vehicles.find(v => v.id === selectedVehicle)?.unitNumber || 'Not selected'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Inspection Type:</span>
                    <p className="capitalize">{inspectionType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Odometer:</span>
                    <p>{odometer ? `${odometer} miles` : 'Not entered'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>
                    <p>{location || 'Not entered'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Defects Found:</span>
                    <p>{defects.length}</p>
                  </div>
                </div>
                
                {defects.length > 0 && (
                  <div>
                    <span className="font-medium">Defect Summary:</span>
                    <ul className="mt-2 space-y-1">
                      {defects.map((defect) => (
                        <li key={defect.id} className="text-sm flex items-center">
                          <Badge 
                            variant={defect.severity === 'critical' ? 'destructive' : 'secondary'}
                            className="mr-2"
                          >
                            {defect.severity}
                          </Badge>
                          {defect.item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Signature */}
            <Card>
              <CardHeader>
                <CardTitle>Driver Certification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="signature">Driver Signature *</Label>
                  <Input
                    id="signature"
                    placeholder="Type your full name to sign"
                    value={driverSignature}
                    onChange={(e) => setDriverSignature(e.target.value)}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    By typing your name, you certify that this inspection was performed by you and the information is accurate.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Driver Certification Statement</h4>
                  <p className="text-sm text-gray-700">
                    I hereby certify that the above-named vehicle has been inspected by me and that the defects noted above have been corrected or that the defects noted above do not affect the safe operation of the vehicle.
                  </p>
                </div>
                
                {criticalDefects.length > 0 && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                      <h4 className="font-medium text-red-800">Critical Defects Found</h4>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      This vehicle has critical defects that require immediate attention before operation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Ready to Submit DVIR Report</h3>
                  <p className="text-sm text-gray-600">
                    Please review all information before submitting. This report will be saved and cannot be modified after submission.
                  </p>
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !selectedDriver || !selectedVehicle || !driverSignature}
                  size="lg"
                  className="min-w-[150px]"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <>Submit DVIR Report</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}