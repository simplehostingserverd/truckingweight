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

import { useCallback, useEffect, useState } from 'react';
import { 
  analyticsService, 
  DriverMetrics, 
  FleetMetrics, 
  AnalyticsReport,
  AnalyticsFilter
} from '@/services/analyticsService';

export interface UseAnalyticsOptions {
  driverId?: string;
  autoLoad?: boolean;
  defaultPeriod?: {
    startDate: string;
    endDate: string;
  };
}

export interface AnalyticsData {
  driverMetrics: DriverMetrics | null;
  fleetMetrics: FleetMetrics | null;
  reports: AnalyticsReport[];
  isLoading: boolean;
  error: string | null;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { driverId, autoLoad = true, defaultPeriod } = options;

  const [data, setData] = useState<AnalyticsData>({
    driverMetrics: null,
    fleetMetrics: null,
    reports: [],
    isLoading: false,
    error: null,
  });

  // Get default period (last 30 days)
  const getDefaultPeriod = useCallback(() => {
    if (defaultPeriod) return defaultPeriod;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, [defaultPeriod]);

  // Load driver metrics
  const loadDriverMetrics = useCallback(async (
    targetDriverId?: string,
    period?: { startDate: string; endDate: string }
  ) => {
    const id = targetDriverId || driverId;
    if (!id) return null;

    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const metrics = await analyticsService.getDriverMetrics(id, period || getDefaultPeriod());
      setData(prev => ({
        ...prev,
        driverMetrics: metrics,
        isLoading: false,
      }));
      return metrics;
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load driver metrics',
      }));
      return null;
    }
  }, [driverId, getDefaultPeriod]);

  // Load fleet metrics
  const loadFleetMetrics = useCallback(async (
    period?: { startDate: string; endDate: string }
  ) => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const metrics = await analyticsService.getFleetMetrics(period || getDefaultPeriod());
      setData(prev => ({
        ...prev,
        fleetMetrics: metrics,
        isLoading: false,
      }));
      return metrics;
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load fleet metrics',
      }));
      return null;
    }
  }, [getDefaultPeriod]);

  // Load all reports
  const loadReports = useCallback(() => {
    try {
      const reports = analyticsService.getAllReports();
      setData(prev => ({
        ...prev,
        reports,
      }));
      return reports;
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load reports',
      }));
      return [];
    }
  }, []);

  // Generate report
  const generateReport = useCallback(async (
    type: 'driver' | 'fleet',
    targetId?: string,
    filter?: AnalyticsFilter
  ) => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const reportFilter = filter || {
        dateRange: getDefaultPeriod(),
      };

      const report = await analyticsService.generateReport(type, reportFilter, targetId);
      
      setData(prev => ({
        ...prev,
        reports: [report, ...prev.reports],
        isLoading: false,
      }));

      return report;
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
      }));
      return null;
    }
  }, [getDefaultPeriod]);

  // Load all data
  const loadAllData = useCallback(async (period?: { startDate: string; endDate: string }) => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const promises = [
        loadFleetMetrics(period),
        loadReports(),
      ];

      if (driverId) {
        promises.push(loadDriverMetrics(driverId, period));
      }

      await Promise.all(promises);
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load analytics data',
      }));
    }
  }, [driverId, loadDriverMetrics, loadFleetMetrics, loadReports]);

  // Auto-load data on mount
  useEffect(() => {
    if (autoLoad) {
      loadAllData();
    }
  }, [autoLoad, loadAllData]);

  return {
    ...data,
    loadDriverMetrics,
    loadFleetMetrics,
    loadReports,
    generateReport,
    loadAllData,
    refresh: () => loadAllData(),
  };
}

// Hook for multiple driver metrics comparison
export function useDriverComparison(driverIds: string[]) {
  const [driversMetrics, setDriversMetrics] = useState<Map<string, DriverMetrics>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDriversMetrics = useCallback(async (
    period?: { startDate: string; endDate: string }
  ) => {
    if (driverIds.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const metrics = await analyticsService.getMultipleDriverMetrics(driverIds, period);
      const metricsMap = new Map<string, DriverMetrics>();
      
      metrics.forEach(metric => {
        metricsMap.set(metric.driverId, metric);
      });

      setDriversMetrics(metricsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load driver metrics');
    } finally {
      setIsLoading(false);
    }
  }, [driverIds]);

  useEffect(() => {
    loadDriversMetrics();
  }, [loadDriversMetrics]);

  return {
    driversMetrics,
    isLoading,
    error,
    loadDriversMetrics,
  };
}

// Hook for analytics insights and recommendations
export function useAnalyticsInsights(report: AnalyticsReport | null) {
  const [insights, setInsights] = useState<AnalyticsReport['insights']>([]);
  const [recommendations, setRecommendations] = useState<AnalyticsReport['recommendations']>([]);

  useEffect(() => {
    if (report) {
      setInsights(report.insights);
      setRecommendations(report.recommendations);
    } else {
      setInsights([]);
      setRecommendations([]);
    }
  }, [report]);

  const getInsightsByType = useCallback((type: 'positive' | 'negative' | 'neutral' | 'warning') => {
    return insights.filter(insight => insight.type === type);
  }, [insights]);

  const getRecommendationsByPriority = useCallback((priority: 'high' | 'medium' | 'low') => {
    return recommendations.filter(rec => rec.priority === priority);
  }, [recommendations]);

  const getRecommendationsByCategory = useCallback((category: 'safety' | 'efficiency' | 'cost' | 'compliance') => {
    return recommendations.filter(rec => rec.category === category);
  }, [recommendations]);

  return {
    insights,
    recommendations,
    getInsightsByType,
    getRecommendationsByPriority,
    getRecommendationsByCategory,
    hasPositiveInsights: insights.some(i => i.type === 'positive'),
    hasWarnings: insights.some(i => i.type === 'warning' || i.type === 'negative'),
    highPriorityRecommendations: recommendations.filter(r => r.priority === 'high'),
  };
}

// Hook for performance tracking over time
export function usePerformanceTracking(driverId?: string) {
  const [performanceHistory, setPerformanceHistory] = useState<{
    date: string;
    safetyScore: number;
    efficiencyScore: number;
    punctualityScore: number;
    overallScore: number;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPerformanceHistory = useCallback(async (
    days = 30
  ) => {
    if (!driverId) return;

    setIsLoading(true);

    try {
      // Mock performance history - in production, this would fetch historical data
      const history = [];
      const now = new Date();
      
      for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Generate mock performance data with some trends
        const baseScore = 75 + Math.random() * 20;
        const trend = Math.sin(i / 10) * 5; // Some cyclical variation
        
        history.push({
          date: date.toISOString().split('T')[0],
          safetyScore: Math.max(0, Math.min(100, baseScore + trend + Math.random() * 10)),
          efficiencyScore: Math.max(0, Math.min(100, baseScore + trend + Math.random() * 10)),
          punctualityScore: Math.max(0, Math.min(100, baseScore + trend + Math.random() * 10)),
          overallScore: Math.max(0, Math.min(100, baseScore + trend + Math.random() * 10)),
        });
      }

      setPerformanceHistory(history);
    } catch (error) {
      console.error('Failed to load performance history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadPerformanceHistory();
  }, [loadPerformanceHistory]);

  return {
    performanceHistory,
    isLoading,
    loadPerformanceHistory,
  };
}
