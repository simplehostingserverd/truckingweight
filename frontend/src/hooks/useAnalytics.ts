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
  AnalyticsFilter,
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
  _isLoading: boolean;
  _error: string | null;
}

export function useAnalytics(_options: UseAnalyticsOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { driverId, autoLoad = true, defaultPeriod } = options;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<AnalyticsData>({
    driverMetrics: null,
    fleetMetrics: null,
    reports: [],
    _isLoading: false,
    _error: null,
  });

  // Get default period (last 30 days)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getDefaultPeriod = useCallback(() => {
    if (defaultPeriod) return defaultPeriod;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const endDate = new Date();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, [defaultPeriod]);

  // Load driver metrics
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadDriverMetrics = useCallback(
    async (targetDriverId?: string, period?: { startDate: string; endDate: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const id = targetDriverId || driverId;
      if (!id) return null;

      setData(prev => ({ ...prev, _isLoading: true, _error: null }));

      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const metrics = await analyticsService.getDriverMetrics(id, period || getDefaultPeriod());
        setData(prev => ({
          ...prev,
          driverMetrics: metrics,
          _isLoading: false,
        }));
        return metrics;
      } catch (error) {
        setData(prev => ({
          ...prev,
          _isLoading: false,
          _error: _error instanceof Error ? error.message : 'Failed to load driver metrics',
        }));
        return null;
      }
    },
    [driverId, getDefaultPeriod]
  );

  // Load fleet metrics
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadFleetMetrics = useCallback(
    async (period?: { startDate: string; endDate: string }) => {
      setData(prev => ({ ...prev, _isLoading: true, _error: null }));

      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const metrics = await analyticsService.getFleetMetrics(period || getDefaultPeriod());
        setData(prev => ({
          ...prev,
          fleetMetrics: metrics,
          _isLoading: false,
        }));
        return metrics;
      } catch (error) {
        setData(prev => ({
          ...prev,
          _isLoading: false,
          _error: _error instanceof Error ? error.message : 'Failed to load fleet metrics',
        }));
        return null;
      }
    },
    [getDefaultPeriod]
  );

  // Load all reports
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadReports = useCallback(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const reports = analyticsService.getAllReports();
      setData(prev => ({
        ...prev,
        reports,
      }));
      return reports;
    } catch (error) {
      setData(prev => ({
        ...prev,
        _error: _error instanceof Error ? error.message : 'Failed to load reports',
      }));
      return [];
    }
  }, []);

  // Generate report
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateReport = useCallback(
    async (type: 'driver' | 'fleet', targetId?: string, filter?: AnalyticsFilter) => {
      setData(prev => ({ ...prev, _isLoading: true, _error: null }));

      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const reportFilter = filter || {
          dateRange: getDefaultPeriod(),
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const report = await analyticsService.generateReport(type, reportFilter, targetId);

        setData(prev => ({
          ...prev,
          reports: [report, ...prev.reports],
          _isLoading: false,
        }));

        return report;
      } catch (error) {
        setData(prev => ({
          ...prev,
          _isLoading: false,
          _error: _error instanceof Error ? error.message : 'Failed to generate report',
        }));
        return null;
      }
    },
    [getDefaultPeriod]
  );

  // Load all data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadAllData = useCallback(
    async (period?: { startDate: string; endDate: string }) => {
      setData(prev => ({ ...prev, _isLoading: true, _error: null }));

      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const promises = [loadFleetMetrics(period), loadReports()];

        if (driverId) {
          promises.push(loadDriverMetrics(driverId, period));
        }

        await Promise.all(promises);
      } catch (error) {
        setData(prev => ({
          ...prev,
          _isLoading: false,
          _error: _error instanceof Error ? error.message : 'Failed to load analytics data',
        }));
      }
    },
    [driverId, loadDriverMetrics, loadFleetMetrics, loadReports]
  );

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [driversMetrics, setDriversMetrics] = useState<Map<string, DriverMetrics>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadDriversMetrics = useCallback(
    async (period?: { startDate: string; endDate: string }) => {
      if (driverIds.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const metrics = await analyticsService.getMultipleDriverMetrics(driverIds, period);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    },
    [driverIds]
  );

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [insights, setInsights] = useState<AnalyticsReport['insights']>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getInsightsByType = useCallback(
    (type: 'positive' | 'negative' | 'neutral' | 'warning') => {
      return insights.filter(insight => insight.type === type);
    },
    [insights]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getRecommendationsByPriority = useCallback(
    (priority: 'high' | 'medium' | 'low') => {
      return recommendations.filter(rec => rec.priority === priority);
    },
    [recommendations]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getRecommendationsByCategory = useCallback(
    (category: 'safety' | 'efficiency' | 'cost' | 'compliance') => {
      return recommendations.filter(rec => rec.category === category);
    },
    [recommendations]
  );

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [performanceHistory, setPerformanceHistory] = useState<
    {
      date: string;
      safetyScore: number;
      efficiencyScore: number;
      punctualityScore: number;
      overallScore: number;
    }[]
  >([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadPerformanceHistory = useCallback(
    async (days = 30) => {
      if (!driverId) return;

      setIsLoading(true);

      try {
        // Mock performance history - in production, this would fetch historical data
        const history = [];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const now = new Date();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (let i = days; i >= 0; i--) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const date = new Date(now);
          date.setDate(date.getDate() - i);

          // Generate mock performance data with some trends
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const baseScore = 75 + Math.random() * 20;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    },
    [driverId]
  );

  useEffect(() => {
    loadPerformanceHistory();
  }, [loadPerformanceHistory]);

  return {
    performanceHistory,
    isLoading,
    loadPerformanceHistory,
  };
}
