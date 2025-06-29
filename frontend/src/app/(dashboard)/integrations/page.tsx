/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  ArrowRightIcon,
  BellIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  KeyIcon,
  PuzzlePieceIcon,
  ScaleIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function IntegrationsPage() {
  const [userData, setUserData] = useState<{ company_id: string; is_admin: boolean } | null>(null);
  const [activeIntegrations, setActiveIntegrations] = useState<number>(0);
  const [apiKeysCount, setApiKeysCount] = useState<number>(0);
  const [webhooksCount, setWebhooksCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        // Get user data
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: userDataResponse } = await supabase
          .from('users')
          .select('company_id, is_admin')
          .eq('id', user.id)
          .single();

        if (userDataResponse) {
          setUserData(userDataResponse);

          // Get active integrations count
          const { count: integrationsCount } = await supabase
            .from('integration_connections')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)
            .eq('company_id', userDataResponse.company_id);

          setActiveIntegrations(integrationsCount || 0);

          // Get API keys count
          const { count: keysCount } = await supabase
            .from('api_keys')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)
            .eq('company_id', userDataResponse.company_id);

          setApiKeysCount(keysCount || 0);

          // Get webhooks count
          const { count: hooksCount } = await supabase
            .from('webhook_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)
            .eq('company_id', userDataResponse.company_id);

          setWebhooksCount(hooksCount || 0);
        }
      } catch (error) {
        console.error('Error fetching integration data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Integrations Hub</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Connect your trucking operations with external systems and services
          </p>
        </div>
      </div>

      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
              <PuzzlePieceIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Integrations
              </p>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                  {activeIntegrations}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
              <KeyIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Keys</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                  {apiKeysCount}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-4">
              <BellIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Webhook Subscriptions
              </p>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                  {webhooksCount}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Integration Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* API Management */}
        <Link
          href="/integrations/api-keys"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
              <KeyIcon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">API Management</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create and manage API keys for secure access to your data
          </p>
          <div className="flex justify-end">
            <ArrowRightIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </Link>

        {/* Webhooks */}
        <Link
          href="/integrations/webhooks"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-4">
              <BellIcon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Webhooks</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Configure real-time notifications for weight and load events
          </p>
          <div className="flex justify-end">
            <ArrowRightIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </Link>

        {/* Security & Authentication */}
        <Link
          href="/integrations/security"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 mr-4">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Security</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manage authentication, encryption, and security settings
          </p>
          <div className="flex justify-end">
            <ArrowRightIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </Link>

        {/* Telematics Integration */}
        <Link
          href="/integrations/telematics"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
              <TruckIcon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Telematics</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect with Geotab, Samsara, and other telematics providers
          </p>
          <div className="flex justify-end">
            <ArrowRightIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </Link>

        {/* ERP & Accounting */}
        <Link
          href="/integrations/erp"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 mr-4">
              <BuildingLibraryIcon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              ERP & Accounting
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Integrate with SAP, NetSuite, QuickBooks, and other systems
          </p>
          <div className="flex justify-end">
            <ArrowRightIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
        </Link>

        {/* Scale & Hardware */}
        <Link
          href="/integrations/hardware"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 mr-4">
              <ScaleIcon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Scale & Hardware
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect with weighing equipment, sensors, and IoT devices
          </p>
          <div className="flex justify-end">
            <ArrowRightIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </Link>
      </div>

      {/* Documentation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-4">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Integration Documentation
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Comprehensive guides and API documentation to help you connect your systems with
          ScaleMasterAI.
        </p>
        <div className="mt-4">
          <Link
            href="/integrations/docs"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            View Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
