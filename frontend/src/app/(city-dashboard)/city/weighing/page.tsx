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

import React from 'react';
// Global type declarations
declare function alert(message?: any): void;

import { useState, useEffect } from 'react';
import {
  ScaleIcon,
  TruckIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  CameraIcon,
  QrCodeIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function CityWeighingPage() {
  const [scales, setScales] = useState<any[]>([]);
  const [selectedScale, setSelectedScale] = useState<string>('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [tareWeight, setTareWeight] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [permitNumber, setPermitNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');

  useEffect(() => {
    fetchScales();
  }, []);

  const fetchScales = async () => {
    setIsLoading(true);
    setError('');

    try {
      const cityToken = localStorage.getItem('cityToken');

      if (!cityToken) {
        throw new Error('No authentication token found');
      }

      // Fetch scales
      const response = await fetch('/api/city-scales', {
        headers: {
          Authorization: `Bearer ${cityToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scales');
      }

      const data = await response.json();
      setScales(data.scales);

      // Set first active scale as default
      const activeScales = data.scales.filter(
        (scale: unknown) => scale.status === 'Active'
      );
      if (activeScales.length > 0) {
        setSelectedScale(activeScales[0].id.toString());
      }
    } catch (err: unknown) {
      console.error('Error fetching scales:', err);
      setError(err.message || 'Failed to load scales');

      // Use dummy data for demo
      const dummyScales = [
        { id: 1, name: 'Main Street Scale', status: 'Active', max_capacity: 80000 },
        { id: 2, name: 'Highway 35 Scale', status: 'Active', max_capacity: 100000 },
        { id: 3, name: 'Downtown Scale', status: 'Maintenance', max_capacity: 60000 },
      ];

      setScales(dummyScales);
      setSelectedScale('1');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNetWeight = () => {
    if (grossWeight && tareWeight) {
      const gross = parseFloat(grossWeight);
      const tare = parseFloat(tareWeight);

      if (!isNaN(gross) && !isNaN(tare) && gross >= tare) {
        const net = gross - tare;
        setNetWeight(net.toString());
      } else {
        setNetWeight('');
      }
    } else {
      setNetWeight('');
    }
  };

  useEffect(() => {
    calculateNetWeight();
  }, [grossWeight, tareWeight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const cityToken = localStorage.getItem('cityToken');

      if (!cityToken) {
        throw new Error('No authentication token found');
      }

      // Validate required fields
      if (!selectedScale || !vehicleInfo || !grossWeight) {
        throw new Error('Scale, vehicle information, and gross weight are required');
      }

      // Prepare data
      const weighData = {
        scaleId: parseInt(selectedScale),
        vehicleInfo,
        driverName: driverName || undefined,
        companyName: companyName || undefined,
        grossWeight: parseFloat(grossWeight),
        tareWeight: tareWeight ? parseFloat(tareWeight) : undefined,
        netWeight: netWeight ? parseFloat(netWeight) : undefined,
        permitNumber: permitNumber || undefined,
        notes: notes || undefined,
      };

      // Submit weigh ticket
      const response = await fetch('/api/city-weigh-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cityToken}`,
        },
        body: JSON.stringify(weighData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to create weigh ticket');
      }

      const data = await response.json();
      setTicketNumber(data.ticket.ticketNumber);
      setSuccess('Weigh ticket created successfully!');
      setShowTicketDialog(true);

      // Reset form
      resetForm();
    } catch (err: unknown) {
      console.error('Error creating weigh ticket:', err);
      setError(err.message || 'Failed to create weigh ticket');

      // For demo purposes, create a dummy ticket
      if (process.env.NODE_ENV !== 'production') {
        const dummyTicket = `CWT-001-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        setTicketNumber(dummyTicket);
        setSuccess('Demo mode: Weigh ticket created successfully!');
        setShowTicketDialog(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setVehicleInfo('');
    setDriverName('');
    setCompanyName('');
    setGrossWeight('');
    setTareWeight('');
    setNetWeight('');
    setPermitNumber('');
    setNotes('');
  };

  const handlePrintTicket = () => {
    // In a real application, this would trigger a print function
    console.warn('Printing ticket:', ticketNumber);
    window.alert('Printing ticket: ' + ticketNumber);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">City Weighing</h1>
          <p className="text-gray-400">Record and manage commercial vehicle weights</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchScales} disabled={isLoading}>
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh Scales
          </Button>
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
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Record Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="manual"
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="camera">Camera Scan</TabsTrigger>
                  <TabsTrigger value="api">Scale API</TabsTrigger>
                </TabsList>

                <TabsContent value="manual">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="scale">Scale</Label>
                        <Select
                          value={selectedScale}
                          onValueChange={setSelectedScale}
                          disabled={isLoading || scales.length === 0}
                        >
                          <SelectTrigger id="scale" className="bg-gray-700 border-gray-600">
                            <SelectValue placeholder="Select a scale" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {scales.map((scale: unknown) => (
                              <SelectItem
                                key={scale.id}
                                value={scale.id.toString()}
                                disabled={scale.status !== 'Active'}
                              >
                                {scale.name} {scale.status !== 'Active' && `(${scale.status})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicleInfo">Vehicle Information</Label>
                        <Input
                          id="vehicleInfo"
                          placeholder="License Plate / VIN"
                          value={vehicleInfo}
                          onChange={e => setVehicleInfo(e.target.value)}
                          className="bg-gray-700 border-gray-600"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="driverName">Driver Name</Label>
                        <Input
                          id="driverName"
                          placeholder="Driver Name (Optional)"
                          value={driverName}
                          onChange={e => setDriverName(e.target.value)}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          placeholder="Company Name (Optional)"
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="grossWeight">Gross Weight (lbs)</Label>
                        <Input
                          id="grossWeight"
                          type="number"
                          placeholder="Gross Weight"
                          value={grossWeight}
                          onChange={e => setGrossWeight(e.target.value)}
                          className="bg-gray-700 border-gray-600"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tareWeight">Tare Weight (lbs)</Label>
                        <Input
                          id="tareWeight"
                          type="number"
                          placeholder="Tare Weight (Optional)"
                          value={tareWeight}
                          onChange={e => setTareWeight(e.target.value)}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="netWeight">Net Weight (lbs)</Label>
                        <Input
                          id="netWeight"
                          type="number"
                          placeholder="Calculated automatically"
                          value={netWeight}
                          readOnly
                          className="bg-gray-700 border-gray-600 opacity-70"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="permitNumber">Permit Number</Label>
                        <Input
                          id="permitNumber"
                          placeholder="Permit Number (Optional)"
                          value={permitNumber}
                          onChange={e => setPermitNumber(e.target.value)}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <textarea
                        id="notes"
                        placeholder="Additional notes (Optional)"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full h-24 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmitting || !selectedScale || !vehicleInfo || !grossWeight}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? 'Processing...' : 'Create Weigh Ticket'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="camera">
                  <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    <div className="w-full max-w-md h-64 bg-gray-900 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <CameraIcon className="mx-auto h-12 w-12 text-gray-500" />
                        <p className="mt-2 text-sm text-gray-400">
                          Camera feed not available in demo
                        </p>
                      </div>
                    </div>
                    <Button disabled className="bg-blue-600 hover:bg-blue-700">
                      <CameraIcon className="h-5 w-5 mr-2" />
                      Scan Vehicle
                    </Button>
                    <p className="text-sm text-gray-400">
                      Use the camera to scan vehicle license plates or QR codes for automated data
                      entry.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="api">
                  <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    <div className="w-full max-w-md h-64 bg-gray-900 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <ScaleIcon className="mx-auto h-12 w-12 text-gray-500" />
                        <p className="mt-2 text-sm text-gray-400">
                          Scale API connection not available in demo
                        </p>
                      </div>
                    </div>
                    <Button disabled className="bg-blue-600 hover:bg-blue-700">
                      <ArrowPathIcon className="h-5 w-5 mr-2" />
                      Connect to Scale
                    </Button>
                    <p className="text-sm text-gray-400">
                      Connect directly to compatible scales to automatically retrieve weight
                      measurements.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Available Scales</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full bg-gray-700" />
                  ))}
                </div>
              ) : scales.length === 0 ? (
                <div className="text-center py-6 text-gray-400">No scales found</div>
              ) : (
                <div className="space-y-4">
                  {scales.map((scale: unknown) => (
                    <div
                      key={scale.id}
                      className={`p-4 rounded-lg border ${
                        scale.status === 'Active'
                          ? 'border-gray-700 bg-gray-700/50'
                          : 'border-gray-800 bg-gray-800/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-white">{scale.name}</h3>
                          <p className="text-sm text-gray-400">
                            Max: {scale.max_capacity.toLocaleString()} lbs
                          </p>
                        </div>
                        <Badge
                          className={
                            scale.status === 'Active'
                              ? 'bg-green-900/20 text-green-400 border-green-800'
                              : scale.status === 'Maintenance'
                                ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800'
                                : 'bg-red-900/20 text-red-400 border-red-800'
                          }
                        >
                          {scale.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weigh Ticket Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Weigh Ticket Created</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Weigh Ticket</h3>
                  <p className="text-sm text-gray-400">Municipal Weighing System</p>
                </div>
                <QrCodeIcon className="h-10 w-10 text-blue-400" />
              </div>

              <Separator className="my-4 bg-gray-700" />

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ticket Number:</span>
                  <span className="font-medium text-white">{ticketNumber}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white">{new Date().toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white">{new Date().toLocaleTimeString()}</span>
                </div>

                <Separator className="my-2 bg-gray-700" />

                <div className="flex justify-between">
                  <span className="text-gray-400">Vehicle:</span>
                  <span className="text-white">{vehicleInfo}</span>
                </div>

                {companyName && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Company:</span>
                    <span className="text-white">{companyName}</span>
                  </div>
                )}

                {driverName && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Driver:</span>
                    <span className="text-white">{driverName}</span>
                  </div>
                )}

                <Separator className="my-2 bg-gray-700" />

                <div className="flex justify-between">
                  <span className="text-gray-400">Gross Weight:</span>
                  <span className="text-white">{parseInt(grossWeight).toLocaleString()} lbs</span>
                </div>

                {tareWeight && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tare Weight:</span>
                    <span className="text-white">{parseInt(tareWeight).toLocaleString()} lbs</span>
                  </div>
                )}

                {netWeight && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Net Weight:</span>
                    <span className="font-medium text-white">
                      {parseInt(netWeight).toLocaleString()} lbs
                    </span>
                  </div>
                )}

                {permitNumber && (
                  <>
                    <Separator className="my-2 bg-gray-700" />
                    <div className="flex justify-between">
                      <span className="text-gray-400">Permit Number:</span>
                      <span className="text-white">{permitNumber}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowTicketDialog(false)}>
              Close
            </Button>
            <Button onClick={handlePrintTicket}>
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
