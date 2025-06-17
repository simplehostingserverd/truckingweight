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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import {
  ChartBarIcon,
  CheckCircleIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  PlusIcon,
  ServerIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

interface StorageSystem {
  id: string;
  name: string;
  type: 'nas' | 'nvme' | 's3' | 'azure' | 'gcp' | 'local';
  protocol: 'nfs' | 'smb' | 'iscsi' | 'http' | 'https' | 'ftp' | 'sftp';
  host: string;
  port?: number;
  username?: string;
  password?: string;
  path: string;
  capacity_tb: number;
  used_tb: number;
  is_primary: boolean;
  is_backup: boolean;
  is_active: boolean;
  encryption_enabled: boolean;
  compression_enabled: boolean;
  backup_schedule?: string;
  retention_days: number;
  data_types: string[];
  created_at: string;
  updated_at: string;
  last_backup?: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
}

interface BackupJob {
  id: string;
  name: string;
  storage_system_id: string;
  data_types: string[];
  schedule: string;
  last_run?: string;
  next_run: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  retention_days: number;
  compression: boolean;
  encryption: boolean;
  created_at: string;
}

const STORAGE_TYPES = [
  { value: 'nas', label: 'Network Attached Storage (NAS)' },
  { value: 'nvme', label: 'NVMe Storage Server' },
  { value: 's3', label: 'Amazon S3 Compatible' },
  { value: 'azure', label: 'Azure Blob Storage' },
  { value: 'gcp', label: 'Google Cloud Storage' },
  { value: 'local', label: 'Local Storage' },
];

const PROTOCOLS = [
  { value: 'nfs', label: 'NFS (Network File System)' },
  { value: 'smb', label: 'SMB/CIFS' },
  { value: 'iscsi', label: 'iSCSI' },
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'ftp', label: 'FTP' },
  { value: 'sftp', label: 'SFTP' },
];

const DATA_TYPES = [
  'weight_records',
  'lpr_images',
  'lpr_videos',
  'vehicle_images',
  'driver_photos',
  'documents',
  'signatures',
  'telematics_data',
  'scale_calibrations',
  'audit_logs',
  'database_backups',
  'application_logs',
  'configuration_files',
];

export default function StorageSystemsPage() {
  const [storageSystems, setStorageSystems] = useState<StorageSystem[]>([]);
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('systems');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<StorageSystem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    protocol: '',
    host: '',
    port: '',
    username: '',
    password: '',
    path: '',
    capacity_tb: '',
    is_primary: false,
    is_backup: true,
    is_active: true,
    encryption_enabled: true,
    compression_enabled: true,
    backup_schedule: '0 2 * * *', // Daily at 2 AM
    retention_days: '30',
    data_types: [] as string[],
  });

  useEffect(() => {
    loadStorageSystems();
    loadBackupJobs();
  }, []);

  const loadStorageSystems = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockSystems: StorageSystem[] = [
        {
          id: '1',
          name: 'Primary NAS Server',
          type: 'nas',
          protocol: 'nfs',
          host: '192.168.1.100',
          port: 2049,
          username: 'admin',
          path: '/mnt/trucking_data',
          capacity_tb: 50,
          used_tb: 12.5,
          is_primary: true,
          is_backup: false,
          is_active: true,
          encryption_enabled: true,
          compression_enabled: true,
          backup_schedule: '0 2 * * *',
          retention_days: 90,
          data_types: ['weight_records', 'lpr_images', 'documents'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          last_backup: '2024-01-20T02:00:00Z',
          status: 'online',
        },
        {
          id: '2',
          name: 'Backup NVMe Array',
          type: 'nvme',
          protocol: 'iscsi',
          host: '192.168.1.101',
          port: 3260,
          username: 'backup_user',
          path: '/backup/trucking',
          capacity_tb: 100,
          used_tb: 25.2,
          is_primary: false,
          is_backup: true,
          is_active: true,
          encryption_enabled: true,
          compression_enabled: true,
          backup_schedule: '0 3 * * *',
          retention_days: 365,
          data_types: ['weight_records', 'lpr_images', 'lpr_videos', 'database_backups'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          last_backup: '2024-01-20T03:00:00Z',
          status: 'online',
        },
      ];
      setStorageSystems(mockSystems);
    } catch (err) {
      console.error('Error loading storage systems:', err);
      setError('Failed to load storage systems');
    } finally {
      setLoading(false);
    }
  };

  const loadBackupJobs = async () => {
    try {
      // Mock backup jobs data
      const mockJobs: BackupJob[] = [
        {
          id: '1',
          name: 'Daily Weight Records Backup',
          storage_system_id: '2',
          data_types: ['weight_records', 'scale_calibrations'],
          schedule: '0 2 * * *',
          last_run: '2024-01-20T02:00:00Z',
          next_run: '2024-01-21T02:00:00Z',
          status: 'completed',
          retention_days: 90,
          compression: true,
          encryption: true,
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          name: 'LPR Data Backup',
          storage_system_id: '2',
          data_types: ['lpr_images', 'lpr_videos'],
          schedule: '0 3 * * *',
          last_run: '2024-01-20T03:00:00Z',
          next_run: '2024-01-21T03:00:00Z',
          status: 'completed',
          retention_days: 365,
          compression: true,
          encryption: true,
          created_at: '2024-01-15T10:00:00Z',
        },
      ];
      setBackupJobs(mockJobs);
    } catch (err) {
      console.error('Error loading backup jobs:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        port: formData.port ? parseInt(formData.port) : undefined,
        capacity_tb: parseFloat(formData.capacity_tb),
        retention_days: parseInt(formData.retention_days),
      };

      // In a real implementation, this would call the API
      console.log('Storage system payload:', payload);

      await loadStorageSystems();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving storage system:', err);
      setError('Failed to save storage system');
    }
  };

  const resetForm = () => {
    setEditingSystem(null);
    setFormData({
      name: '',
      type: '',
      protocol: '',
      host: '',
      port: '',
      username: '',
      password: '',
      path: '',
      capacity_tb: '',
      is_primary: false,
      is_backup: true,
      is_active: true,
      encryption_enabled: true,
      compression_enabled: true,
      backup_schedule: '0 2 * * *',
      retention_days: '30',
      data_types: [],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'error':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatBytes = (tb: number) => {
    return `${tb.toFixed(1)} TB`;
  };

  const getUsagePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
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
          <h1 className="text-3xl font-bold text-white">Enterprise Storage & Backup Systems</h1>
          <p className="text-gray-400 mt-1">
            Manage NAS, NVMe, and cloud storage for the entire trucking application
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Storage System
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSystem ? 'Edit Storage System' : 'Add New Storage System'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">System Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Primary NAS Server"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Storage Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={value => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage type" />
                    </SelectTrigger>
                    <SelectContent>
                      {STORAGE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="protocol">Protocol *</Label>
                  <Select
                    value={formData.protocol}
                    onValueChange={value => setFormData({ ...formData, protocol: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROTOCOLS.map(protocol => (
                        <SelectItem key={protocol.value} value={protocol.value}>
                          {protocol.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="host">Host/IP Address *</Label>
                  <Input
                    id="host"
                    value={formData.host}
                    onChange={e => setFormData({ ...formData, host: e.target.value })}
                    placeholder="192.168.1.100 or nas.company.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={e => setFormData({ ...formData, port: e.target.value })}
                    placeholder="2049 (NFS), 445 (SMB)"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="admin"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="path">Storage Path *</Label>
                  <Input
                    id="path"
                    value={formData.path}
                    onChange={e => setFormData({ ...formData, path: e.target.value })}
                    placeholder="/mnt/trucking_data"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity_tb">Capacity (TB) *</Label>
                  <Input
                    id="capacity_tb"
                    type="number"
                    step="0.1"
                    value={formData.capacity_tb}
                    onChange={e => setFormData({ ...formData, capacity_tb: e.target.value })}
                    placeholder="50.0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backup_schedule">Backup Schedule (Cron)</Label>
                  <Input
                    id="backup_schedule"
                    value={formData.backup_schedule}
                    onChange={e => setFormData({ ...formData, backup_schedule: e.target.value })}
                    placeholder="0 2 * * * (Daily at 2 AM)"
                  />
                </div>
                <div>
                  <Label htmlFor="retention_days">Retention (Days)</Label>
                  <Input
                    id="retention_days"
                    type="number"
                    value={formData.retention_days}
                    onChange={e => setFormData({ ...formData, retention_days: e.target.value })}
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <Label>Data Types to Store</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {DATA_TYPES.map(dataType => (
                    <div key={dataType} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={dataType}
                        checked={formData.data_types.includes(dataType)}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              data_types: [...formData.data_types, dataType],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              data_types: formData.data_types.filter(t => t !== dataType),
                            });
                          }
                        }}
                        className="rounded border-gray-700 bg-gray-900 text-blue-600"
                      />
                      <Label htmlFor={dataType} className="text-sm">
                        {dataType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_primary"
                      checked={formData.is_primary}
                      onCheckedChange={checked => setFormData({ ...formData, is_primary: checked })}
                    />
                    <Label htmlFor="is_primary">Primary Storage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_backup"
                      checked={formData.is_backup}
                      onCheckedChange={checked => setFormData({ ...formData, is_backup: checked })}
                    />
                    <Label htmlFor="is_backup">Backup Storage</Label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="encryption_enabled"
                      checked={formData.encryption_enabled}
                      onCheckedChange={checked =>
                        setFormData({ ...formData, encryption_enabled: checked })
                      }
                    />
                    <Label htmlFor="encryption_enabled">Encryption Enabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="compression_enabled"
                      checked={formData.compression_enabled}
                      onCheckedChange={checked =>
                        setFormData({ ...formData, compression_enabled: checked })
                      }
                    />
                    <Label htmlFor="compression_enabled">Compression Enabled</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingSystem ? 'Update' : 'Create'} Storage System</Button>
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

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ServerIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Systems</p>
                <p className="text-2xl font-bold text-white">{storageSystems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CircleStackIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Capacity</p>
                <p className="text-2xl font-bold text-white">
                  {formatBytes(storageSystems.reduce((sum, s) => sum + s.capacity_tb, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Used Storage</p>
                <p className="text-2xl font-bold text-white">
                  {formatBytes(storageSystems.reduce((sum, s) => sum + s.used_tb, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Online Systems</p>
                <p className="text-2xl font-bold text-white">
                  {storageSystems.filter(s => s.status === 'online').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DocumentDuplicateIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Backup Jobs</p>
                <p className="text-2xl font-bold text-white">{backupJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="systems">Storage Systems</TabsTrigger>
          <TabsTrigger value="backups">Backup Jobs</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {storageSystems.map(system => (
              <Card key={system.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{system.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(system.status)}`} />
                      <Badge variant="outline">{system.type.toUpperCase()}</Badge>
                      {system.is_primary && <Badge className="bg-blue-600">Primary</Badge>}
                      {system.is_backup && <Badge className="bg-green-600">Backup</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-400">
                      <ServerIcon className="h-4 w-4 mr-2" />
                      {system.host}:{system.port || 'default'} ({system.protocol.toUpperCase()})
                    </div>

                    <div className="flex items-center text-sm text-gray-400">
                      <CircleStackIcon className="h-4 w-4 mr-2" />
                      {system.path}
                    </div>

                    {/* Storage Usage Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Storage Usage</span>
                        <span className="text-white">
                          {formatBytes(system.used_tb)} / {formatBytes(system.capacity_tb)}(
                          {getUsagePercentage(system.used_tb, system.capacity_tb)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${getUsagePercentage(system.used_tb, system.capacity_tb)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        {system.encryption_enabled && (
                          <div className="flex items-center text-green-400">
                            <ShieldCheckIcon className="h-4 w-4 mr-1" />
                            Encrypted
                          </div>
                        )}
                        {system.compression_enabled && (
                          <div className="flex items-center text-blue-400">
                            <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                            Compressed
                          </div>
                        )}
                      </div>
                    </div>

                    {system.last_backup && (
                      <div className="text-sm text-gray-400">
                        <span className="font-medium">Last Backup:</span>
                        <span className="ml-2">
                          {new Date(system.last_backup).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="text-sm text-gray-400">
                      <span className="font-medium">Data Types:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {system.data_types.slice(0, 3).map(type => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {system.data_types.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{system.data_types.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Handle edit
                          console.log('Edit system:', system.id);
                        }}
                        className="flex-1"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Handle test connection
                          console.log('Test connection:', system.id);
                        }}
                        className="flex-1"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="backups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {backupJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No backup jobs configured. Create storage systems first.
                </div>
              ) : (
                <div className="space-y-4">
                  {backupJobs.map(job => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            job.status === 'completed'
                              ? 'bg-green-500'
                              : job.status === 'running'
                                ? 'bg-blue-500'
                                : job.status === 'failed'
                                  ? 'bg-red-500'
                                  : 'bg-yellow-500'
                          }`}
                        />
                        <div>
                          <p className="font-medium text-white">{job.name}</p>
                          <p className="text-sm text-gray-400">{job.data_types.join(', ')}</p>
                          <p className="text-sm text-gray-400">Schedule: {job.schedule}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          Last Run:{' '}
                          {job.last_run ? new Date(job.last_run).toLocaleString() : 'Never'}
                        </p>
                        <p className="text-sm text-gray-400">
                          Next Run: {new Date(job.next_run).toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          {job.encryption && (
                            <Badge variant="outline" className="text-xs">
                              Encrypted
                            </Badge>
                          )}
                          {job.compression && (
                            <Badge variant="outline" className="text-xs">
                              Compressed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Storage Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Average Read Speed</span>
                    <span className="text-white">1.2 GB/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Average Write Speed</span>
                    <span className="text-white">950 MB/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">IOPS</span>
                    <span className="text-white">45,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Latency</span>
                    <span className="text-white">2.1ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Growth Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Daily Growth</span>
                    <span className="text-white">2.3 TB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Weekly Growth</span>
                    <span className="text-white">16.1 TB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Monthly Growth</span>
                    <span className="text-white">69.2 TB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Projected Annual</span>
                    <span className="text-white">830 TB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {storageSystems.map(system => (
                  <div key={system.id} className="p-4 border border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{system.name}</span>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(system.status)}`} />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">CPU Usage</span>
                        <span className="text-white">12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Memory</span>
                        <span className="text-white">8.2/32 GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Temperature</span>
                        <span className="text-white">42°C</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Storage Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Cog6ToothIcon className="h-4 w-4" />
                  <AlertTitle>Enterprise Storage Configuration</AlertTitle>
                  <AlertDescription>
                    Configure enterprise-wide storage policies, backup schedules, and data retention
                    rules. These settings apply to all data types across the trucking weight
                    management system.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-white">Data Retention Policies</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Weight Records</span>
                        <span className="text-white">7 years</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">LPR Images/Videos</span>
                        <span className="text-white">2 years</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Audit Logs</span>
                        <span className="text-white">10 years</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Telematics Data</span>
                        <span className="text-white">5 years</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-white">Performance Optimization</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Auto-tiering</span>
                        <span className="text-green-400">Enabled</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Deduplication</span>
                        <span className="text-green-400">Enabled</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Compression</span>
                        <span className="text-green-400">Enabled</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Encryption at Rest</span>
                        <span className="text-green-400">AES-256</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-white">Supported Storage Protocols</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 border border-gray-700 rounded-lg text-center">
                      <div className="text-white font-medium">NFS</div>
                      <div className="text-sm text-gray-400">Network File System</div>
                    </div>
                    <div className="p-3 border border-gray-700 rounded-lg text-center">
                      <div className="text-white font-medium">SMB/CIFS</div>
                      <div className="text-sm text-gray-400">Windows Shares</div>
                    </div>
                    <div className="p-3 border border-gray-700 rounded-lg text-center">
                      <div className="text-white font-medium">iSCSI</div>
                      <div className="text-sm text-gray-400">Block Storage</div>
                    </div>
                    <div className="p-3 border border-gray-700 rounded-lg text-center">
                      <div className="text-white font-medium">S3 API</div>
                      <div className="text-sm text-gray-400">Object Storage</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-white">Recommended Hardware</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-700 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Primary Storage (NAS)</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Synology DS1821+ or QNAP TS-873A</li>
                        <li>• 8-bay configuration with RAID 6</li>
                        <li>• 10GbE network connectivity</li>
                        <li>• 32GB+ RAM for caching</li>
                        <li>• Enterprise SAS/SATA drives</li>
                      </ul>
                    </div>
                    <div className="p-4 border border-gray-700 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Backup Storage (NVMe)</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Dell PowerEdge R750 or HP ProLiant</li>
                        <li>• NVMe SSD arrays for speed</li>
                        <li>• 25GbE+ network connectivity</li>
                        <li>• Hardware RAID controllers</li>
                        <li>• Redundant power supplies</li>
                      </ul>
                    </div>
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
