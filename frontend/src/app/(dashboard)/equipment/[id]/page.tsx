'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Available':
      return 'bg-green-100 text-green-800';
    case 'In Use':
      return 'bg-blue-100 text-blue-800';
    case 'Maintenance':
      return 'bg-yellow-100 text-yellow-800';
    case 'Out of Service':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function EquipmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params.id as string;
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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
      notes: 'High-precision GPS tracker with real-time monitoring capabilities.'
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
      notes: 'Heavy-duty tire chains for winter driving conditions.'
    }
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/equipment/${equipmentId}`, {
      //   method: 'DELETE',
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to delete equipment');
      // }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Equipment deleted successfully');
      router.push('/equipment');
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Failed to delete equipment');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
            <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
            <p className="text-gray-600">{equipment.manufacturer} {equipment.model}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/equipment/${equipment.id}/edit`)}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Equipment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <p className="text-sm text-gray-900">{equipment.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(equipment.status)}>
                    {equipment.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Manufacturer</label>
                <p className="text-sm text-gray-900">{equipment.manufacturer}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Model</label>
                <p className="text-sm text-gray-900">{equipment.model}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Serial Number</label>
              <p className="text-sm text-gray-900 font-mono">{equipment.serialNumber}</p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Purchase Date</label>
                <p className="text-sm text-gray-900">{formatDate(equipment.purchaseDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Warranty Expires</label>
                <p className="text-sm text-gray-900">{formatDate(equipment.warrantyExpires)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Purchase Price</label>
                <p className="text-sm text-gray-900 font-semibold">{formatCurrency(equipment.purchasePrice)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Value</label>
                <p className="text-sm text-gray-900 font-semibold">{formatCurrency(equipment.currentValue)}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Depreciation</label>
              <p className="text-sm text-red-600">
                {formatCurrency(equipment.purchasePrice - equipment.currentValue)} 
                ({(((equipment.purchasePrice - equipment.currentValue) / equipment.purchasePrice) * 100).toFixed(1)}%)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Assigned to Vehicle</label>
              <p className="text-sm text-gray-900">{equipment.assignedToVehicle || 'Not assigned'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Assigned to Trailer</label>
              <p className="text-sm text-gray-900">{equipment.assignedToTrailer || 'Not assigned'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Information */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Last Maintenance</label>
              <p className="text-sm text-gray-900">{formatDate(equipment.lastMaintenanceDate || '')}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Next Maintenance Due</label>
              <p className="text-sm text-gray-900">{formatDate(equipment.nextMaintenanceDue || '')}</p>
            </div>

            {equipment.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-sm text-gray-900">{equipment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}