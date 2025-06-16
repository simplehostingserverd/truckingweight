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

// Global type declarations
declare function confirm(message?: string): boolean;

import React from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TelematicsConnection {
  id: string;
  provider: string;
  credentials: any /* @ts-ignore */;
  settings: any /* @ts-ignore */;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
}

export default function TelematicsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [connections, setConnections] = useState<TelematicsConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProvider, setNewProvider] = useState('geotab');
  const [newApiKey, setNewApiKey] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDatabase, setNewDatabase] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Available telematics providers
  const providers = [
    { value: 'geotab', label: 'Geotab', logo: '/images/integrations/geotab.png' },
    { value: 'samsara', label: 'Samsara', logo: '/images/integrations/samsara.png' },
    {
      value: 'verizon_connect',
      label: 'Verizon Connect',
      logo: '/images/integrations/verizon.png',
    },
    { value: 'omnitracs', label: 'Omnitracs', logo: '/images/integrations/omnitracs.png' },
    { value: 'keeptruckin', label: 'KeepTruckin', logo: '/images/integrations/keeptruckin.png' },
    { value: 'custom', label: 'Custom API', logo: '/images/integrations/custom.png' },
  ];

  // Fetch telematics connections
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('integration_connections')
          .select('*')
          .eq('integration_type', 'telematics')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setConnections(data || []);
      } catch (err: any /* @ts-ignore */) {
        console.error('Error fetching telematics connections:', err);
        setError('Failed to load telematics connections');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [supabase]);

  // Test connection
  const testConnection = async () => {
    try {
      setTestingConnection(true);
      setTestResult(null);

      // Simulate API call to test connection
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, randomly succeed or fail
      const success = Math.random() > 0.3;

      setTestResult({
        success,
        message: success
          ? 'Connection successful! We were able to connect to the telematics provider.'
          : 'Connection failed. Please check your credentials and try again.',
      });
    } catch (err) {
      console.error('Error testing connection:', err);
      setTestResult({
        success: false,
        message: 'An unexpected error occurred while testing the connection.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Create new telematics connection
  const handleCreateConnection = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Prepare credentials based on provider
      let credentials: any = {};
      let settings: any = {};

      if (newProvider === 'geotab') {
        credentials = {
          username: newUsername,
          password: newPassword,
          database: newDatabase,
        };
        settings = {
          server_url: newServerUrl || 'my.geotab.com',
          sync_interval_minutes: 15,
        };
      } else if (newProvider === 'samsara') {
        credentials = {
          api_key: newApiKey,
        };
        settings = {
          sync_interval_minutes: 15,
        };
      } else {
        credentials = {
          api_key: newApiKey,
          username: newUsername,
          password: newPassword,
        };
        settings = {
          server_url: newServerUrl,
          sync_interval_minutes: 15,
        };
      }

      const { data, error } = await supabase
        .from('integration_connections')
        .insert({
          integration_type: 'telematics',
          provider: newProvider,
          credentials,
          settings,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Reset form
      setNewProvider('geotab');
      setNewApiKey('');
      setNewUsername('');
      setNewPassword('');
      setNewDatabase('');
      setNewServerUrl('');
      setShowCreateForm(false);
      setTestResult(null);

      // Add to state
      setConnections([data, ...connections]);
    } catch (err: any /* @ts-ignore */) {
      console.error('Error creating telematics connection:', err);
      setError('Failed to create telematics connection');
    } finally {
      setLoading(false);
    }
  };

  // Delete connection
  const handleDeleteConnection = async (id: string) => {
    if (
      !confirm('Are you sure you want to delete this connection? This action cannot be undone.')
    ) {
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from('integration_connections').delete().eq('id', id);

      if (error) throw error;

      // Remove from state
      setConnections(connections.filter(conn => conn.id !== id));
    } catch (err: any /* @ts-ignore */) {
      console.error('Error deleting connection:', err);
      setError('Failed to delete connection');
    } finally {
      setLoading(false);
    }
  };

  // Toggle connection active status
  const toggleConnectionStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('integration_connections')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Update in state
      setConnections(
        connections.map(conn => (conn.id === id ? { ...conn, is_active: !currentStatus } : conn))
      );
    } catch (err: any /* @ts-ignore */) {
      console.error('Error updating connection status:', err);
      setError('Failed to update connection status');
    } finally {
      setLoading(false);
    }
  };

  // Sync connection
  const syncConnection = async (id: string) => {
    try {
      setLoading(true);

      // Simulate API call to sync
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update last_sync_at in database
      const { error } = await supabase
        .from('integration_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Update in state
      setConnections(
        connections.map(conn =>
          conn.id === id ? { ...conn, last_sync_at: new Date().toISOString() } : conn
        )
      );
    } catch (err: any /* @ts-ignore */) {
      console.error('Error syncing connection:', err);
      setError('Failed to sync connection');
    } finally {
      setLoading(false);
    }
  };

  // Render form fields based on selected provider
  const renderProviderFields = () => {
    switch (newProvider) {
      case 'geotab':
        return (
          <>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="database"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Database
              </label>
              <input
                type="text"
                id="database"
                value={newDatabase}
                onChange={e => setNewDatabase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="serverUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Server URL (Optional)
              </label>
              <input
                type="text"
                id="serverUrl"
                value={newServerUrl}
                onChange={e => setNewServerUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="my.geotab.com"
              />
            </div>
          </>
        );

      case 'samsara':
        return (
          <div className="mb-4">
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              API Key
            </label>
            <input
              type="text"
              id="apiKey"
              value={newApiKey}
              onChange={e => setNewApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        );

      default:
        return (
          <>
            <div className="mb-4">
              <label
                htmlFor="apiKey"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                API Key
              </label>
              <input
                type="text"
                id="apiKey"
                value={newApiKey}
                onChange={e => setNewApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Username (Optional)
              </label>
              <input
                type="text"
                id="username"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password (Optional)
              </label>
              <input
                type="password"
                id="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="serverUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Server URL (Optional)
              </label>
              <input
                type="text"
                id="serverUrl"
                value={newServerUrl}
                onChange={e => setNewServerUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://api.provider.com"
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link
          href="/integrations"
          className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Telematics Integration</h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white flex justify-between items-center">
          <div className="flex items-center">
            <TruckIcon className="h-5 w-5 mr-2" />
            <h2 className="text-xl font-semibold">Telematics Connections</h2>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-800 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            New Connection
          </button>
        </div>

        {showCreateForm && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Connect Telematics Provider
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Provider
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {providers.map(provider => (
                  <div
                    key={provider.value}
                    onClick={() => setNewProvider(provider.value)}
                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center transition-colors ${
                      newProvider === provider.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-12 h-12 mb-2 flex items-center justify-center">
                      {/* Placeholder for logo */}
                      <TruckIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white text-center">
                      {provider.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateConnection}>
              {renderProviderFields()}

              {testResult && (
                <div
                  className={`mb-4 p-3 rounded-md ${
                    testResult.success
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  }`}
                >
                  <div className="flex items-start">
                    {testResult.success ? (
                      <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5" />
                    )}
                    <p>{testResult.message}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={testingConnection}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Connect
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && !connections.length ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            Loading telematics connections...
          </div>
        ) : connections.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No telematics connections found. Connect your first telematics provider to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Provider
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Last Synced
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {connections.map(connection => (
                  <tr key={connection.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
                          <TruckIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {connection.provider.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {connection.settings?.server_url || 'Default Server'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleConnectionStatus(connection.id, connection.is_active)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          connection.is_active
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}
                      >
                        {connection.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {connection.last_sync_at
                        ? formatDistanceToNow(new Date(connection.last_sync_at), {
                            addSuffix: true,
                          })
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(connection.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => syncConnection(connection.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Sync Now"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteConnection(connection.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Connection"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Telematics Integration Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">
              Real-time Vehicle Data
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect your telematics system to automatically sync vehicle locations, driver
              assignments, and diagnostic data with ScaleMasterAI.
            </p>

            <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">
              Driver Hours of Service
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Import driver hours of service data to ensure compliance with federal regulations and
              optimize scheduling.
            </p>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">
              Automated Vehicle Assignment
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Automatically assign vehicles to weights and loads based on real-time location data
              from your telematics system.
            </p>

            <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">
              Maintenance Integration
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sync maintenance records and diagnostic codes to ensure vehicles are properly
              maintained and compliant.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Link
            href="/integrations/docs#telematics"
            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          >
            View telematics integration documentation →
          </Link>
        </div>
      </div>
    </div>
  );
}
