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
import { Clock, MapPin, AlertTriangle, Truck, User, Activity } from 'lucide-react';

// Define interfaces for type safety
interface DriverActivity {
  id: string;
  driver_id: number;
  driver_name: string;
  activity_type: string;
  description: string;
  location: string;
  timestamp: string;
  metadata?: Record<string, unknown> | null;
  severity?: string;
}

interface LiveDriverActivityProps {
  companyId: number;
  maxItems?: number;
}

// Database response interfaces
interface DatabaseDriverActivity {
  id: string;
  driver_id: number;
  activity_type: string;
  description: string;
  location: string;
  timestamp: string;
  metadata: Record<string, unknown> | null;
  drivers: {
    name: string;
    company_id: number;
  } | null;
}

interface DatabaseAlert {
  id: string;
  driver_id: number;
  alert_type: string;
  message: string;
  severity: string;
  created_at: string;
  drivers: {
    name: string;
    company_id: number;
  } | null;
}

// Helper function to get appropriate icon for activity type
const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case 'weight_check':
    case 'weigh':
      return Activity;
    case 'status_update':
      return Truck;
    case 'break':
      return Clock;
    case 'location':
      return MapPin;
    case 'maintenance':
      return AlertTriangle;
    case 'alert':
    case 'emergency':
      return AlertTriangle;
    case 'communication':
      return User;
    default:
      return Truck;
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

export default function LiveDriverActivity({ companyId, maxItems = 10 }: LiveDriverActivityProps) {
  const [activities, setActivities] = useState<DriverActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchActivities = useCallback(async (): Promise<DriverActivity[]> => {
    try {
      const { data, error } = await supabase
        .from('driver_activities')
        .select(`
          id,
          driver_id,
          activity_type,
          description,
          location,
          timestamp,
          metadata,
          drivers!inner(name, company_id)
        `)
        .eq('drivers.company_id', companyId)
        .order('timestamp', { ascending: false })
        .limit(maxItems || 10);

      if (error) {
        console.error('Error fetching activities:', error);
        throw new Error(`Failed to fetch activities: ${error.message}`);
      }

      const typedData = data as DatabaseDriverActivity[] | null;
      
      return (typedData || []).map(activity => ({
        id: activity.id,
        driver_id: activity.driver_id,
        driver_name: activity.drivers?.name || 'Unknown Driver',
        activity_type: activity.activity_type,
        description: activity.description,
        location: activity.location,
        timestamp: activity.timestamp,
        metadata: activity.metadata,
        severity: (activity.metadata?.severity as string) || undefined,
      }));
    } catch (err) {
      console.error('Error in fetchActivities:', err);
      throw err;
    }
  }, [supabase, companyId, maxItems]);

  const fetchAlerts = useCallback(async (): Promise<DriverActivity[]> => {
    try {
      const { data, error } = await supabase
        .from('predictive_alerts')
        .select(`
          id,
          driver_id,
          alert_type,
          message,
          severity,
          created_at,
          drivers!inner(name, company_id)
        `)
        .eq('drivers.company_id', companyId)
        .eq('acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching alerts:', error);
        // Return empty array instead of throwing to not break the main flow
        return [];
      }

      const typedData = data as DatabaseAlert[] | null;
      
      // Convert alerts to activities format
      return (typedData || []).map(alert => ({
        id: `alert-${alert.id}`,
        driver_id: alert.driver_id,
        driver_name: alert.drivers?.name || 'Unknown Driver',
        activity_type: 'alert',
        description: alert.message,
        location: '', // Alerts might not have location
        timestamp: alert.created_at,
        metadata: { alert_type: alert.alert_type },
        severity: alert.severity,
      }));
    } catch (err) {
      console.error('Error in fetchAlerts:', err);
      // Return empty array instead of throwing to not break the main flow
      return [];
    }
  }, [supabase, companyId]);

  useEffect(() => {
    let isMounted = true;
    let refreshInterval: ReturnType<typeof setInterval> | null = null;
    let activityChannel: ReturnType<typeof supabase.channel> | null = null;
    let alertChannel: ReturnType<typeof supabase.channel> | null = null;

    const loadData = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load activities and alerts in parallel
        const [activitiesData, alertsData] = await Promise.all([
          fetchActivities(),
          fetchAlerts(),
        ]);
        
        if (!isMounted) return;
        
        // Combine and sort activities
        const combined = [...activitiesData, ...alertsData];
        const sorted = combined
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, maxItems || 10);
        
        setActivities(sorted);
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
          console.error('Error loading data:', err);
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set up real-time subscriptions
    const setupSubscriptions = () => {
      try {
        // Subscribe to driver activities
        activityChannel = supabase
          .channel(`driver-activities-${companyId}-${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'driver_activities',
            },
            () => {
              if (isMounted) {
                loadData();
              }
            }
          )
          .subscribe();

        // Subscribe to alerts
        alertChannel = supabase
          .channel(`predictive-alerts-${companyId}-${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'predictive_alerts',
            },
            () => {
              if (isMounted) {
                loadData();
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Error setting up subscriptions:', err);
      }
    };

    // Initial data load
    loadData();

    // Set up subscriptions
    setupSubscriptions();

    // Set up periodic refresh (every 30 seconds)
    refreshInterval = setInterval(() => {
      if (isMounted) {
        loadData();
      }
    }, 30000);

    // Cleanup function
    return () => {
      isMounted = false;
      
      if (activityChannel) {
        try {
          supabase.removeChannel(activityChannel);
        } catch (err) {
          console.error('Error removing activity channel:', err);
        }
      }
      
      if (alertChannel) {
        try {
          supabase.removeChannel(alertChannel);
        } catch (err) {
          console.error('Error removing alert channel:', err);
        }
      }
      
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [supabase, companyId, maxItems, fetchActivities, fetchAlerts]);

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
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
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
            <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
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
                          <MapPin className="h-3 w-3 text-gray-500 mr-1" />
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
