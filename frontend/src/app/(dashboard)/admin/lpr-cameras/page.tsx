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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui';
import {
  CameraIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

interface LPRCamera {
  id: string;
  name: string;
  vendor: string;
  ip_address: string;
  port?: number;
  username?: string;
  password?: string;
  api_key?: string;
  api_endpoint?: string;
  is_active: boolean;
  location?: string;
  notes?: string;
  city_id?: string;
  created_at: string;
  updated_at: string;
}

interface CameraFormData {
  name: string;
  vendor: string;
  ip_address: string;
  port: string;
  username: string;
  password: string;
  api_key: string;
  api_endpoint: string;
  is_active: boolean;
  location: string;
  notes: string;
  city_id: string;
}

const VENDORS = ['genetec', 'axis', 'hikvision', 'dahua', 'bosch', 'hanwha', 'custom'];

export default function AdminLPRCamerasPage() {
  const [cameras, setCameras] = useState<LPRCamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<LPRCamera | null>(null);
  const [formData, setFormData] = useState<CameraFormData>({
    name: '',
    vendor: '',
    ip_address: '',
    port: '',
    username: '',
    password: '',
    api_key: '',
    api_endpoint: '',
    is_active: true,
    location: '',
    notes: '',
    city_id: '',
  });

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lpr-cameras?limit=100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load cameras');
      }

      const data = await response.json();
      setCameras(data.cameras || []);
    } catch (err) {
      console.error('Error loading cameras:', err);
      setError('Failed to load cameras');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        port: formData.port ? parseInt(formData.port) : undefined,
        city_id: formData.city_id || null,
      };

      const url = editingCamera ? `/api/lpr-cameras/${editingCamera.id}` : '/api/lpr-cameras';

      const method = editingCamera ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingCamera ? 'update' : 'create'} camera`);
      }

      await loadCameras();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving camera:', err);
      setError(`Failed to ${editingCamera ? 'update' : 'create'} camera`);
    }
  };

  const handleEdit = (camera: LPRCamera) => {
    setEditingCamera(camera);
    setFormData({
      name: camera.name,
      vendor: camera.vendor,
      ip_address: camera.ip_address,
      port: camera.port?.toString() || '',
      username: camera.username || '',
      password: camera.password || '',
      api_key: camera.api_key || '',
      api_endpoint: camera.api_endpoint || '',
      is_active: camera.is_active,
      location: camera.location || '',
      notes: camera.notes || '',
      city_id: camera.city_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (cameraId: string) => {
    if (!confirm('Are you sure you want to delete this camera?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lpr-cameras/${cameraId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete camera');
      }

      await loadCameras();
    } catch (err) {
      console.error('Error deleting camera:', err);
      setError('Failed to delete camera');
    }
  };

  const resetForm = () => {
    setEditingCamera(null);
    setFormData({
      name: '',
      vendor: '',
      ip_address: '',
      port: '',
      username: '',
      password: '',
      api_key: '',
      api_endpoint: '',
      is_active: true,
      location: '',
      notes: '',
      city_id: '',
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-500';
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
          <h1 className="text-3xl font-bold text-white">LPR Camera Management</h1>
          <p className="text-gray-400 mt-1">
            Configure and manage License Plate Recognition cameras
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Camera
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCamera ? 'Edit Camera' : 'Add New Camera'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Camera Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Select
                    value={formData.vendor}
                    onValueChange={value => setFormData({ ...formData, vendor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {VENDORS.map(vendor => (
                        <SelectItem key={vendor} value={vendor}>
                          {vendor.charAt(0).toUpperCase() + vendor.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ip_address">IP Address *</Label>
                  <Input
                    id="ip_address"
                    value={formData.ip_address}
                    onChange={e => setFormData({ ...formData, ip_address: e.target.value })}
                    placeholder="192.168.1.100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={e => setFormData({ ...formData, port: e.target.value })}
                    placeholder="80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  value={formData.api_key}
                  onChange={e => setFormData({ ...formData, api_key: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="api_endpoint">API Endpoint</Label>
                <Input
                  id="api_endpoint"
                  value={formData.api_endpoint}
                  onChange={e => setFormData({ ...formData, api_endpoint: e.target.value })}
                  placeholder="/api/v1/capture"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Main Gate, Loading Dock A, etc."
                />
              </div>

              <div>
                <Label htmlFor="city_id">City ID (for city cameras)</Label>
                <Input
                  id="city_id"
                  value={formData.city_id}
                  onChange={e => setFormData({ ...formData, city_id: e.target.value })}
                  placeholder="Leave empty for company cameras"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes about this camera..."
                  className="flex min-h-[80px] w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingCamera ? 'Update' : 'Create'} Camera</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
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
                <p className="text-sm font-medium text-gray-400">Active</p>
                <p className="text-2xl font-bold text-white">
                  {cameras.filter(c => c.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Cog6ToothIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Inactive</p>
                <p className="text-2xl font-bold text-white">
                  {cameras.filter(c => !c.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CameraIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Vendors</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(cameras.map(c => c.vendor)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cameras Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Cameras</CardTitle>
        </CardHeader>
        <CardContent>
          {cameras.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No cameras configured. Click "Add Camera" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Vendor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">IP Address</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cameras.map(camera => (
                    <tr key={camera.id} className="border-b border-gray-800">
                      <td className="py-3 px-4 text-white">{camera.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {camera.vendor.charAt(0).toUpperCase() + camera.vendor.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{camera.ip_address}</td>
                      <td className="py-3 px-4 text-gray-400">{camera.location || 'Not set'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${getStatusColor(camera.is_active)} mr-2`}
                          />
                          <span className="text-gray-400">
                            {camera.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(camera)}>
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(camera.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
