/*
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

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  TruckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  ScaleIcon,
  WrenchScrewdriverIcon,
  ChatBubbleLeftIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

interface DriverActivity {
  id: string;
  driver_id: number;
  driver_name: string;
  activity_type: string;
  description: string;
  location?: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

interface LiveDriverActivityProps {
  companyId?: number | null;
  maxItems?: number;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'weight_check':
    case 'weigh':
      return ScaleIcon;
    case 'status_update':
      return TruckIcon;
    case 'break':
      return ClockIcon;
    case 'location':
      return MapPinIcon;
    case 'maintenance':
      return WrenchScrewdriverIcon;
    case 'alert':
    case 'emergency':
      return ShieldExclamationIcon;
    case 'communication':
      return ChatBubbleLeftIcon;
    default:
      return TruckIcon;
  }
};

const getActivityColor = (type: string, severity?: string) => {
  if (severity === 'critical' || type === 'emergency') return 'text-red-400 bg-red-900/20';
  if (severity === 'high') return 'text-orange-400 bg-orange-900/20';
  if (severity === 'medium') return 'text-yellow-400 bg-yellow-900/20';

  switch (type) {
    case 'weight_check':
    case 'weigh':
      return 'text-blue-400 bg-blue-900/20';
    case 'status_update':
      return 'text-green-400 bg-green-900/20';
    case 'break':
      return 'text-purple-400 bg-purple-900/20';
    case 'location':
      return 'text-cyan-400 bg-cyan-900/20';
    case 'maintenance':
      return 'text-orange-400 bg-orange-900/20';
    case 'alert':
      return 'text-yellow-400 bg-yellow-900/20';
    case 'communication':
      return 'text-indigo-400 bg-indigo-900/20';
    default:
      return 'text-gray-400 bg-gray-900/20';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function LiveDriverActivity({ companyId, maxItems = 20 }: LiveDriverActivityProps) {
  const [activities, setActivities] = useState<DriverActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchActivities = useCallback(async () => {
    try {
      let query = supabase
        .from('driver_activities')
        .select(
          `
          id,
          driver_id,
          activity_type,
          description,
          location,
          timestamp,
          metadata,
          drivers(
            name
          )
        `
        )
        .order('timestamp', { ascending: false })
        .limit(maxItems);

      // Filter by company if specified
      if (companyId) {
        query = query.eq('drivers.company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedActivities =
        data?.map(activity => ({
          id: activity.id as string,
          driver_id: activity.driver_id,
          driver_name: activity.drivers?.name || 'Unknown Driver',
          activity_type: activity.activity_type,
          description: activity.description,
          location: activity.location,
          timestamp: activity.timestamp,
          metadata: activity.metadata,
          severity: (activity as any).metadata?.severity as 'low' | 'medium' | 'high' | 'critical',
        })) || [];

      setActivities(formattedActivities);
    } catch (err) {
      console.error('Error fetching driver activities:', err);
      setError('Failed to load driver activities');
    } finally {
      setLoading(false);
    }
  }, [supabase, companyId, maxItems]);

  const fetchAlerts = useCallback(async () => {
    try {
      let query = supabase
        .from('predictive_alerts')
        .select(
          `
          id,
          driver_id,
          alert_type,
          message,
          severity,
          created_at,
          drivers(
            name
          )
        `
        )
        .eq('acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(10);

      // Filter by company if specified
      if (companyId) {
        query = query.eq('drivers.company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const alertActivities =
        data?.map(alert => ({
          id: `alert-${alert.id}`,
          driver_id: alert.driver_id,
          driver_name: alert.drivers?.name || 'Unknown Driver',
          activity_type: 'alert',
          description: alert.message,
          timestamp: alert.created_at,
          severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
        })) || [];

      // Merge with existing activities and sort
      setActivities(prev => {
        const combined = [...prev, ...alertActivities];
        return combined
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, maxItems);
      });
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  }, [supabase, companyId, maxItems]);

  useEffect(() => {
    fetchActivities();
    fetchAlerts();

    // Set up real-time subscriptions
    const activitiesChannel = supabase
      .channel('driver_activities_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'driver_activities',
        },
        payload => {
          console.log('New driver activity:', payload);
          fetchActivities(); // Refresh data when new activity is inserted
        }
      )
      .subscribe();

    const alertsChannel = supabase
      .channel('alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'predictive_alerts',
        },
        payload => {
          console.log('Alert change:', payload);
          fetchAlerts(); // Refresh alerts when they change
        }
      )
      .subscribe();

    // Refresh data every 30 seconds as fallback
    const interval = setInterval(() => {
      fetchActivities();
      fetchAlerts();
    }, 30000);

    return () => {
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(alertsChannel);
      clearInterval(interval);
    };
  }, [fetchActivities, fetchAlerts, supabase]);

  if (loading) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Live Driver Activity</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Live Driver Activity</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-red-400">
            <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold text-white">Live Driver Activity</h2>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <TruckIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent driver activity</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {activities.map(activity => {
              const IconComponent = getActivityIcon(activity.activity_type);
              const colorClasses = getActivityColor(activity.activity_type, activity.severity);

              return (
                <div key={activity.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${colorClasses}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {activity.driver_name}
                        </p>
                        <p className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{activity.description}</p>
                      {activity.location && (
                        <div className="flex items-center mt-1">
                          <MapPinIcon className="h-3 w-3 text-gray-500 mr-1" />
                          <p className="text-xs text-gray-500">{activity.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
