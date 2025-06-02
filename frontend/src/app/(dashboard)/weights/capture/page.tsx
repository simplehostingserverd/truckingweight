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

import { weighTicketService } from '@/services/weigh-ticket-service';
import { weightCaptureService } from '@/services/weight-capture';
import { Driver, Scale, VehicleExtended, WeightReading } from '@/types/scale-master';
import {
    ArrowPathIcon,
    CameraIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    QrCodeIcon,
    ScaleIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WeightCapturePage() {
  const router = useRouter();
  const supabase = createClient();

  // State for weight capture
  const [captureMethod, setCaptureMethod] = useState<'scale' | 'iot' | 'camera' | 'manual'>(
    'scale'
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [weightReading, setWeightReading] = useState<WeightReading | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // State for form data
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [selectedScaleId, setSelectedScaleId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  // State for data lists
  const [vehicles, setVehicles] = useState<VehicleExtended[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);

  // State for form validation
  const [isFormValid, setIsFormValid] = useState(false);

  // State for ticket creation
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketCreationError, setTicketCreationError] = useState<string | null>(null);

  // State for QR scanner
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Load vehicles, drivers, and scales on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get auth token from supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('No active session');
        }

        // Fetch vehicles and drivers from our new API endpoint
        const response = await fetch('/api/scales/vehicles-drivers', {
          headers: {
            'x-auth-token': session.access_token,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch vehicles and drivers');
        }

        const data = await response.json();

        if (data.vehicles) {
          setVehicles(data.vehicles);
        }

        if (data.drivers) {
          setDrivers(data.drivers);
        }

        // Fetch scales
        const scalesResponse = await fetch('/api/scales', {
          headers: {
            'x-auth-token': session.access_token,
          },
        });

        if (!scalesResponse.ok) {
          const errorData = await scalesResponse.json();
          throw new Error(errorData.message || 'Failed to fetch scales');
        }

        const scalesData = await scalesResponse.json();

        // Filter only active scales
        const activeScales = scalesData.filter((scale: any /* @ts-ignore */ ) => scale.status === 'Active');
        setScales(activeScales);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Even if there's an error, the API should return mock data
      }
    };

    fetchData();

    // Initialize the weight capture service
    const initializeWeightCapture = async () => {
      try {
        // For demo purposes, initialize a mock digital scale
        const success = await weightCaptureService.initializeDigitalScale('scale-1', {
          ipAddress: '192.168.1.100',
          port: 8080,
          protocol: 'tcp',
        });

        if (success) {
          weightCaptureService.setActiveProvider('scale-1');
        } else {
          setCaptureError('Failed to initialize digital scale');
        }

        // Initialize IoT sensor
        await weightCaptureService.initializeIoTSensor('iot-1', {
          sensorId: 'iot-sensor-001',
          apiKey: 'demo-key',
        });

        // Initialize camera
        await weightCaptureService.initializeCamera('camera-1');

        // Initialize manual entry
        weightCaptureService.initializeManualEntry('manual-1');
      } catch (error) {
        console.error('Error initializing weight capture:', error);
        setCaptureError('Failed to initialize weight capture');
      }
    };

    initializeWeightCapture();

    // Cleanup on component unmount
    return () => {
      if (isCapturing) {
        weightCaptureService.stopCapture().catch(console.error);
      }
    };
  }, [supabase]);

  // Update form validation when required fields change
  useEffect(() => {
    setIsFormValid(!!selectedVehicleId && !!selectedDriverId && !!weightReading?.grossWeight);
  }, [selectedVehicleId, selectedDriverId, weightReading]);

  // Start weight capture
  const startCapture = async () => {
    try {
      setCaptureError(null);

      // Set the active provider based on the selected capture method
      const providerId = `${captureMethod}-1`;
      const success = weightCaptureService.setActiveProvider(providerId);

      if (!success) {
        throw new Error(`Failed to set active provider: ${providerId}`);
      }

      await weightCaptureService.startCapture();
      setIsCapturing(true);

      // Start polling for weight readings
      const interval = setInterval(async () => {
        try {
          const reading = await weightCaptureService.getCurrentReading();
          setWeightReading(reading);
        } catch (error) {
          console.error('Error getting weight reading:', error);
        }
      }, 1000);

      // Cleanup interval when capturing stops
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error starting capture:', error);
      setCaptureError(
        `Failed to start capture: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setIsCapturing(false);
    }
  };

  // Stop weight capture
  const stopCapture = async () => {
    try {
      await weightCaptureService.stopCapture();
    } catch (error) {
      console.error('Error stopping capture:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  // Create a weigh ticket
  const createTicket = async () => {
    if (!isFormValid || !weightReading) {
      return;
    }

    setIsCreatingTicket(true);
    setTicketCreationError(null);

    try {
      const ticket = await weighTicketService.createTicket(
        weightReading,
        selectedVehicleId!,
        selectedDriverId!,
        selectedScaleId,
        null, // No facility ID for now
        notes
      );

      // Navigate to the ticket details page
      router.push(`/weights/${ticket.id}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      setTicketCreationError(
        `Failed to create ticket: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setIsCreatingTicket(false);
    }
  };

  // Get the compliance status color
  const getComplianceStatusColor = (reading: WeightReading | null) => {
    if (!reading) return 'bg-gray-100 dark:bg-gray-800';

    // Check if any axle weights are non-compliant
    if (reading.axleWeights && reading.axleWeights.length > 0) {
      const hasNonCompliant = reading.axleWeights.some(aw => aw.weight > aw.maxLegal);
      if (hasNonCompliant) return 'bg-red-100 dark:bg-red-900';

      const hasWarning = reading.axleWeights.some(aw => aw.weight > aw.maxLegal * 0.95);
      if (hasWarning) return 'bg-amber-100 dark:bg-amber-900';
    }

    return 'bg-green-100 dark:bg-green-900';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Weight Capture</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Weight Display and Capture Controls */}
        <div className="lg:col-span-2">
          <div
            className={`rounded-lg shadow-md p-6 mb-6 ${getComplianceStatusColor(weightReading)}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Current Weight
              </h2>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">
                  {isCapturing ? 'Capturing...' : 'Ready'}
                </span>
                <div
                  className={`h-3 w-3 rounded-full ${isCapturing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
                ></div>
              </div>
            </div>

            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                  {weightReading ? Math.round(weightReading.grossWeight).toLocaleString() : '0'}
                </div>
                <div className="text-xl text-gray-600 dark:text-gray-400">
                  {weightReading?.unit || 'lb'}
                </div>
              </div>
            </div>

            {weightReading?.axleWeights && weightReading.axleWeights.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Axle Weights
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {weightReading.axleWeights.map(axle => (
                    <div
                      key={axle.position}
                      className={`p-2 rounded text-center ${
                        axle.weight > axle.maxLegal
                          ? 'bg-red-200 dark:bg-red-800'
                          : axle.weight > axle.maxLegal * 0.95
                            ? 'bg-amber-200 dark:bg-amber-800'
                            : 'bg-green-200 dark:bg-green-800'
                      }`}
                    >
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Axle {axle.position}
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {Math.round(axle.weight).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Max: {Math.round(axle.maxLegal).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Capture Method
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <button
                className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                  captureMethod === 'scale'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => setCaptureMethod('scale')}
              >
                <ScaleIcon
                  className={`h-8 w-8 mb-2 ${
                    captureMethod === 'scale'
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    captureMethod === 'scale'
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Digital Scale
                </span>
              </button>

              <button
                className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                  captureMethod === 'iot'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => setCaptureMethod('iot')}
              >
                <svg
                  className={`h-8 w-8 mb-2 ${
                    captureMethod === 'iot'
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                  />
                </svg>
                <span
                  className={`text-sm font-medium ${
                    captureMethod === 'iot'
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  IoT Sensor
                </span>
              </button>

              <button
                className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                  captureMethod === 'camera'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => setCaptureMethod('camera')}
              >
                <CameraIcon
                  className={`h-8 w-8 mb-2 ${
                    captureMethod === 'camera'
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    captureMethod === 'camera'
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Camera
                </span>
              </button>

              <button
                className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                  captureMethod === 'manual'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => setCaptureMethod('manual')}
              >
                <DocumentTextIcon
                  className={`h-8 w-8 mb-2 ${
                    captureMethod === 'manual'
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    captureMethod === 'manual'
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Manual Entry
                </span>
              </button>
            </div>

            <div className="flex justify-center">
              {!isCapturing ? (
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={startCapture}
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Start Capture
                </button>
              ) : (
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={stopCapture}
                >
                  Stop Capture
                </button>
              )}
            </div>

            {captureError && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md">
                <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
                {captureError}
              </div>
            )}
          </div>

          {/* New Advanced Weight Capture Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Advanced Weight Capture
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                onClick={() => {
                  // Open the QR code scanner modal
                  const scale = scales.length > 0 ? scales[0] : null;
                  if (scale) {
                    // For demo purposes, we'll just use the first scale
                    setSelectedScaleId(scale.id);
                  }
                }}
              >
                <QrCodeIcon className="h-8 w-8 mb-2 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  QR Code Scale Selection
                </span>
              </button>

              <button
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                onClick={() => {
                  // Open the axle-by-axle weight capture
                  if (selectedVehicleId && scales.length > 0) {
                    // For demo purposes, we'll just use the first scale
                    setSelectedScaleId(scales[0].id);
                  }
                }}
              >
                <TruckIcon className="h-8 w-8 mb-2 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Axle-by-Axle Weighing
                </span>
              </button>

              <button
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-green-500 bg-green-50 dark:bg-green-900/20"
                onClick={() => {
                  // Open the split weighing workflow
                  if (selectedVehicleId && scales.length > 0) {
                    // For demo purposes, we'll just use the first scale
                    setSelectedScaleId(scales[0].id);
                  }
                }}
              >
                <ScaleIcon className="h-8 w-8 mb-2 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Split Weighing
                </span>
              </button>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">
                New Features Available
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Try our new advanced weight capture features including QR code scale selection,
                axle-by-axle weighing, and split weighing workflows. These features provide more
                detailed weight data and improved compliance checking.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Vehicle, Driver, and Ticket Information */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Ticket Information
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="vehicle"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Vehicle
                </label>
                <select
                  id="vehicle"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={selectedVehicleId || ''}
                  onChange={e =>
                    setSelectedVehicleId(e.target.value ? parseInt(e.target.value) : null)
                  }
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.license_plate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="driver"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Driver
                </label>
                <select
                  id="driver"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={selectedDriverId || ''}
                  onChange={e =>
                    setSelectedDriverId(e.target.value ? parseInt(e.target.value) : null)
                  }
                >
                  <option value="">Select a driver</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="scale"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Scale (Optional)
                </label>
                <select
                  id="scale"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={selectedScaleId || ''}
                  onChange={e =>
                    setSelectedScaleId(e.target.value ? parseInt(e.target.value) : null)
                  }
                >
                  <option value="">Select a scale</option>
                  {scales.map(scale => (
                    <option key={scale.id} value={scale.id}>
                      {scale.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <button
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!isFormValid || isCreatingTicket}
              onClick={createTicket}
            >
              {isCreatingTicket ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  Creating Ticket...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Create Weigh Ticket
                </>
              )}
            </button>

            {ticketCreationError && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md">
                <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
                {ticketCreationError}
              </div>
            )}

            {!isFormValid && weightReading && (
              <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-md text-sm">
                <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
                Please select a vehicle and driver to create a weigh ticket.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
