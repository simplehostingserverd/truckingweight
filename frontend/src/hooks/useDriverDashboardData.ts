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

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface CargoData {
  currentWeight: number;
  weightLimit: number;
  isOverweight: boolean;
  loadId?: string;
  cargoType?: string;
}

export interface TelematicsData {
  currentSpeed: number;
  speedLimit: number;
  isOverSpeed: boolean;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  isOnline: boolean;
  batteryLevel?: number;
}

export interface AlertData {
  id: string;
  type: 'critical' | 'warning' | 'info';
  priority: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface HOSData {
  drivingTime: number;
  onDutyTime: number;
  remainingDriveTime: number;
  remainingOnDutyTime: number;
  nextBreakRequired: string;
  status: 'available' | 'driving' | 'on_duty' | 'off_duty' | 'sleeper';
  violationRisk: 'none' | 'low' | 'medium' | 'high';
}

export interface LoadData {
  currentLoad?: {
    id: string;
    pickupLocation: string;
    deliveryLocation: string;
    weight: number;
    status: string;
  };
  pickupETA?: string;
  deliveryETA?: string;
  status: 'assigned' | 'en_route_pickup' | 'loaded' | 'en_route_delivery' | 'delivered';
}

export interface VehicleData {
  fuelLevel: number;
  maintenanceAlerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
  }>;
  engineStatus: 'good' | 'warning' | 'critical';
  tireStatus: 'good' | 'warning' | 'critical';
}

export interface ActivityItem {
  id: string;
  type: 'weight_check' | 'status_update' | 'break' | 'fuel' | 'maintenance' | 'delivery' | 'pickup';
  message: string;
  timestamp: string;
  location?: string;
}

export interface DriverDashboardData {
  cargoData: CargoData | null;
  telematicsData: TelematicsData | null;
  alertsData: AlertData[] | null;
  hosData: HOSData | null;
  loadData: LoadData | null;
  vehicleData: VehicleData | null;
  recentActivity: ActivityItem[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: (sections?: string[]) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  updateDriverStatus: (status: string) => Promise<void>;
  reportIncident: (incident: any) => Promise<void>;
  logBreak: (breakType: string) => Promise<void>;
}

export function useDriverDashboardData(driverId: string): DriverDashboardData {
  const [cargoData, setCargoData] = useState<CargoData | null>(null);
  const [telematicsData, setTelematicsData] = useState<TelematicsData | null>(null);
  const [alertsData, setAlertsData] = useState<AlertData[] | null>(null);
  const [hosData, setHOSData] = useState<HOSData | null>(null);
  const [loadData, setLoadData] = useState<LoadData | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchCargoData = useCallback(async (): Promise<CargoData | null> => {
    try {
      // Handle both UUID strings and integer IDs
      const driverIdValue = isNaN(parseInt(driverId)) ? driverId : parseInt(driverId);
      
      // Get current load for the driver
      const { data: currentLoad, error } = await supabase
        .from('loads')
        .select(
          `
          id,
          description,
          status,
          pickup_location,
          delivery_location,
          scheduled_pickup,
          scheduled_delivery,
          actual_pickup,
          actual_delivery,
          weight,
          weigh_tickets(
            id,
            gross_weight,
            tare_weight,
            net_weight,
            created_at
          )
        `
        )
        .eq('driver_id', driverIdValue)
        .in('status', ['assigned', 'in_transit', 'at_pickup', 'at_delivery'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Supabase error fetching cargo data:', error);
        return null;
      }

      if (currentLoad) {
        const latestWeighTicket = currentLoad.weigh_tickets?.[0];
        const currentWeight = latestWeighTicket?.gross_weight || currentLoad.weight || 0;
        const weightLimit = 80000; // This should come from vehicle data
        
        return {
          currentWeight,
          weightLimit,
          isOverweight: currentWeight > weightLimit,
          loadId: currentLoad.id?.toString(),
          cargoType: currentLoad.description || 'General Freight',
        };
      } else {
        // No active load
        return {
          currentWeight: 0,
          weightLimit: 80000,
          isOverweight: false,
        };
      }
    } catch (err) {
      console.error('Error fetching cargo data:', err);
      return null;
    }
  }, [driverId, supabase]);

  const fetchTelematicsData = useCallback(async (): Promise<TelematicsData | null> => {
    try {
      // Handle both UUID strings and integer IDs
      const driverIdValue = isNaN(parseInt(driverId)) ? driverId : parseInt(driverId);
      
      // Mock telematics data - replace with actual API call
      return {
        currentSpeed: Math.floor(Math.random() * 70) + 10, // 10-80 mph
        speedLimit: 70,
        isOverSpeed: false,
        location: {
          lat: 32.7767 + (Math.random() - 0.5) * 0.1,
          lng: -96.797 + (Math.random() - 0.5) * 0.1,
          address: 'Dallas, TX',
        },
        isOnline: true,
        batteryLevel: Math.floor(Math.random() * 30) + 70, // 70-100%
      };
    } catch (err) {
      console.error('Error fetching telematics data:', err);
      return null;
    }
  }, [driverId]);

  const fetchAlertsData = useCallback(async (): Promise<AlertData[]> => {
    try {
      // Handle both UUID strings and integer IDs
      const driverIdValue = isNaN(parseInt(driverId)) ? driverId : parseInt(driverId);
      
      // Fetch active alerts for the driver
      const { data: driverAlerts, error } = await supabase
        .from('predictive_alerts')
        .select(
          `
          id,
          alert_type,
          severity,
          message,
          created_at,
          acknowledged
        `
        )
        .eq('driver_id', driverIdValue)
        .eq('acknowledged', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching alerts data:', error);
        return [];
      }

      if (driverAlerts && driverAlerts.length > 0) {
        const formattedAlerts = driverAlerts.map(alert => ({
          id: alert.id.toString(),
          type: (alert.alert_type || 'info') as 'critical' | 'warning' | 'info',
          priority: (alert.severity || 'low') as 'critical' | 'high' | 'medium' | 'low',
          message: alert.message || 'No message available',
          timestamp: alert.created_at,
          acknowledged: alert.acknowledged || false,
        }));
        return formattedAlerts;
      } else {
        return [];
      }
    } catch (err) {
      console.error('Error fetching alerts data:', err);
      return [];
    }
  }, [driverId, supabase]);

  const fetchHOSData = useCallback(async (): Promise<HOSData | null> => {
    try {
      // Mock HOS data - replace with actual API call
      return {
        drivingTime: 8.5, // hours
        onDutyTime: 12.0,
        remainingDriveTime: 2.5,
        remainingOnDutyTime: 2.0,
        nextBreakRequired: '2:30 PM',
        status: 'driving',
        violationRisk: 'medium',
      };
    } catch (err) {
      console.error('Error fetching HOS data:', err);
      return null;
    }
  }, []);

  const fetchLoadData = useCallback(async (): Promise<LoadData | null> => {
    try {
      // Handle both UUID strings and integer IDs
      const driverIdValue = isNaN(parseInt(driverId)) ? driverId : parseInt(driverId);
      
      const { data: currentLoad, error } = await supabase
        .from('loads')
        .select('*')
        .eq('driver_id', driverIdValue)
        .in('status', ['assigned', 'in_transit', 'at_pickup', 'at_delivery'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Supabase error fetching load data:', error);
        return null;
      }

      if (!currentLoad) {
        return {
          status: 'assigned',
        };
      }

      return {
        currentLoad: {
          id: currentLoad.id.toString(),
          pickupLocation: currentLoad.pickup_location || '',
          deliveryLocation: currentLoad.delivery_location || '',
          weight: currentLoad.weight || 0,
          status: currentLoad.status || 'assigned',
        },
        pickupETA: currentLoad.pickup_eta,
        deliveryETA: currentLoad.delivery_eta,
        status: currentLoad.status as 'assigned' | 'en_route_pickup' | 'loaded' | 'en_route_delivery' | 'delivered',
      };
    } catch (err) {
      console.error('Error fetching load data:', err);
      return null;
    }
  }, [driverId, supabase]);

  const fetchVehicleData = useCallback(async (): Promise<VehicleData | null> => {
    try {
      // Handle both UUID strings and integer IDs
      const driverIdValue = isNaN(parseInt(driverId)) ? driverId : parseInt(driverId);
      
      // Get current vehicle assignment for the driver
      const { data: driverVehicle } = await supabase
        .from('drivers')
        .select(
          `
          id,
          vehicles(
            id,
            make,
            model,
            year,
            license_plate,
            vin,
            fuel_capacity,
            max_weight
          )
        `
        )
        .eq('id', driverIdValue)
        .single();

      if (driverVehicle?.vehicles) {
        // Get latest vehicle telemetry data (if available)
        // For now, using mock data but structured for real implementation
        return {
          fuelLevel: Math.floor(Math.random() * 40) + 30, // 30-70% - Would come from vehicle sensors
          maintenanceAlerts: [
            {
              type: 'oil_change',
              severity: 'medium',
              message: 'Oil change due in 500 miles',
            },
          ],
          engineStatus: 'good',
          tireStatus: 'good',
        };
      } else {
        // No vehicle assigned
        return {
          fuelLevel: 0,
          maintenanceAlerts: [],
          engineStatus: 'good',
          tireStatus: 'good',
        };
      }
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
      return null;
    }
  }, [driverId, supabase]);

  const fetchRecentActivity = useCallback(async (): Promise<ActivityItem[]> => {
    try {
      // Handle both UUID strings and integer IDs
      const driverIdValue = isNaN(parseInt(driverId)) ? driverId : parseInt(driverId);
      
      const activities: ActivityItem[] = [];

      // Fetch recent weigh tickets
      const { data: weighTickets, error: weighError } = await supabase
        .from('weigh_tickets')
        .select('id, gross_weight, net_weight, created_at, location')
        .eq('driver_id', driverIdValue)
        .order('created_at', { ascending: false })
        .limit(5);

      if (weighError) {
        console.error('Error fetching weigh tickets:', weighError);
      } else {
        weighTickets?.forEach(ticket => {
          activities.push({
            id: `weigh-${ticket.id}`,
            type: 'weight_check',
            message: `Weight verified: ${ticket.gross_weight || 0} lbs`,
            timestamp: ticket.created_at,
            location: ticket.location || 'Unknown location',
          });
        });
      }

      // Fetch recent load status updates
      const { data: loads, error: loadsError } = await supabase
        .from('loads')
        .select('id, status, pickup_location, delivery_location, updated_at')
        .eq('driver_id', driverIdValue)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (loadsError) {
        console.error('Error fetching loads:', loadsError);
      } else {
        loads?.forEach(load => {
          activities.push({
            id: `load-${load.id}`,
            type: 'status_update',
            message: `Load status updated to ${load.status || 'unknown'}`,
            timestamp: load.updated_at,
            location: load.pickup_location || load.delivery_location || undefined,
          });
        });
      }

      // Fetch recent maintenance alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('predictive_alerts')
        .select('id, alert_type, message, created_at, severity')
        .eq('driver_id', parseInt(driverId))
        .order('created_at', { ascending: false })
        .limit(3);

      if (alertsError) {
        console.error('Error fetching alerts:', alertsError);
      } else {
        alerts?.forEach(alert => {
          activities.push({
            id: `alert-${alert.id}`,
            type: 'maintenance',
            message: alert.message || 'Maintenance alert',
            timestamp: alert.created_at,
          });
        });
      }

      // Sort all activities by timestamp and return latest 10
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      return [];
    }
  }, [driverId, supabase]);

  const fetchAllData = useCallback(async (sections?: string[]) => {
    const sectionsToFetch = sections || ['cargo', 'telematics', 'alerts', 'hos', 'load', 'vehicle', 'activity'];
    
    // Only set loading if fetching all data
    if (!sections) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const promises: Promise<any>[] = [];
      const sectionMap: { [key: string]: number } = {};
      
      sectionsToFetch.forEach((section, index) => {
        sectionMap[section] = index;
        switch (section) {
          case 'cargo':
            promises.push(fetchCargoData());
            break;
          case 'telematics':
            promises.push(fetchTelematicsData());
            break;
          case 'alerts':
            promises.push(fetchAlertsData());
            break;
          case 'hos':
            promises.push(fetchHOSData());
            break;
          case 'load':
            promises.push(fetchLoadData());
            break;
          case 'vehicle':
            promises.push(fetchVehicleData());
            break;
          case 'activity':
            promises.push(fetchRecentActivity());
            break;
        }
      });
      
      const results = await Promise.all(promises);
      
      sectionsToFetch.forEach((section, index) => {
        const result = results[index];
        switch (section) {
          case 'cargo':
            setCargoData(result);
            break;
          case 'telematics':
            setTelematicsData(result);
            break;
          case 'alerts':
            setAlertsData(result);
            break;
          case 'hos':
            setHOSData(result);
            break;
          case 'load':
            setLoadData(result);
            break;
          case 'vehicle':
            setVehicleData(result);
            break;
          case 'activity':
            setRecentActivity(result);
            break;
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      if (!sections) {
        setIsLoading(false);
      }
    }
  }, [fetchCargoData, fetchTelematicsData, fetchAlertsData, fetchHOSData, fetchLoadData, fetchVehicleData, fetchRecentActivity]);

  useEffect(() => {
    if (driverId) {
      fetchAllData();
    }
  }, [driverId, fetchAllData]);

  // Functions to handle driver actions and update Supabase
  const acknowledgeAlert = useCallback(
    async (alertId: string) => {
      try {
        // Handle both UUID strings and integer IDs
        const driverIdValue = isNaN(parseInt(driverId)) ? driverId : parseInt(driverId);
        
        const { error } = await supabase
          .from('predictive_alerts')
          .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
          .eq('id', parseInt(alertId))
          .eq('driver_id', driverIdValue);

        if (error) {
          console.error('Supabase error acknowledging alert:', error);
          throw error;
        }

        // Refresh alerts data
        const updatedAlerts = await fetchAlertsData();
        setAlertsData(updatedAlerts);
      } catch (error) {
        console.error('Error acknowledging alert:', error);
        setError('Failed to acknowledge alert');
      }
    },
    [driverId, supabase, fetchAlertsData]
  );

  const updateDriverStatus = useCallback(
    async (status: string, location?: string) => {
      try {
        // Handle both UUID strings and integer IDs
        const driverIdValue = isNaN(parseInt(driverId)) ? driverId : parseInt(driverId);
        
        // Insert activity log
        const { error } = await supabase.from('driver_activities').insert({
          driver_id: driverIdValue,
          activity_type: 'status_update',
          description: `Status updated to ${status}`,
          location: location,
          timestamp: new Date().toISOString(),
        });

        if (error) {
          console.error('Supabase error updating driver status:', error);
          throw error;
        }

        // Refresh activity data
        const updatedActivity = await fetchRecentActivity();
        setRecentActivity(updatedActivity);
      } catch (error) {
        console.error('Error updating driver status:', error);
        setError('Failed to update status');
      }
    },
    [driverId, supabase, fetchRecentActivity]
  );

  const reportIncident = useCallback(
    async (incident: { type: string; description: string; location?: string }) => {
      try {
        // Handle both UUID strings and integer IDs
        const driverIdValue = isNaN(parseInt(driverId)) ? driverId : parseInt(driverId);
        
        // Insert incident report
        const { error } = await supabase.from('incident_reports').insert({
          driver_id: driverIdValue,
          incident_type: incident.type,
          description: incident.description,
          location: incident.location,
          reported_at: new Date().toISOString(),
          status: 'reported',
        });

        if (error) {
          console.error('Supabase error reporting incident:', error);
          throw error;
        }

        // Also log as activity
        await updateDriverStatus('incident_reported', incident.location);
      } catch (error) {
        console.error('Error reporting incident:', error);
        setError('Failed to report incident');
      }
    },
    [driverId, supabase, updateDriverStatus]
  );

  const logBreak = useCallback(
    async (breakType: string, duration?: number) => {
      try {
        // Handle both UUID strings and integer IDs
        const driverIdValue = isNaN(parseInt(driverId)) ? driverId : parseInt(driverId);
        
        // Insert break log
        const { error } = await supabase.from('driver_activities').insert({
          driver_id: driverIdValue,
          activity_type: 'break',
          description: `${breakType} break started`,
          timestamp: new Date().toISOString(),
          metadata: { break_type: breakType, duration: duration },
        });

        if (error) {
          console.error('Supabase error logging break:', error);
          throw error;
        }

        // Refresh activity data
        const updatedActivity = await fetchRecentActivity();
        setRecentActivity(updatedActivity);
      } catch (error) {
        console.error('Error logging break:', error);
        setError('Failed to log break');
      }
    },
    [driverId, supabase, fetchRecentActivity]
  );

  return {
    cargoData,
    telematicsData,
    alertsData,
    hosData,
    loadData,
    vehicleData,
    recentActivity,
    isLoading,
    error,
    refetch: fetchAllData,
    // Action functions
    acknowledgeAlert,
    updateDriverStatus,
    reportIncident,
    logBreak,
  };
}
