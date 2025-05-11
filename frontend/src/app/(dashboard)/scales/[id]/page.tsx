'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeftIcon, PencilIcon, TrashIcon, QrCodeIcon, ScaleIcon } from '@heroicons/react/24/outline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { QRCodeSVG } from 'qrcode.react';
import HardwareSelector from '@/components/scales/HardwareSelector';
import { toSearchParamString } from '@/lib/utils';
import type { Database } from '@/types/supabase';

export default function ScaleDetail({ params }: { params: { id: string } }) {
  const [scale, setScale] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  // Safely convert the ID parameter to a string
  const id = toSearchParamString(params.id, '');

  useEffect(() => {
    const fetchScale = async () => {
      try {
        // Get session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        // Get scale data
        const { data, error } = await supabase
          .from('scales')
          .select(`
            *,
            companies(
              id,
              name
            ),
            scale_calibrations(
              id,
              calibration_date,
              next_calibration_date,
              calibrated_by,
              notes
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setScale(data);

        // Fetch QR code
        const response = await fetch(`/api/scales/${id}/qrcode`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const qrData = await response.json();
          if (qrData.qrCode) {
            setQrCode(qrData.qrCode);
          }
        }
      } catch (err: any) {
        console.error('Error fetching scale:', err);
        setError('Failed to load scale data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScale();
  }, [id, router, supabase]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase.from('scales').delete().eq('id', id);

      if (error) {
        throw error;
      }

      router.push('/scales');
    } catch (err: any) {
      console.error('Error deleting scale:', err);
      setError('Failed to delete scale');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link
            href="/scales"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Scales
          </Link>
        </div>
      </div>
    );
  }

  if (!scale) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>The requested scale could not be found.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link
            href="/scales"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Scales
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{scale.name}</h1>
          <div className="flex space-x-2">
            <Link href={`/scales/${id}/edit`}>
              <Button variant="outline" size="sm">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="hardware">Hardware</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scale Information</CardTitle>
                <CardDescription>Details about this scale</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{scale.scale_type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                    <p className="mt-1 text-sm">
                      <Badge variant={scale.status === 'Active' ? 'success' : 'destructive'}>
                        {scale.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{scale.location || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{scale.companies?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Manufacturer</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{scale.manufacturer || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Model</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{scale.model || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Serial Number</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{scale.serial_number || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Max Capacity</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {scale.max_capacity ? `${scale.max_capacity.toLocaleString()} lbs` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Precision</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {scale.precision ? `${scale.precision} lbs` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Calibration</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {scale.calibration_date ? new Date(scale.calibration_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Calibration</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {scale.next_calibration_date ? new Date(scale.next_calibration_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hardware" className="space-y-4">
            <HardwareSelector scaleId={parseInt(id)} />
          </TabsContent>
          
          <TabsContent value="qrcode" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scale QR Code</CardTitle>
                <CardDescription>Scan this QR code to quickly select this scale for weighing</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {qrCode ? (
                  <div className="bg-white p-6 rounded-lg">
                    <img src={qrCode} alt="Scale QR Code" className="w-64 h-64" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8">
                    <QrCodeIcon className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-500">QR code not available</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" onClick={() => window.print()}>
                  Print QR Code
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Link
            href="/scales"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Scales
          </Link>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this scale? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
