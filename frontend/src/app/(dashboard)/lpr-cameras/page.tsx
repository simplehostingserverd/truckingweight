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

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import {
  captureLicensePlate,
  getLPRCameras,
  type LPRCameraConfig,
  type LPRCaptureResult,
} from '@/utils/lpr';
import {
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface LPRCameraStatus extends LPRCameraConfig {
  status: 'online' | 'offline' | 'error';
  lastCapture?: string;
  captureCount: number;
}

export default function LPRCamerasPage() {
  const [cameras, setCameras] = useState<LPRCameraStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [captureResults, setCaptureResults] = useState<LPRCaptureResult[]>([]);
  const [capturingCameras, setCapturingCameras] = useState<Set<string>>(new Set());

  // Load cameras on component mount
  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      setLoading(true);
      const lprCameras = await getLPRCameras();

      // Add status information to cameras
      const camerasWithStatus: LPRCameraStatus[] = lprCameras.map(camera => ({
        ...camera,
        status: camera.isActive ? 'online' : 'offline',
        captureCount: Math.floor(Math.random() * 100), // Mock data
        lastCapture: camera.isActive
          ? new Date(Date.now() - Math.random() * 3600000).toISOString()
          : undefined,
      }));

      setCameras(camerasWithStatus);
    } catch (err) {
      console.error('Error loading LPR cameras:', err);
      setError('Failed to load LPR cameras');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async (cameraId: string) => {
    try {
      setCapturingCameras(prev => new Set(prev).add(cameraId));

      const result = await captureLicensePlate(cameraId);
      setCaptureResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results

      // Update camera last capture time
      setCameras(prev =>
        prev.map(camera =>
          camera.id === cameraId
            ? {
                ...camera,
                lastCapture: new Date().toISOString(),
                captureCount: camera.captureCount + 1,
              }
            : camera
        )
      );
    } catch (err) {
      console.error('Error capturing license plate:', err);
      setError('Failed to capture license plate');
    } finally {
      setCapturingCameras(prev => {
        const newSet = new Set(prev);
        newSet.delete(cameraId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getVendorIcon = (_vendor: string) => {
    // Return appropriate icon based on vendor
    return <CameraIcon className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">LPR Camera System</h1>
          <p className="text-gray-400 mt-1">License Plate Recognition & Vehicle Monitoring</p>
        </div>
        <Button onClick={loadCameras} variant="outline">
          Refresh Cameras
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CameraIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Cameras</p>
                <p className="text-2xl font-bold text-white">{cameras.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Online</p>
                <p className="text-2xl font-bold text-white">
                  {cameras.filter(c => c.status === 'online').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Today's Captures</p>
                <p className="text-2xl font-bold text-white">
                  {cameras.reduce((sum, c) => sum + c.captureCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Offline</p>
                <p className="text-2xl font-bold text-white">
                  {cameras.filter(c => c.status === 'offline').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Camera Overview</TabsTrigger>
          <TabsTrigger value="captures">Recent Captures</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cameras.map(camera => (
              <Card key={camera.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{camera.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(camera.status)}`} />
                      <Badge variant="outline">{camera.vendor}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-400">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {camera.location || 'No location set'}
                    </div>

                    <div className="flex items-center text-sm text-gray-400">
                      <span className="font-medium">IP:</span>
                      <span className="ml-2">{camera.ipAddress}</span>
                    </div>

                    {camera.lastCapture && (
                      <div className="text-sm text-gray-400">
                        <span className="font-medium">Last Capture:</span>
                        <span className="ml-2">
                          {new Date(camera.lastCapture).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="text-sm text-gray-400">
                      <span className="font-medium">Captures Today:</span>
                      <span className="ml-2">{camera.captureCount}</span>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleCapture(camera.id)}
                        disabled={!camera.isActive || capturingCameras.has(camera.id)}
                        className="flex-1"
                      >
                        {capturingCameras.has(camera.id) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Capturing...
                          </>
                        ) : (
                          <>
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Capture
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Cog6ToothIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="captures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent License Plate Captures</CardTitle>
            </CardHeader>
            <CardContent>
              {captureResults.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No recent captures. Click "Capture" on any camera to start.
                </div>
              ) : (
                <div className="space-y-4">
                  {captureResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                        <div>
                          <p className="font-medium text-white">
                            {result.success ? result.licensePlate : 'Capture Failed'}
                          </p>
                          <p className="text-sm text-gray-400">
                            Camera:{' '}
                            {cameras.find(c => c.id === result.cameraId)?.name || result.cameraId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {result.success && result.confidence && (
                          <p className="text-sm text-gray-400">Confidence: {result.confidence}%</p>
                        )}
                        <p className="text-sm text-gray-400">
                          {new Date(result.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>LPR System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Cog6ToothIcon className="h-4 w-4" />
                  <AlertTitle>Configuration</AlertTitle>
                  <AlertDescription>
                    LPR camera settings are managed through the admin panel.
                    {/* @ts-ignore */}
                    <a
                      href="/admin/lpr-cameras"
                      className="text-blue-400 hover:text-blue-300 underline ml-1"
                    >
                      Click here to manage cameras
                    </a>{' '}
                    (admin access required).
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-700 rounded-lg">
                    <h3 className="font-medium text-white mb-2">Supported Vendors</h3>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Genetec</li>
                      <li>• Axis Communications</li>
                      <li>• Hikvision</li>
                      <li>• Dahua</li>
                      <li>• Bosch</li>
                      <li>• Hanwha (Samsung)</li>
                      <li>• Custom Integration</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-gray-700 rounded-lg">
                    <h3 className="font-medium text-white mb-2">Features</h3>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Real-time license plate recognition</li>
                      <li>• Multi-vendor camera support</li>
                      <li>• Automatic image capture</li>
                      <li>• Confidence scoring</li>
                      <li>• Location tracking</li>
                      <li>• Historical data storage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
