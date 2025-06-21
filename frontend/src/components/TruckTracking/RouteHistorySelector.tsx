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

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface RouteHistorySelectorProps {
  onDateRangeSelect: (startDate: string, endDate: string) => void;
  isLoading?: boolean;
}

export default function RouteHistorySelector({
  onDateRangeSelect,
  isLoading = false,
}: RouteHistorySelectorProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Quick date range presets
  const getQuickRanges = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return [
      {
        label: 'Today',
        start: today.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
      },
      {
        label: 'Yesterday',
        start: yesterday.toISOString().split('T')[0],
        end: yesterday.toISOString().split('T')[0],
      },
      {
        label: 'Last 7 Days',
        start: weekAgo.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
      },
      {
        label: 'Last 30 Days',
        start: monthAgo.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
      },
    ];
  };

  const handleQuickRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    onDateRangeSelect(start, end);
  };

  const handleCustomRange = () => {
    if (startDate && endDate) {
      onDateRangeSelect(startDate, endDate);
    }
  };

  const quickRanges = getQuickRanges();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <span>Select Route History</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Range Buttons */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Ranges
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {quickRanges.map(range => (
              <Button
                key={range.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickRange(range.start, range.end)}
                disabled={isLoading}
                className="justify-start"
              >
                <ClockIcon className="h-4 w-4 mr-2" />
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Range
          </h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="route-history-start-date"
                  className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                >
                  Start Date
                </label>
                <input
                  id="route-history-start-date"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  max={new Date().toISOString().split('T')[0]}
                  aria-label="Select start date for route history"
                  title="Select the start date for viewing route history"
                />
              </div>
              <div>
                <label
                  htmlFor="route-history-end-date"
                  className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                >
                  End Date
                </label>
                <input
                  id="route-history-end-date"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                  aria-label="Select end date for route history"
                  title="Select the end date for viewing route history"
                />
              </div>
            </div>
            <Button
              onClick={handleCustomRange}
              disabled={!startDate || !endDate || isLoading}
              className="w-full"
            >
              {isLoading ? 'Loading...' : 'Load Route History'}
            </Button>
          </div>
        </div>

        {/* Current Selection Display */}
        {startDate && endDate && (
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Selected Range
              </span>
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Select a date range to view historical route data and playback truck movements.</p>
        </div>
      </CardContent>
    </Card>
  );
}
