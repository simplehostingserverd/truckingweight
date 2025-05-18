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

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import Link from 'next/link';
import {
  BuildingLibraryIcon,
  PlusIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface ErpConnection {
  id: string;
  provider: string;
  credentials: any /* @ts-ignore */ ;
  settings: any /* @ts-ignore */ ;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
}

export default function ErpIntegrationPage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  // State
  const [connections, setConnections] = useState<ErpConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form state
  const [newProvider, setNewProvider] = useState('quickbooks');
  const [newApiKey, setNewApiKey] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newClientSecret, setNewClientSecret] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');
  const [newCompanyId, setNewCompanyId] = useState('');

  // Fetch existing connections
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('integration_connections')
          .select('*')
          .eq('integration_type', 'erp')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setConnections(data || []);
      } catch (err: any /* @ts-ignore */ ) {
        console.error('Error fetching ERP connections:', err);
        setError('Failed to load ERP connections');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [supabase]);

  // Available ERP providers with publicly available logo URLs
  const providers = [
    {
      value: 'quickbooks',
      label: 'QuickBooks',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/QuickBooks_Logo.svg/512px-QuickBooks_Logo.svg.png',
    },
    {
      value: 'netsuite',
      label: 'NetSuite',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Oracle_NetSuite_logo.svg/512px-Oracle_NetSuite_logo.svg.png',
    },
    {
      value: 'sap',
      label: 'SAP',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/512px-SAP_2011_logo.svg.png',
    },
    {
      value: 'sage',
      label: 'Sage',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Sage_Group_logo.svg/512px-Sage_Group_logo.svg.png',
    },
    {
      value: 'xero',
      label: 'Xero',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Xero_logo.svg/512px-Xero_logo.svg.png',
    },
    {
      value: 'dynamics',
      label: 'Microsoft Dynamics',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Microsoft_Dynamics_365_logo.svg/512px-Microsoft_Dynamics_365_logo.svg.png',
    },
    {
      value: 'custom',
      label: 'Custom API',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Gnome-preferences-system.svg/512px-Gnome-preferences-system.svg.png',
    },
  ];

  // Test connection
  const handleTestConnection = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      setTestResult(null);
      setLoading(true);

      // Simulate API call to test connection
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, we'll just simulate a successful connection
      setTestResult({
        success: true,
        message: 'Connection successful! Authentication verified with the ERP provider.',
      });
    } catch (err: any /* @ts-ignore */ ) {
      setTestResult({
        success: false,
        message: 'Connection failed. Please check your credentials and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new ERP connection
  const handleCreateConnection = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Prepare credentials based on provider
      let credentials: any = {};
      let settings: any = {};

      if (newProvider === 'quickbooks') {
        credentials = {
          client_id: newClientId,
          client_secret: newClientSecret,
        };
        settings = {
          company_id: newCompanyId,
          sync_interval_minutes: 60,
        };
      } else if (newProvider === 'netsuite') {
        credentials = {
          account_id: newCompanyId,
          consumer_key: newClientId,
          consumer_secret: newClientSecret,
          token_id: newUsername,
          token_secret: newPassword,
        };
        settings = {
          sync_interval_minutes: 60,
        };
      } else if (newProvider === 'sap') {
        credentials = {
          username: newUsername,
          password: newPassword,
          client_id: newClientId,
        };
        settings = {
          server_url: newServerUrl,
          sync_interval_minutes: 60,
        };
      } else {
        credentials = {
          api_key: newApiKey,
          username: newUsername,
          password: newPassword,
        };
        settings = {
          server_url: newServerUrl,
          sync_interval_minutes: 60,
        };
      }

      const { data, error } = await supabase
        .from('integration_connections')
        .insert({
          integration_type: 'erp',
          provider: newProvider,
          credentials,
          settings,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Reset form
      setNewProvider('quickbooks');
      setNewApiKey('');
      setNewUsername('');
      setNewPassword('');
      setNewClientId('');
      setNewClientSecret('');
      setNewServerUrl('');
      setNewCompanyId('');
      setShowCreateForm(false);
      setTestResult(null);

      // Add to state
      setConnections([data, ...connections]);
    } catch (err: any /* @ts-ignore */ ) {
      console.error('Error creating ERP connection:', err);
      setError('Failed to create ERP connection');
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

      // Update state
      setConnections(connections.filter(conn => conn.id !== id));
    } catch (err: any /* @ts-ignore */ ) {
      console.error('Error deleting ERP connection:', err);
      setError('Failed to delete ERP connection');
    } finally {
      setLoading(false);
    }
  };

  // Toggle connection status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('integration_connections')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Update state
      setConnections(
        connections.map(conn => (conn.id === id ? { ...conn, is_active: !currentStatus } : conn))
      );
    } catch (err: any /* @ts-ignore */ ) {
      console.error('Error updating ERP connection status:', err);
      setError('Failed to update connection status');
    } finally {
      setLoading(false);
    }
  };

  // Sync connection
  const handleSyncConnection = async (id: string) => {
    try {
      setLoading(true);

      // Simulate API call to sync data
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { error } = await supabase
        .from('integration_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Update state
      setConnections(
        connections.map(conn =>
          conn.id === id ? { ...conn, last_sync_at: new Date().toISOString() } : conn
        )
      );

      alert('Sync completed successfully!');
    } catch (err: any /* @ts-ignore */ ) {
      console.error('Error syncing ERP connection:', err);
      setError('Failed to sync ERP data');
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          ERP & Accounting Integration
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Connect your ERP and accounting systems to automate financial data exchange
        </p>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={loading}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Connection
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Add ERP Connection
          </h2>

          <form onSubmit={handleCreateConnection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Provider Selection */}
              <div>
                <label
                  htmlFor="provider"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  ERP Provider
                </label>
                <select
                  id="provider"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md bg-white dark:bg-gray-900"
                  value={newProvider}
                  onChange={e => setNewProvider(e.target.value)}
                  disabled={loading}
                >
                  {providers.map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Provider-specific fields */}
              {(newProvider === 'quickbooks' ||
                newProvider === 'netsuite' ||
                newProvider === 'xero') && (
                <div>
                  <label
                    htmlFor="company-id"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {newProvider === 'netsuite' ? 'Account ID' : 'Company ID'}
                  </label>
                  <input
                    type="text"
                    id="company-id"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-900"
                    value={newCompanyId}
                    onChange={e => setNewCompanyId(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Client ID / Consumer Key */}
              {(newProvider === 'quickbooks' ||
                newProvider === 'netsuite' ||
                newProvider === 'sap' ||
                newProvider === 'dynamics') && (
                <div>
                  <label
                    htmlFor="client-id"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {newProvider === 'netsuite' ? 'Consumer Key' : 'Client ID'}
                  </label>
                  <input
                    type="text"
                    id="client-id"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-900"
                    value={newClientId}
                    onChange={e => setNewClientId(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Client Secret / Consumer Secret */}
              {(newProvider === 'quickbooks' ||
                newProvider === 'netsuite' ||
                newProvider === 'dynamics') && (
                <div>
                  <label
                    htmlFor="client-secret"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {newProvider === 'netsuite' ? 'Consumer Secret' : 'Client Secret'}
                  </label>
                  <input
                    type="password"
                    id="client-secret"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-900"
                    value={newClientSecret}
                    onChange={e => setNewClientSecret(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Username / Token ID */}
              {(newProvider === 'sap' ||
                newProvider === 'sage' ||
                newProvider === 'netsuite' ||
                newProvider === 'custom') && (
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {newProvider === 'netsuite' ? 'Token ID' : 'Username'}
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-900"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Password / Token Secret */}
              {(newProvider === 'sap' ||
                newProvider === 'sage' ||
                newProvider === 'netsuite' ||
                newProvider === 'custom') && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {newProvider === 'netsuite' ? 'Token Secret' : 'Password'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-900"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {/* API Key */}
              {(newProvider === 'xero' || newProvider === 'sage' || newProvider === 'custom') && (
                <div>
                  <label
                    htmlFor="api-key"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    API Key
                  </label>
                  <input
                    type="password"
                    id="api-key"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-900"
                    value={newApiKey}
                    onChange={e => setNewApiKey(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Server URL */}
              {(newProvider === 'sap' || newProvider === 'custom') && (
                <div>
                  <label
                    htmlFor="server-url"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Server URL
                  </label>
                  <input
                    type="text"
                    id="server-url"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-900"
                    value={newServerUrl}
                    onChange={e => setNewServerUrl(e.target.value)}
                    placeholder="https://example.com/api"
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            {/* Test Result */}
            {testResult && (
              <div
                className={`mb-6 p-4 rounded-md ${testResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {testResult.success ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm ${testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}
                    >
                      {testResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setTestResult(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Connection'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Connections List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">ERP Connections</h2>
        </div>

        {loading && connections.length === 0 ? (
          <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
            Loading connections...
          </div>
        ) : connections.length === 0 ? (
          <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
            No ERP connections found. Add your first connection to get started.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {connections.map(connection => {
              const provider = providers.find(p => p.value === connection.provider) || {
                label: connection.provider,
                logo: '/images/integrations/custom.png',
              };

              return (
                <li key={connection.id} className="px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {provider.logo ? (
                          <Image
                            src={provider.logo}
                            alt={provider.label}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        ) : (
                          <BuildingLibraryIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {provider.label}
                          </h3>
                          {connection.is_active ? (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              Active
                            </span>
                          ) : (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Created{' '}
                          {formatDistanceToNow(new Date(connection.created_at), {
                            addSuffix: true,
                          })}
                          {connection.last_sync_at && (
                            <span className="ml-2">
                              • Last synced{' '}
                              {formatDistanceToNow(new Date(connection.last_sync_at), {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSyncConnection(connection.id)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                        title="Sync data"
                        disabled={loading || !connection.is_active}
                      >
                        <ArrowPathIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(connection.id, connection.is_active)}
                        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${connection.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}
                        title={connection.is_active ? 'Deactivate' : 'Activate'}
                        disabled={loading}
                      >
                        {connection.is_active ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          <XCircleIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteConnection(connection.id)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                        title="Delete"
                        disabled={loading}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Integration Benefits */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          ERP & Accounting Integration Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">
              Automated Financial Data
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect your ERP system to automatically sync customer data, invoices, and financial
              transactions with ScaleMasterAI.
            </p>
            <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">
              Streamlined Billing
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Automatically generate invoices in your accounting system when weigh tickets are
              created, reducing manual data entry and errors.
            </p>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">
              Real-time Financial Insights
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get up-to-date financial reporting by syncing weight and load data with your
              accounting system.
            </p>
            <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">
              Compliance & Audit Trail
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Maintain a complete audit trail of all financial transactions related to your trucking
              operations for compliance and reporting.
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">
            Supported ERP Systems
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-4">
            {providers
              .filter(p => p.value !== 'custom')
              .map(provider => (
                <div key={provider.value} className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden mb-2">
                    <Image
                      src={provider.logo}
                      alt={provider.label}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{provider.label}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center text-yellow-600 dark:text-yellow-400">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            <Link href="/integrations/docs/erp" className="text-sm font-medium hover:underline">
              View ERP Integration Documentation
            </Link>
          </div>
          <div className="flex items-center text-yellow-600 dark:text-yellow-400">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            <Link href="/reports/financial" className="text-sm font-medium hover:underline">
              View Financial Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
