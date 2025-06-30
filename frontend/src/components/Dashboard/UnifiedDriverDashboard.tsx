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

import React, { useState, useEffect } from 'react';
import { useDriverDashboardData } from '@/hooks/useDriverDashboardData';
import CriticalAlertsBar from './driver/CriticalAlertsBar';
import LiveDataRow from './driver/LiveDataRow';
import QuickActionsGrid from './driver/QuickActionsGrid';
import StatusSummary from './driver/StatusSummary';
import ActivityFeed from './driver/ActivityFeed';
import EmergencyButton from './driver/EmergencyButton';
import VoiceInput from './driver/VoiceInput';
import DriverHeader from './driver/DriverHeader';
import { Driver } from '@/types/driver';

interface UnifiedDriverDashboardProps {
  driverId: string;
  driverData: Driver;
}

export default function UnifiedDriverDashboard({ driverId, driverData }: UnifiedDriverDashboardProps) {
  const {
    cargoData,
    telematicsData,
    alertsData,
    hosData,
    loadData,
    vehicleData,
    recentActivity,
    isLoading,
    error,
    refetch
  } = useDriverDashboardData(driverId);

  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh every 30 seconds for non-critical data
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Real-time updates for critical data (weight, speed, alerts)
  useEffect(() => {
    const criticalInterval = setInterval(() => {
      // Fetch only critical data more frequently
      refetch(['cargo', 'telematics', 'alerts']);
    }, 5000);

    return () => clearInterval(criticalInterval);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="unified-dashboard h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading driver dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="unified-dashboard h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-lg text-red-400">Error loading dashboard: {error}</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="unified-dashboard h-screen overflow-y-auto bg-gray-900 text-white font-medium">
      {/* Header with driver info and status */}
      <DriverHeader 
        driverData={driverData}
        connectionStatus={telematicsData?.isOnline || false}
        lastUpdate={lastUpdate}
        batteryLevel={telematicsData?.batteryLevel}
      />

      {/* Critical Alerts - Always visible at top */}
      <CriticalAlertsBar 
        alerts={alertsData?.filter(alert => alert.priority === 'critical') || []}
      />

      {/* Main Content - Single scrollable view */}
      <div className="main-content p-4 space-y-4 pb-20">
        {/* Priority 1: Live Data - Weight, Speed, Location */}
        <LiveDataRow
          weight={cargoData?.currentWeight}
          weightLimit={cargoData?.weightLimit}
          speed={telematicsData?.currentSpeed}
          speedLimit={telematicsData?.speedLimit}
          location={telematicsData?.location}
          isOverweight={cargoData?.isOverweight}
          isOverSpeed={telematicsData?.isOverSpeed}
        />

        {/* Quick Action Buttons */}
        <QuickActionsGrid
          onReportHazard={() => console.log('Report Hazard')}
          onTakeBreak={() => console.log('Take Break')}
          onUpdateStatus={() => console.log('Update Status')}
          onEmergency={() => console.log('Emergency')}
          onVoiceNote={() => setIsVoiceInputOpen(true)}
          onCallDispatch={() => console.log('Call Dispatch')}
        />

        {/* Priority 2: Status Summary - HOS, Cargo, Vehicle */}
        <StatusSummary
          hosStatus={hosData}
          cargoStatus={{
            currentLoad: loadData?.currentLoad,
            pickupETA: loadData?.pickupETA,
            deliveryETA: loadData?.deliveryETA,
            status: loadData?.status
          }}
          vehicleStatus={{
            fuelLevel: vehicleData?.fuelLevel,
            maintenanceAlerts: vehicleData?.maintenanceAlerts,
            engineStatus: vehicleData?.engineStatus,
            tireStatus: vehicleData?.tireStatus
          }}
        />

        {/* Priority 3: Recent Activity Feed */}
        <ActivityFeed 
          recentItems={recentActivity || []}
          onItemClick={(item) => console.log('Activity item clicked:', item)}
        />
      </div>

      {/* Floating Elements */}
      <EmergencyButton 
        onEmergency={() => {
          // Trigger emergency protocol
          console.log('EMERGENCY ACTIVATED');
          // This would typically:
          // 1. Send immediate alert to dispatch
          // 2. Share current location
          // 3. Start recording audio/video if available
          // 4. Contact emergency services if configured
        }}
      />

      {/* Voice Input Modal */}
      {isVoiceInputOpen && (
        <VoiceInput
          isOpen={isVoiceInputOpen}
          onClose={() => setIsVoiceInputOpen(false)}
          onVoiceCommand={(command) => {
            console.log('Voice command:', command);
            // Process voice command
            setIsVoiceInputOpen(false);
          }}
        />
      )}
    </div>
  );
}