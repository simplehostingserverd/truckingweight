'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import Link from 'next/link';
import { 
  KeyIcon, 
  PlusIcon, 
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read']);
  const [newKeyExpiry, setNewKeyExpiry] = useState<string>('');
  const [newKeyCreated, setNewKeyCreated] = useState<{key: string, id: string} | null>(null);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Fetch API keys
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setApiKeys(data || []);
      } catch (err: any) {
        console.error('Error fetching API keys:', err);
        setError('Failed to load API keys');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApiKeys();
  }, [supabase]);

  // Toggle key visibility
  const toggleKeyVisibility = (id: string) => {
    setHiddenKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Copy key to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(id);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Create new API key
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('create_api_key', {
        name: newKeyName,
        permissions: newKeyPermissions,
        expires_at: newKeyExpiry ? new Date(newKeyExpiry).toISOString() : null
      });
      
      if (error) throw error;
      
      // Store the newly created key (only shown once)
      setNewKeyCreated({
        key: data.key,
        id: data.id
      });
      
      // Reset form
      setNewKeyName('');
      setNewKeyPermissions(['read']);
      setNewKeyExpiry('');
      setShowCreateForm(false);
      
      // Refresh the list
      const { data: updatedKeys } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      
      setApiKeys(updatedKeys || []);
    } catch (err: any) {
      console.error('Error creating API key:', err);
      setError('Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  // Delete API key
  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove from state
      setApiKeys(apiKeys.filter(key => key.id !== id));
    } catch (err: any) {
      console.error('Error deleting API key:', err);
      setError('Failed to delete API key');
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">API Keys</h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {newKeyCreated && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-md mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">API Key Created Successfully</p>
              <p className="text-sm mt-1">Copy this key now. You won't be able to see it again.</p>
            </div>
            <button 
              onClick={() => setNewKeyCreated(null)}
              className="text-green-800 dark:text-green-200 hover:text-green-600 dark:hover:text-green-400"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-800 flex justify-between items-center">
            <code className="font-mono text-sm">{newKeyCreated.key}</code>
            <button
              onClick={() => copyToClipboard(newKeyCreated.key, newKeyCreated.id)}
              className="ml-2 p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
              title="Copy to clipboard"
            >
              {copySuccess === newKeyCreated.id ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <ClipboardDocumentIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-800 text-white flex justify-between items-center">
          <div className="flex items-center">
            <KeyIcon className="h-5 w-5 mr-2" />
            <h2 className="text-xl font-semibold">API Keys</h2>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-green-800 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            New Key
          </button>
        </div>

        {showCreateForm && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Create New API Key</h3>
            <form onSubmit={handleCreateKey}>
              <div className="mb-4">
                <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Production API Key"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Permissions
                </label>
                <div className="flex flex-wrap gap-2">
                  {['read', 'write', 'delete'].map(perm => (
                    <label key={perm} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyPermissions([...newKeyPermissions, perm]);
                          } else {
                            setNewKeyPermissions(newKeyPermissions.filter(p => p !== perm));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="keyExpiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  id="keyExpiry"
                  value={newKeyExpiry}
                  onChange={(e) => setNewKeyExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newKeyName || newKeyPermissions.length === 0}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create API Key
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && !apiKeys.length ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            Loading API keys...
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No API keys found. Create your first API key to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Key
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {apiKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {key.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <code className="font-mono">
                          {key.key.startsWith('sm_') 
                            ? '••••••••' + key.key.slice(-8) 
                            : hiddenKeys.has(key.id) 
                              ? '••••••••' + key.key.slice(-8)
                              : key.key
                          }
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          title={hiddenKeys.has(key.id) ? "Show key" : "Hide key"}
                        >
                          {hiddenKeys.has(key.id) ? (
                            <EyeIcon className="h-4 w-4" />
                          ) : (
                            <EyeSlashIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(key.key, key.id)}
                          className="ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          title="Copy to clipboard"
                        >
                          {copySuccess === key.id ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.map(perm => (
                          <span 
                            key={perm} 
                            className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 capitalize"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {key.created_at ? formatDistanceToNow(new Date(key.created_at), { addSuffix: true }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {key.is_active ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">API Key Usage</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          API keys are used to authenticate requests to the ScaleMasterAI API. Each key has specific permissions that determine what actions it can perform.
        </p>
        <h4 className="text-md font-medium text-gray-800 dark:text-white mt-4 mb-2">Best Practices</h4>
        <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
          <li>Store API keys securely and never expose them in client-side code</li>
          <li>Use different keys for different environments (development, staging, production)</li>
          <li>Rotate keys periodically for enhanced security</li>
          <li>Limit permissions to only what is necessary for each integration</li>
          <li>Set expiration dates for temporary access</li>
        </ul>
      </div>
    </div>
  );
}
