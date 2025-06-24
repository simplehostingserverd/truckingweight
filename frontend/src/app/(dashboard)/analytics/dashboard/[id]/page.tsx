/**
 * Copyright (c) 2025 Cargo Scale Pro. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  EllipsisVerticalIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ChartBarIcon,
  TruckIcon,
  CurrencyDollarIcon,
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  BoltIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui';
import Link from 'next/link';
import { AnalyticsDashboard } from '@/types/analytics';
import ExecutiveDashboard from '@/components/dashboards/ExecutiveDashboard';
import OperationsDashboard from '@/components/dashboards/OperationsDashboard';
import SafetyDashboard from '@/components/dashboards/SafetyDashboard';

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const dashboardId = params.id as string;

  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboard();
  }, [dashboardId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // Mock dashboard data - will be replaced with API call
      const mockDashboards: Record<string, AnalyticsDashboard> = {
        'executive-dashboard': {
          id: 'executive-dashboard',
          name: 'Executive Dashboard',
          description: 'High-level KPIs and business metrics for executive leadership',
          widgets: [],
          layout: { columns: 3, rows: 2 },
          permissions: ['executive', 'manager'],
          isDefault: true,
          createdBy: 'System',
          createdAt: '2024-01-01T00:00:00Z',
          lastModified: '2025-01-20T10:00:00Z',
        },
        'operations-dashboard': {
          id: 'operations-dashboard',
          name: 'Operations Dashboard',
          description: 'Detailed operational metrics for fleet managers and dispatchers',
          widgets: [],
          layout: { columns: 2, rows: 3 },
          permissions: ['manager', 'dispatcher'],
          isDefault: false,
          createdBy: 'Operations Manager',
          createdAt: '2024-06-15T00:00:00Z',
          lastModified: '2025-01-18T14:30:00Z',
        },
        'safety-dashboard': {
          id: 'safety-dashboard',
          name: 'Safety Analytics',
          description: 'Comprehensive safety metrics and incident analysis',
          widgets: [],
          layout: { columns: 2, rows: 2 },
          permissions: ['safety_manager', 'executive'],
          isDefault: false,
          createdBy: 'Safety Manager',
          createdAt: '2024-09-01T00:00:00Z',
          lastModified: '2025-01-15T11:20:00Z',
        },
      };

      const dashboardData = mockDashboards[dashboardId];
      if (!dashboardData) {
        router.push('/analytics');
        return;
      }

      setDashboard(dashboardData);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading dashboard:', error);
      router.push('/analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setRefreshing(false);
  };

  const getDashboardIcon = (id: string) => {
    switch (id) {
      case 'executive-dashboard':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'operations-dashboard':
        return <TruckIcon className="h-5 w-5" />;
      case 'safety-dashboard':
        return <ShieldCheckIcon className="h-5 w-5" />;
      default:
        return <ChartBarIcon className="h-5 w-5" />;
    }
  };

  const renderDashboardContent = () => {
    switch (dashboardId) {
      case 'executive-dashboard':
        return <ExecutiveDashboard />;
      case 'operations-dashboard':
        return <OperationsDashboard />;
      case 'safety-dashboard':
        return <SafetyDashboard />;
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Dashboard Not Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  The requested dashboard could not be found.
                </p>
                <Link href="/analytics">
                  <Button>Back to Analytics</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/analytics">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {getDashboardIcon(dashboardId)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{dashboard.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{dashboard.description}</p>
            </div>
          </div>
          {dashboard.isDefault && <Badge className="bg-blue-100 text-blue-800">Default</Badge>}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <EllipsisVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Configure
              </DropdownMenuItem>
              <DropdownMenuItem>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Widget
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-6">{renderDashboardContent()}</div>
    </div>
  );
}
