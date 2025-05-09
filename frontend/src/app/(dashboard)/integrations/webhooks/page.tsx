'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import Link from 'next/link';
import { 
  BellIcon, 
  PlusIcon, 
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface Webhook {
  id: string;
  name: string;
  event_types: string[];
  target_url: string;
  secret_key?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function WebhooksPage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>(['weight.created']);
  const [newWebhookCreated, setNewWebhookCreated] = useState<{secret_key: string, id: string} | null>(null);
  const [hiddenSecrets, setHiddenSecrets] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Available event types
  const availableEvents = [
    { value: 'weight.created', label: 'Weight Created' },
    { value: 'weight.updated', label: 'Weight Updated' },
    { value: 'load.created', label: 'Load Created' },
    { value: 'load.updated', label: 'Load Updated' },
    { value: 'vehicle.created', label: 'Vehicle Created' },
    { value: 'vehicle.updated', label: 'Vehicle Updated' },
    { value: 'driver.created', label: 'Driver Created' },
    { value: 'driver.updated', label: 'Driver Updated' },
    { value: 'compliance.alert', label: 'Compliance Alert' },
    { value: 'scale.reading', label: 'Scale Reading' },
    { value: 'ticket.generated', label: 'Ticket Generated' }
  ];

  // Fetch webhooks
  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('webhook_subscriptions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setWebhooks(data || []);
      } catch (err: any) {
        console.error('Error fetching webhooks:', err);
        setError('Failed to load webhooks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWebhooks();
  }, [supabase]);

  // Toggle secret visibility
  const toggleSecretVisibility = (id: string) => {
    setHiddenSecrets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(id);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Create new webhook
  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('create_webhook_subscription', {
        name: newWebhookName,
        event_types: newWebhookEvents,
        target_url: newWebhookUrl
      });
      
      if (error) throw error;
      
      // Store the newly created webhook secret (only shown once)
      setNewWebhookCreated({
        secret_key: data.secret_key,
        id: data.id
      });
      
      // Reset form
      setNewWebhookName('');
      setNewWebhookUrl('');
      setNewWebhookEvents(['weight.created']);
      setShowCreateForm(false);
      
      // Refresh the list
      const { data: updatedWebhooks } = await supabase
        .from('webhook_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      
      setWebhooks(updatedWebhooks || []);
    } catch (err: any) {
      console.error('Error creating webhook:', err);
      setError('Failed to create webhook');
    } finally {
      setLoading(false);
    }
  };

  // Regenerate webhook secret
  const handleRegenerateSecret = async (id: string) => {
    if (!confirm('Are you sure you want to regenerate the secret key? All existing integrations using this webhook will need to be updated.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('regenerate_webhook_secret', {
        webhook_id: id
      });
      
      if (error) throw error;
      
      // Show the new secret
      setNewWebhookCreated({
        secret_key: data.secret_key,
        id: id
      });
      
      // Refresh the list
      const { data: updatedWebhooks } = await supabase
        .from('webhook_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      
      setWebhooks(updatedWebhooks || []);
    } catch (err: any) {
      console.error('Error regenerating webhook secret:', err);
      setError('Failed to regenerate webhook secret');
    } finally {
      setLoading(false);
    }
  };

  // Delete webhook
  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('webhook_subscriptions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove from state
      setWebhooks(webhooks.filter(webhook => webhook.id !== id));
    } catch (err: any) {
      console.error('Error deleting webhook:', err);
      setError('Failed to delete webhook');
    } finally {
      setLoading(false);
    }
  };

  // Toggle webhook active status
  const toggleWebhookStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('webhook_subscriptions')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update in state
      setWebhooks(webhooks.map(webhook => 
        webhook.id === id 
          ? { ...webhook, is_active: !currentStatus } 
          : webhook
      ));
    } catch (err: any) {
      console.error('Error updating webhook status:', err);
      setError('Failed to update webhook status');
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Webhooks</h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {newWebhookCreated && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-md mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Webhook Secret Key</p>
              <p className="text-sm mt-1">Copy this secret key now. You won't be able to see it again.</p>
            </div>
            <button 
              onClick={() => setNewWebhookCreated(null)}
              className="text-green-800 dark:text-green-200 hover:text-green-600 dark:hover:text-green-400"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-800 flex justify-between items-center">
            <code className="font-mono text-sm">{newWebhookCreated.secret_key}</code>
            <button
              onClick={() => copyToClipboard(newWebhookCreated.secret_key, newWebhookCreated.id)}
              className="ml-2 p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
              title="Copy to clipboard"
            >
              {copySuccess === newWebhookCreated.id ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <ClipboardDocumentIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white flex justify-between items-center">
          <div className="flex items-center">
            <BellIcon className="h-5 w-5 mr-2" />
            <h2 className="text-xl font-semibold">Webhook Subscriptions</h2>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-purple-800 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            New Webhook
          </button>
        </div>

        {showCreateForm && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Create New Webhook</h3>
            <form onSubmit={handleCreateWebhook}>
              <div className="mb-4">
                <label htmlFor="webhookName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Webhook Name
                </label>
                <input
                  type="text"
                  id="webhookName"
                  value={newWebhookName}
                  onChange={(e) => setNewWebhookName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Weight Updates Webhook"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target URL
                </label>
                <input
                  type="url"
                  id="webhookUrl"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/webhook"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Types
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {availableEvents.map(event => (
                    <label key={event.value} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={newWebhookEvents.includes(event.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhookEvents([...newWebhookEvents, event.value]);
                          } else {
                            setNewWebhookEvents(newWebhookEvents.filter(ev => ev !== event.value));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{event.label}</span>
                    </label>
                  ))}
                </div>
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
                  disabled={loading || !newWebhookName || !newWebhookUrl || newWebhookEvents.length === 0}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Webhook
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && !webhooks.length ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            Loading webhooks...
          </div>
        ) : webhooks.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No webhooks found. Create your first webhook to get started.
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
                    URL
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Events
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
                {webhooks.map((webhook) => (
                  <tr key={webhook.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {webhook.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <span className="truncate max-w-xs">{webhook.target_url}</span>
                        <button
                          onClick={() => copyToClipboard(webhook.target_url, `url-${webhook.id}`)}
                          className="ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          title="Copy URL"
                        >
                          {copySuccess === `url-${webhook.id}` ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-wrap gap-1">
                        {webhook.event_types.slice(0, 2).map(event => (
                          <span 
                            key={event} 
                            className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                          >
                            {event}
                          </span>
                        ))}
                        {webhook.event_types.length > 2 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                            +{webhook.event_types.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {webhook.created_at ? formatDistanceToNow(new Date(webhook.created_at), { addSuffix: true }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleWebhookStatus(webhook.id, webhook.is_active)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          webhook.is_active 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}
                      >
                        {webhook.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleRegenerateSecret(webhook.id)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Regenerate Secret"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(webhook.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Webhook"
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
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Webhook Usage</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Webhooks allow external systems to receive real-time notifications when events occur in your ScaleMasterAI account.
        </p>
        <h4 className="text-md font-medium text-gray-800 dark:text-white mt-4 mb-2">Security</h4>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Each webhook includes a secret key that is used to sign the payload. Verify the signature in your webhook handler to ensure the request is authentic.
        </p>
        <h4 className="text-md font-medium text-gray-800 dark:text-white mt-4 mb-2">Payload Format</h4>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          All webhook payloads follow this format:
        </p>
        <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md text-sm overflow-x-auto mb-4">
{`{
  "event_type": "weight.created",
  "timestamp": "2023-06-15T14:22:10Z",
  "data": {
    // Event-specific data
  }
}`}
        </pre>
        <Link 
          href="/integrations/docs#webhooks" 
          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
        >
          View webhook documentation →
        </Link>
      </div>
    </div>
  );
}
