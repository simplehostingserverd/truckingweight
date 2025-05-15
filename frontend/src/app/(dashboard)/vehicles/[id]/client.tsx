'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
  IdentificationIcon,
  CalendarIcon,
  ScaleIcon,
  PhotoIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadVehicleImage } from '@/utils/supabase/storage';
import { Database } from '@/types/supabase';
import ErrorBoundary from '@/components/ErrorBoundary';

interface VehicleDetailsProps {
  id: string;
  initialData?: any;
}

export default function VehicleDetailsClient({ id, initialData }: VehicleDetailsProps) {
  const [vehicle, setVehicle] = useState<any>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageType, setImageType] = useState('main');
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    if (!initialData) {
      fetchVehicleData();
    }
  }, [id, initialData]);

  const fetchVehicleData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get vehicle data
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select(
          `
          *,
          weights:weights(
            id,
            weight,
            date,
            time,
            status
          ),
          loads:loads(
            id,
            description,
            origin,
            destination,
            status
          )
        `
        )
        .eq('id', id)
        .single();

      if (vehicleError) {
        throw vehicleError;
      }

      setVehicle(vehicleData);
    } catch (err: any) {
      console.error('Error fetching vehicle data:', err);
      setError(err.message || 'Failed to load vehicle data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    try {
      setImageUploading(true);
      setError('');

      // Upload image to Supabase Storage
      const imageUrl = await uploadVehicleImage(parseInt(id), file, imageType);

      // Update vehicle record with new image URL
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({
          [`image_${imageType}_url`]: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setVehicle({
        ...vehicle,
        [`image_${imageType}_url`]: imageUrl,
      });

      // Show success message
      setSuccess(`Vehicle ${imageType} image uploaded successfully`);

      // Refresh the page data
      fetchVehicleData();
    } catch (err: any) {
      console.error('Error uploading vehicle image:', err);
      setError(err.message || 'Failed to upload vehicle image');
    } finally {
      setImageUploading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'out of service':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-8 mr-4" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Vehicle not found or you don't have access to it.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/vehicles">
            <Button>Back to Vehicles</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center">
            <Link
              href="/vehicles"
              className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{vehicle.name}</h1>
            <span
              className={`ml-4 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(vehicle.status)}`}
            >
              {vehicle.status}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchVehicleData}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </Button>
            <Link href={`/vehicles/${id}/edit`}>
              <Button>
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit Vehicle
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-900/20 border-green-800 text-green-300">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Details */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <TruckIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Type
                          </h3>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {vehicle.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <IdentificationIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            License Plate
                          </h3>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {vehicle.license_plate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <IdentificationIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            VIN
                          </h3>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {vehicle.vin || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <TruckIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Make & Model
                          </h3>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {vehicle.make && vehicle.model
                              ? `${vehicle.make} ${vehicle.model}`
                              : 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <CalendarIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Year
                          </h3>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {vehicle.year || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <ScaleIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Max Weight
                          </h3>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {vehicle.max_weight ? `${vehicle.max_weight} lbs` : 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Main Image */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Main Image</h3>
                        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                          {vehicle.image_main_url ? (
                            <img
                              src={vehicle.image_main_url}
                              alt={`${vehicle.name} - Main View`}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                              <TruckIcon className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            id="main-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              setImageType('main');
                              handleImageUpload(e);
                            }}
                          />
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById('main-image-upload')?.click()}
                            disabled={imageUploading}
                          >
                            <PhotoIcon className="h-5 w-5 mr-2" />
                            {vehicle.image_main_url ? 'Change Image' : 'Upload Image'}
                          </Button>
                        </div>
                      </div>

                      {/* Front Image */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Front View</h3>
                        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                          {vehicle.image_front_url ? (
                            <img
                              src={vehicle.image_front_url}
                              alt={`${vehicle.name} - Front View`}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                              <TruckIcon className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            id="front-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              setImageType('front');
                              handleImageUpload(e);
                            }}
                          />
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById('front-image-upload')?.click()}
                            disabled={imageUploading}
                          >
                            <PhotoIcon className="h-5 w-5 mr-2" />
                            {vehicle.image_front_url ? 'Change Image' : 'Upload Image'}
                          </Button>
                        </div>
                      </div>

                      {/* Side Image */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Side View</h3>
                        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                          {vehicle.image_side_url ? (
                            <img
                              src={vehicle.image_side_url}
                              alt={`${vehicle.name} - Side View`}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                              <TruckIcon className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            id="side-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              setImageType('side');
                              handleImageUpload(e);
                            }}
                          />
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById('side-image-upload')?.click()}
                            disabled={imageUploading}
                          >
                            <PhotoIcon className="h-5 w-5 mr-2" />
                            {vehicle.image_side_url ? 'Change Image' : 'Upload Image'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {imageUploading && (
                      <div className="mt-6 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                        <span>Uploading image...</span>
                      </div>
                    )}

                    <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                      <p>
                        <strong>Note:</strong> Images should be clear and show the vehicle from
                        different angles. Maximum file size is 5MB.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="weights">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="weights">Weight Records</TabsTrigger>
                        <TabsTrigger value="loads">Load History</TabsTrigger>
                      </TabsList>
                      <TabsContent value="weights" className="mt-4">
                        {vehicle.weights && vehicle.weights.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                              <thead>
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Weight
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {vehicle.weights.map((weight: any) => (
                                  <tr key={weight.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      {new Date(weight.date).toLocaleDateString()}
                                      {weight.time && ` ${weight.time}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      {weight.weight.toLocaleString()} lbs
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          weight.status === 'Compliant'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}
                                      >
                                        {weight.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      <Link
                                        href={`/weights/${weight.id}`}
                                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                      >
                                        View
                                      </Link>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No weight records found for this vehicle.
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="loads" className="mt-4">
                        {vehicle.loads && vehicle.loads.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                              <thead>
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Description
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Route
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {vehicle.loads.map((load: any) => (
                                  <tr key={load.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      {load.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      {load.origin} → {load.destination}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          load.status === 'Completed'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : load.status === 'In Progress'
                                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                        }`}
                                      >
                                        {load.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      <Link
                                        href={`/loads/${load.id}`}
                                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                      >
                                        View
                                      </Link>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No load history found for this vehicle.
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Vehicle Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {vehicle.image_main_url && (
                    <div className="flex justify-center">
                      <img
                        src={vehicle.image_main_url}
                        alt={vehicle.name}
                        className="h-48 w-auto object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                    <p
                      className={`mt-1 text-lg font-medium ${
                        vehicle.status === 'Active'
                          ? 'text-green-600 dark:text-green-400'
                          : vehicle.status === 'Maintenance'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {vehicle.status}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Weight Records
                    </h3>
                    <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                      {vehicle.weights?.length || 0}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Load History
                    </h3>
                    <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                      {vehicle.loads?.length || 0}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link href={`/weights/new?vehicle=${id}`}>
                      <Button className="w-full">
                        <ScaleIcon className="h-5 w-5 mr-2" />
                        Add Weight Record
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
