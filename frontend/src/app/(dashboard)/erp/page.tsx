'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusIcon, ArrowPathIcon, LinkIcon, ServerIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function ERPPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('connections');
  const [showNewConnectionDialog, setShowNewConnectionDialog] = useState(false);
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

      const { data, error: connectionsError } = await query.order('created_at', { ascending: false });

      if (connectionsError) {
        throw connectionsError;
      }

      setConnections(data || []);
    } catch (err: any) {
      console.error('Error fetching ERP connections:', err);
      setError(err.message || 'Failed to load ERP connections');
    } finally {
      setIsLoading(false);
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
        .select(`
          id,
          created_at,
          status,
          message,
          details,
          integration_connections(company_id)
        `)
        .eq('integration_connections.integration_type', 'erp');

      // If not admin, filter by company
      if (!userData.is_admin) {
        query = query.eq('integration_connections.company_id', userData.company_id);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      setSyncLogs(data.map(log => ({
        id: log.id,
        timestamp: log.created_at,
        status: log.status,
        message: log.message,
        details: log.details,
      })) || []);
    } catch (err: any) {
      console.error('Error fetching sync logs:', err);
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
      // For now, we'll just show a success message
      alert(`Sync initiated for connection ${connectionId}`);
      
      // Refresh the connections list
      fetchConnections();
      fetchSyncLogs();
    } catch (err: any) {
      console.error('Error syncing data:', err);
      setError(err.message || 'Failed to sync data');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">ERP Integration</h1>
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
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No ERP Connections</h3>
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
                          {connection.provider === 'netsuite' ? 'NetSuite' : 
                           connection.provider === 'sap' ? 'SAP' : 
                           connection.provider === 'quickbooks' ? 'QuickBooks' : 
                           connection.provider}
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
                          {connection.last_sync ? new Date(connection.last_sync).toLocaleString() : 'Never'}
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
                          <Button variant="ghost" size="sm">
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
                    onChange={e => setNewConnection({
                      ...newConnection,
                      config: { ...newConnection.config, accountId: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Consumer Key</label>
                  <Input
                    value={newConnection.config.consumerKey}
                    onChange={e => setNewConnection({
                      ...newConnection,
                      config: { ...newConnection.config, consumerKey: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Consumer Secret</label>
                  <Input
                    type="password"
                    value={newConnection.config.consumerSecret}
                    onChange={e => setNewConnection({
                      ...newConnection,
                      config: { ...newConnection.config, consumerSecret: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Token ID</label>
                  <Input
                    value={newConnection.config.tokenId}
                    onChange={e => setNewConnection({
                      ...newConnection,
                      config: { ...newConnection.config, tokenId: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Token Secret</label>
                  <Input
                    type="password"
                    value={newConnection.config.tokenSecret}
                    onChange={e => setNewConnection({
                      ...newConnection,
                      config: { ...newConnection.config, tokenSecret: e.target.value }
                    })}
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
    </div>
  );
}
