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

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  PlusIcon,
  ArrowPathIcon,
  LinkIcon,
  ServerIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  TruckIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ReceiptRefundIcon,
  BuildingLibraryIcon,
  ShoppingCartIcon,
  ClipboardDocumentIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertTitle,
  AlertDescription,
  Separator,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import type { Database } from '@/types/supabase';

type Connection = {
  id: string;
  name: string;
  provider: string;
  status: string;
  created_at: string;
  last_sync: string | null;
  company_id: string;
};

type SyncLog = {
  id: string;
  timestamp: string;
  status: string;
  message: string;
  details: any;
};

// Add more types for the ERP page
type ErpDataSummary = {
  customers: number;
  invoices: number;
  products: number;
  transactions: number;
};

type ErpSyncStatus = {
  lastSync: string | null;
  nextScheduledSync: string | null;
  syncFrequency: string;
  status: 'active' | 'inactive' | 'error';
};

export default function ERPPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('connections');
  const [showNewConnectionDialog, setShowNewConnectionDialog] = useState(false);
  const [showSyncDetailsDialog, setShowSyncDetailsDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SyncLog | null>(null);
  const [dataSummary, setDataSummary] = useState<ErpDataSummary>({
    customers: 0,
    invoices: 0,
    products: 0,
    transactions: 0,
  });
  const [syncStatus, setSyncStatus] = useState<ErpSyncStatus>({
    lastSync: null,
    nextScheduledSync: null,
    syncFrequency: 'daily',
    status: 'active',
  });
  const [newConnection, setNewConnection] = useState({
    name: '',
    provider: 'netsuite',
    config: {
      accountId: '',
      consumerKey: '',
      consumerSecret: '',
      tokenId: '',
      tokenSecret: '',
    },
  });
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchConnections();
    fetchSyncLogs();
    fetchDataSummary();
  }, []);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      setError('');

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData.session) {
        throw new Error('No active session');
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id, is_admin')
        .eq('id', sessionData.session.user.id)
        .single();

      if (userError) {
        throw userError;
      }

      let query = supabase
        .from('integration_connections')
        .select('*')
        .eq('integration_type', 'erp');

      // If not admin, filter by company
      if (!userData.is_admin) {
        query = query.eq('company_id', userData.company_id);
      }

      const { data, error: connectionsError } = await query.order('created_at', {
        ascending: false,
      });

      if (connectionsError) {
        throw connectionsError;
      }

      // If no connections found, add dummy data for demonstration
      if (!data || data.length === 0) {
        const dummyConnections: Connection[] = [
          {
            id: 'dummy-1',
            name: 'NetSuite Production',
            provider: 'netsuite',
            status: 'active',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            company_id: userData.company_id || '1',
          },
          {
            id: 'dummy-2',
            name: 'QuickBooks Integration',
            provider: 'quickbooks',
            status: 'active',
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            last_sync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            company_id: userData.company_id || '1',
          },
          {
            id: 'dummy-3',
            name: 'SAP Test Environment',
            provider: 'sap',
            status: 'inactive',
            created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            last_sync: null,
            company_id: userData.company_id || '1',
          },
        ];
        setConnections(dummyConnections);

        // Also set sync status based on dummy data
        setSyncStatus({
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          nextScheduledSync: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
          syncFrequency: 'daily',
          status: 'active',
        });
      } else {
        setConnections(data);

        // Set sync status based on real data if available
        if (data.length > 0) {
          const activeSyncs = data.filter(conn => conn.status === 'active');
          if (activeSyncs.length > 0) {
            const lastSyncDate = activeSyncs
              .map(conn => conn.last_sync)
              .filter(Boolean)
              .sort()
              .pop();

            setSyncStatus({
              lastSync: lastSyncDate || null,
              nextScheduledSync: lastSyncDate
                ? new Date(new Date(lastSyncDate).getTime() + 24 * 60 * 60 * 1000).toISOString()
                : null,
              syncFrequency: 'daily',
              status: 'active',
            });
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching ERP connections:', err);
      setError(err.message || 'Failed to load ERP connections');

      // Add dummy data even on error for demonstration
      const dummyConnections: Connection[] = [
        {
          id: 'dummy-1',
          name: 'NetSuite Production',
          provider: 'netsuite',
          status: 'active',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          company_id: '1',
        },
        {
          id: 'dummy-2',
          name: 'QuickBooks Integration',
          provider: 'quickbooks',
          status: 'active',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          last_sync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          company_id: '1',
        },
      ];
      setConnections(dummyConnections);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataSummary = async () => {
    try {
      // In a real app, this would fetch data from the backend
      // For now, we'll use dummy data

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Set dummy data summary
      setDataSummary({
        customers: 247,
        invoices: 1893,
        products: 412,
        transactions: 5621,
      });
    } catch (err: any) {
      console.error('Error fetching ERP data summary:', err);
    }
  };

  const fetchSyncLogs = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('company_id, is_admin')
        .eq('id', sessionData.session.user.id)
        .single();

      let query = supabase
        .from('integration_logs')
        .select(
          `
          id,
          created_at,
          status,
          message,
          details,
          integration_connections(company_id)
        `
        )
        .eq('integration_connections.integration_type', 'erp');

      // If not admin, filter by company
      if (!userData.is_admin) {
        query = query.eq('integration_connections.company_id', userData.company_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

      if (error) {
        throw error;
      }

      // If no logs found or error, add dummy data for demonstration
      if (!data || data.length === 0) {
        const now = Date.now();
        const dummyLogs: SyncLog[] = [
          {
            id: 'log-1',
            timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
            status: 'success',
            message: 'Successfully synchronized customer data from NetSuite',
            details: {
              recordsProcessed: 247,
              recordsCreated: 12,
              recordsUpdated: 35,
              duration: '00:03:45',
              connectionId: 'dummy-1',
            },
          },
          {
            id: 'log-2',
            timestamp: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
            status: 'success',
            message: 'Successfully synchronized invoice data from NetSuite',
            details: {
              recordsProcessed: 156,
              recordsCreated: 23,
              recordsUpdated: 0,
              duration: '00:02:12',
              connectionId: 'dummy-1',
            },
          },
          {
            id: 'log-3',
            timestamp: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
            status: 'warning',
            message: 'Partial sync completed with QuickBooks - some records skipped',
            details: {
              recordsProcessed: 89,
              recordsCreated: 45,
              recordsUpdated: 12,
              recordsSkipped: 32,
              errors: [
                'Invalid tax code for customer ABC Corp',
                'Missing required field for invoice #INV-2023-456',
              ],
              duration: '00:04:37',
              connectionId: 'dummy-2',
            },
          },
          {
            id: 'log-4',
            timestamp: new Date(now - 28 * 60 * 60 * 1000).toISOString(),
            status: 'error',
            message: 'Failed to synchronize data from SAP',
            details: {
              error: 'Authentication failed. Token expired.',
              connectionId: 'dummy-3',
            },
          },
          {
            id: 'log-5',
            timestamp: new Date(now - 52 * 60 * 60 * 1000).toISOString(),
            status: 'success',
            message: 'Successfully synchronized product catalog from QuickBooks',
            details: {
              recordsProcessed: 412,
              recordsCreated: 15,
              recordsUpdated: 397,
              duration: '00:05:23',
              connectionId: 'dummy-2',
            },
          },
        ];
        setSyncLogs(dummyLogs);
      } else {
        setSyncLogs(
          data.map(log => ({
            id: log.id,
            timestamp: log.created_at,
            status: log.status,
            message: log.message,
            details: log.details,
          }))
        );
      }
    } catch (err: any) {
      console.error('Error fetching sync logs:', err);

      // Add dummy data even on error for demonstration
      const now = Date.now();
      const dummyLogs: SyncLog[] = [
        {
          id: 'log-1',
          timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
          status: 'success',
          message: 'Successfully synchronized customer data from NetSuite',
          details: {
            recordsProcessed: 247,
            recordsCreated: 12,
            recordsUpdated: 35,
            duration: '00:03:45',
          },
        },
        {
          id: 'log-2',
          timestamp: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
          status: 'error',
          message: 'Failed to synchronize data from SAP',
          details: {
            error: 'Authentication failed. Token expired.',
          },
        },
      ];
      setSyncLogs(dummyLogs);
    }
  };

  const handleCreateConnection = async () => {
    try {
      setIsLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error('No active session');
      }

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', sessionData.session.user.id)
        .single();

      const { data, error } = await supabase
        .from('integration_connections')
        .insert({
          name: newConnection.name,
          provider: newConnection.provider,
          integration_type: 'erp',
          company_id: userData.company_id,
          config: newConnection.config,
          is_active: true,
        })
        .select();

      if (error) {
        throw error;
      }

      setConnections([...(data || []), ...connections]);
      setShowNewConnectionDialog(false);
      setNewConnection({
        name: '',
        provider: 'netsuite',
        config: {
          accountId: '',
          consumerKey: '',
          consumerSecret: '',
          tokenId: '',
          tokenSecret: '',
        },
      });
    } catch (err: any) {
      console.error('Error creating ERP connection:', err);
      setError(err.message || 'Failed to create ERP connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async (connectionId: string) => {
    try {
      // This would call your backend API to trigger a sync
      // For now, we'll simulate a sync with a delay
      setIsLoading(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create a new sync log entry
      const newLog: SyncLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'success',
        message: 'Successfully synchronized data from ERP system',
        details: {
          recordsProcessed: Math.floor(Math.random() * 200) + 50,
          recordsCreated: Math.floor(Math.random() * 20) + 5,
          recordsUpdated: Math.floor(Math.random() * 50) + 10,
          duration: '00:02:37',
          connectionId: connectionId,
        },
      };

      // Add the new log to the existing logs
      setSyncLogs([newLog, ...syncLogs]);

      // Update the connection's last sync time
      setConnections(
        connections.map(conn =>
          conn.id === connectionId ? { ...conn, last_sync: new Date().toISOString() } : conn
        )
      );

      // Update sync status
      setSyncStatus({
        ...syncStatus,
        lastSync: new Date().toISOString(),
        nextScheduledSync: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Update data summary with random increases
      setDataSummary({
        customers: dataSummary.customers + Math.floor(Math.random() * 5),
        invoices: dataSummary.invoices + Math.floor(Math.random() * 15),
        products: dataSummary.products + Math.floor(Math.random() * 3),
        transactions: dataSummary.transactions + Math.floor(Math.random() * 25),
      });

      setIsLoading(false);
    } catch (err: any) {
      console.error('Error syncing data:', err);
      setError(err.message || 'Failed to sync data');
      setIsLoading(false);
    }
  };

  const handleViewSyncDetails = (log: SyncLog) => {
    setSelectedLog(log);
    setShowSyncDetailsDialog(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">ERP Integration</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your ERP system connections and data synchronization
          </p>
        </div>
        <Button onClick={() => setShowNewConnectionDialog(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Connection
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Customers</p>
                <h3 className="text-2xl font-bold mt-1">
                  {dataSummary.customers.toLocaleString()}
                </h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Invoices</p>
                <h3 className="text-2xl font-bold mt-1">{dataSummary.invoices.toLocaleString()}</h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <ReceiptRefundIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Products</p>
                <h3 className="text-2xl font-bold mt-1">{dataSummary.products.toLocaleString()}</h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <ArchiveBoxIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</p>
                <h3 className="text-2xl font-bold mt-1">
                  {dataSummary.transactions.toLocaleString()}
                </h3>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Synchronization Status</CardTitle>
          <CardDescription>Current status of ERP data synchronization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
              <div className="flex items-center mt-1">
                <Badge variant={syncStatus.status === 'active' ? 'success' : 'destructive'}>
                  {syncStatus.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Sync</p>
              <p className="mt-1">
                {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Scheduled</p>
              <p className="mt-1">
                {syncStatus.nextScheduledSync
                  ? new Date(syncStatus.nextScheduledSync).toLocaleString()
                  : 'Not scheduled'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Frequency</p>
              <p className="mt-1 capitalize">{syncStatus.syncFrequency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="h-full">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <ServerIcon className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                No ERP Connections
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new connection to your ERP system.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowNewConnectionDialog(true)}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Connection
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map(connection => (
                <Card key={connection.id} className="h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{connection.name}</CardTitle>
                        <CardDescription>
                          {connection.provider === 'netsuite'
                            ? 'NetSuite'
                            : connection.provider === 'sap'
                              ? 'SAP'
                              : connection.provider === 'quickbooks'
                                ? 'QuickBooks'
                                : connection.provider}
                        </CardDescription>
                      </div>
                      <Badge variant={connection.status === 'active' ? 'success' : 'destructive'}>
                        {connection.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Last Sync:</span>
                        <span className="text-sm">
                          {connection.last_sync
                            ? new Date(connection.last_sync).toLocaleString()
                            : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Created:</span>
                        <span className="text-sm">
                          {new Date(connection.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button size="sm" onClick={() => handleSyncData(connection.id)}>
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Logs</CardTitle>
              <CardDescription>Recent ERP data synchronization activities</CardDescription>
            </CardHeader>
            <CardContent>
              {syncLogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No synchronization logs found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.status === 'success'
                                ? 'success'
                                : log.status === 'warning'
                                  ? 'warning'
                                  : 'destructive'
                            }
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewSyncDetails(log)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Connection Dialog */}
      <Dialog open={showNewConnectionDialog} onOpenChange={setShowNewConnectionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create ERP Connection</DialogTitle>
            <DialogDescription>
              Connect your ERP system to enable data synchronization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Connection Name</label>
              <Input
                value={newConnection.name}
                onChange={e => setNewConnection({ ...newConnection, name: e.target.value })}
                placeholder="e.g., Production NetSuite"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ERP Provider</label>
              <Select
                value={newConnection.provider}
                onValueChange={value => setNewConnection({ ...newConnection, provider: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ERP Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="netsuite">NetSuite</SelectItem>
                  <SelectItem value="sap">SAP</SelectItem>
                  <SelectItem value="quickbooks">QuickBooks</SelectItem>
                  <SelectItem value="dynamics">Microsoft Dynamics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            {newConnection.provider === 'netsuite' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account ID</label>
                  <Input
                    value={newConnection.config.accountId}
                    onChange={e =>
                      setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, accountId: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Consumer Key</label>
                  <Input
                    value={newConnection.config.consumerKey}
                    onChange={e =>
                      setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, consumerKey: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Consumer Secret</label>
                  <Input
                    type="password"
                    value={newConnection.config.consumerSecret}
                    onChange={e =>
                      setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, consumerSecret: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Token ID</label>
                  <Input
                    value={newConnection.config.tokenId}
                    onChange={e =>
                      setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, tokenId: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Token Secret</label>
                  <Input
                    type="password"
                    value={newConnection.config.tokenSecret}
                    onChange={e =>
                      setNewConnection({
                        ...newConnection,
                        config: { ...newConnection.config, tokenSecret: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewConnectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateConnection} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Connection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Details Dialog */}
      <Dialog open={showSyncDetailsDialog} onOpenChange={setShowSyncDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Synchronization Details</DialogTitle>
            <DialogDescription>
              Detailed information about the synchronization event
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</p>
                  <p className="mt-1">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedLog.status === 'success'
                          ? 'success'
                          : selectedLog.status === 'warning'
                            ? 'warning'
                            : 'destructive'
                      }
                    >
                      {selectedLog.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Message</p>
                <p className="mt-1">{selectedLog.message}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Details</p>

                {selectedLog.details && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                    {selectedLog.status === 'error' ? (
                      <p className="text-red-600 dark:text-red-400">{selectedLog.details.error}</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedLog.details.recordsProcessed && (
                          <div className="flex justify-between">
                            <span>Records Processed:</span>
                            <span className="font-medium">
                              {selectedLog.details.recordsProcessed}
                            </span>
                          </div>
                        )}

                        {selectedLog.details.recordsCreated && (
                          <div className="flex justify-between">
                            <span>Records Created:</span>
                            <span className="font-medium">
                              {selectedLog.details.recordsCreated}
                            </span>
                          </div>
                        )}

                        {selectedLog.details.recordsUpdated && (
                          <div className="flex justify-between">
                            <span>Records Updated:</span>
                            <span className="font-medium">
                              {selectedLog.details.recordsUpdated}
                            </span>
                          </div>
                        )}

                        {selectedLog.details.recordsSkipped && (
                          <div className="flex justify-between">
                            <span>Records Skipped:</span>
                            <span className="font-medium">
                              {selectedLog.details.recordsSkipped}
                            </span>
                          </div>
                        )}

                        {selectedLog.details.duration && (
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-medium">{selectedLog.details.duration}</span>
                          </div>
                        )}

                        {selectedLog.details.errors && selectedLog.details.errors.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium mb-2">Errors:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {selectedLog.details.errors.map((error: string, index: number) => (
                                <li key={index} className="text-red-600 dark:text-red-400">
                                  {error}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowSyncDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
