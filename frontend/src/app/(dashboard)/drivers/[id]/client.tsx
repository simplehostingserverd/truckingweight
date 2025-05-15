'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  ArrowLeftIcon,
  PencilIcon,
  UserIcon,
  IdentificationIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  TruckIcon,
  MapPinIcon,
  PhotoIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadDriverPhoto } from '@/utils/supabase/storage';
import { Database } from '@/types/supabase';
import ErrorBoundary from '@/components/ErrorBoundary';
import { formatDate } from '@/lib/utils';

interface DriverDetailsProps {
  id: string;
  initialData?: any;
}

export default function DriverDetailsClient({ id, initialData }: DriverDetailsProps) {
  const [driver, setDriver] = useState<any>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [photoUploading, setPhotoUploading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    if (!initialData) {
      fetchDriverData();
    }
  }, [id, initialData]);

  const fetchDriverData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get driver data
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select(
          `
          *,
          weights:weights(
            id,
            vehicle_id,
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

      if (driverError) {
        throw driverError;
      }

      setDriver(driverData);
    } catch (err: any) {
      console.error('Error fetching driver data:', err);
      setError(err.message || 'Failed to load driver data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Photo file size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    try {
      setPhotoUploading(true);
      setError('');

      // Upload photo to Supabase Storage
      const photoUrl = await uploadDriverPhoto(parseInt(id), file);

      // Update driver record with new photo URL
      const { error: updateError } = await supabase
        .from('drivers')
        .update({
          photo_url: photoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setDriver({
        ...driver,
        photo_url: photoUrl,
      });

      // Show success message
      setSuccess('Driver photo uploaded successfully');

      // Refresh the page data
      fetchDriverData();
    } catch (err: any) {
      console.error('Error uploading driver photo:', err);
      setError(err.message || 'Failed to upload driver photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'on leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'suspended':
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

  if (!driver) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Driver not found or you don't have access to it.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/drivers">
            <Button>Back to Drivers</Button>
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
              href="/drivers"
              className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{driver.name}</h1>
            <span
              className={`ml-4 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(driver.status)}`}
            >
              {driver.status}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchDriverData}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </Button>
            <Link href={`/drivers/${id}/edit`}>
              <Button>
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit Driver
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
          {/* Driver Details */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Driver Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Name
                          </h3>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {driver.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <IdentificationIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            License Number
                          </h3>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {driver.license_number}
                          </p>
                        </div>
                      </div>
                      {driver.license_expiry && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <CalendarIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              License Expiry
                            </h3>
                            <p className="text-base font-medium text-gray-900 dark:text-white">
                              {formatDate(driver.license_expiry)}
                            </p>
                          </div>
                        </div>
                      )}
                      {driver.phone && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <PhoneIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Phone
                            </h3>
                            <p className="text-base font-medium text-gray-900 dark:text-white">
                              {driver.phone}
                            </p>
                          </div>
                        </div>
                      )}
                      {driver.email && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Email
                            </h3>
                            <p className="text-base font-medium text-gray-900 dark:text-white">
                              {driver.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Driver History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="weights">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="weights">Weight Records</TabsTrigger>
                        <TabsTrigger value="loads">Load History</TabsTrigger>
                      </TabsList>
                      <TabsContent value="weights" className="mt-4">
                        {driver.weights && driver.weights.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                              <thead>
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Vehicle
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
                                {driver.weights.map((weight: any) => (
                                  <tr key={weight.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      {new Date(weight.date).toLocaleDateString()}
                                      {weight.time && ` ${weight.time}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      {weight.vehicle_id}
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
                            No weight records found for this driver.
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="loads" className="mt-4">
                        {driver.loads && driver.loads.length > 0 ? (
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
                                {driver.loads.map((load: any) => (
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
                            No load history found for this driver.
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Driver Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Document management coming soon.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Driver Profile */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Driver Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    {driver.photo_url ? (
                      <img
                        src={driver.photo_url}
                        alt={driver.name}
                        className="h-40 w-40 object-cover rounded-full border-4 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="h-40 w-40 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <UserIcon className="h-20 w-20 text-gray-400" />
                      </div>
                    )}

                    <div className="mt-4 w-full">
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        disabled={photoUploading}
                      >
                        <PhotoIcon className="h-5 w-5 mr-2" />
                        {driver.photo_url ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                      {photoUploading && (
                        <div className="mt-2 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                          <span className="text-sm text-gray-400">Uploading...</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2 text-center">Max file size: 2MB</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                    <p
                      className={`mt-1 text-lg font-medium ${
                        driver.status === 'Active'
                          ? 'text-green-600 dark:text-green-400'
                          : driver.status === 'On Leave'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {driver.status}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      License Expiry
                    </h3>
                    <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                      {driver.license_expiry ? formatDate(driver.license_expiry) : 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Contact
                    </h3>
                    <div className="mt-1 space-y-1">
                      {driver.phone && (
                        <p className="text-gray-900 dark:text-white flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-2 text-gray-500" />
                          {driver.phone}
                        </p>
                      )}
                      {driver.email && (
                        <p className="text-gray-900 dark:text-white flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-500" />
                          {driver.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link href={`/drivers/${id}/edit`}>
                      <Button className="w-full">
                        <PencilIcon className="h-5 w-5 mr-2" />
                        Edit Driver
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
