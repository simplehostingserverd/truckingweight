'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Equipment {
  id: number;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpires: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Out of Service';
  assignedToVehicle?: string;
  assignedToTrailer?: string;
  purchasePrice: number;
  currentValue: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDue?: string;
  notes?: string;
}

const equipmentTypes = [
  'GPS Tracking',
  'Tire Chains',
  'Tarp System',
  'Load Securement',
  'Safety Equipment',
  'Communication',
  'Other',
];

const statusOptions = [
  'Available',
  'In Use', 
  'Maintenance',
  'Out of Service',
];

export default function EditEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params.id as string;
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Equipment>>({});

  // Mock data - will be replaced with API calls
  const mockEquipment: Equipment[] = [
    {
      id: 1,
      name: 'GPS Tracker Pro',
      type: 'GPS Tracking',
      manufacturer: 'Garmin',
      model: 'Fleet 790',
      serialNumber: 'GPS001',
      purchaseDate: '2023-01-15',
      warrantyExpires: '2026-01-15',
      status: 'In Use',
      assignedToVehicle: 'Truck 001',
      purchasePrice: 1200,
      currentValue: 800,
      lastMaintenanceDate: '2024-06-15',
      nextMaintenanceDue: '2024-12-15',
    },
    {
      id: 2,
      name: 'Heavy Duty Tire Chains',
      type: 'Tire Chains',
      manufacturer: 'Pewag',
      model: 'Servo SUV',
      serialNumber: 'TC002',
      purchaseDate: '2023-03-20',
      warrantyExpires: '2025-03-20',
      status: 'Available',
      purchasePrice: 450,
      currentValue: 350,
      lastMaintenanceDate: '2024-01-10',
    },
  ];

  useEffect(() => {
    // Simulate API call to fetch equipment
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/equipment/${equipmentId}`);
        // const data = await response.json();
        
        const foundEquipment = mockEquipment.find(eq => eq.id === parseInt(equipmentId));
        if (foundEquipment) {
          setEquipment(foundEquipment);
          setFormData(foundEquipment);
        } else {
          toast.error('Equipment not found');
          router.push('/equipment');
        }
      } catch (error) {
        console.error('Error fetching equipment:', error);
        toast.error('Failed to load equipment');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [equipmentId, router]);

  const handleInputChange = (field: keyof Equipment, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/equipment/${equipmentId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to update equipment');
      // }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Equipment updated successfully');
      router.push('/equipment');
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error('Failed to update equipment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Equipment Not Found</h2>
          <p className="text-gray-600 mb-4">The equipment you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/equipment')}>Back to Equipment</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/equipment')}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Equipment
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Equipment</h1>
            <p className="text-gray-600">Update equipment information and settings</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Equipment identification and basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Equipment Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter equipment name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type || ''}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer || ''}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    placeholder="Manufacturer"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model || ''}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="Model"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber || ''}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  placeholder="Serial number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>Purchase and valuation details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate || ''}
                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="warrantyExpires">Warranty Expires</Label>
                  <Input
                    id="warrantyExpires"
                    type="date"
                    value={formData.warrantyExpires || ''}
                    onChange={(e) => handleInputChange('warrantyExpires', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice || ''}
                    onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currentValue">Current Value ($)</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    step="0.01"
                    value={formData.currentValue || ''}
                    onChange={(e) => handleInputChange('currentValue', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
              <CardDescription>Current assignment to vehicles or trailers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="assignedToVehicle">Assigned to Vehicle</Label>
                <Input
                  id="assignedToVehicle"
                  value={formData.assignedToVehicle || ''}
                  onChange={(e) => handleInputChange('assignedToVehicle', e.target.value)}
                  placeholder="Vehicle ID or name"
                />
              </div>
              
              <div>
                <Label htmlFor="assignedToTrailer">Assigned to Trailer</Label>
                <Input
                  id="assignedToTrailer"
                  value={formData.assignedToTrailer || ''}
                  onChange={(e) => handleInputChange('assignedToTrailer', e.target.value)}
                  placeholder="Trailer ID or name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Information */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance</CardTitle>
              <CardDescription>Maintenance schedule and history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lastMaintenanceDate">Last Maintenance Date</Label>
                <Input
                  id="lastMaintenanceDate"
                  type="date"
                  value={formData.lastMaintenanceDate || ''}
                  onChange={(e) => handleInputChange('lastMaintenanceDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="nextMaintenanceDue">Next Maintenance Due</Label>
                <Input
                  id="nextMaintenanceDue"
                  type="date"
                  value={formData.nextMaintenanceDue || ''}
                  onChange={(e) => handleInputChange('nextMaintenanceDue', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about this equipment..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/equipment')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}