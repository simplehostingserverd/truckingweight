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

import React from 'react';
import {
  ClockIcon,
  TruckIcon,
  ScaleIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface ActivityItem {
  id: string;
  type:
    | 'weigh'
    | 'location'
    | 'status'
    | 'fuel'
    | 'maintenance'
    | 'communication'
    | 'alert'
    | 'break';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  location?: string;
  weight?: number;
}

interface ActivityFeedProps {
  recentItems: ActivityItem[];
  maxItems?: number;
}

export default function ActivityFeed({ recentItems, maxItems = 10 }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'weigh':
        return <ScaleIcon className="w-5 h-5" />;
      case 'location':
        return <MapPinIcon className="w-5 h-5" />;
      case 'status':
        return <ClockIcon className="w-5 h-5" />;
      case 'fuel':
        return <FunnelIcon className="w-5 h-5" />;
      case 'maintenance':
        return <TruckIcon className="w-5 h-5" />;
      case 'communication':
        return <ChatBubbleLeftIcon className="w-5 h-5" />;
      case 'alert':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'break':
        return <CheckCircleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string, status?: string) => {
    if (status) {
      switch (status) {
        case 'success':
          return 'text-green-400';
        case 'warning':
          return 'text-yellow-400';
        case 'error':
          return 'text-red-400';
        case 'info':
          return 'text-blue-400';
      }
    }

    switch (type) {
      case 'weigh':
        return 'text-blue-400';
      case 'location':
        return 'text-green-400';
      case 'status':
        return 'text-purple-400';
      case 'fuel':
        return 'text-orange-400';
      case 'maintenance':
        return 'text-yellow-400';
      case 'communication':
        return 'text-indigo-400';
      case 'alert':
        return 'text-red-400';
      case 'break':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getBorderColor = (type: string, status?: string) => {
    if (status) {
      switch (status) {
        case 'success':
          return 'border-l-green-400';
        case 'warning':
          return 'border-l-yellow-400';
        case 'error':
          return 'border-l-red-400';
        case 'info':
          return 'border-l-blue-400';
      }
    }

    switch (type) {
      case 'weigh':
        return 'border-l-blue-400';
      case 'location':
        return 'border-l-green-400';
      case 'status':
        return 'border-l-purple-400';
      case 'fuel':
        return 'border-l-orange-400';
      case 'maintenance':
        return 'border-l-yellow-400';
      case 'communication':
        return 'border-l-indigo-400';
      case 'alert':
        return 'border-l-red-400';
      case 'break':
        return 'border-l-green-400';
      default:
        return 'border-l-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const displayItems = recentItems.slice(0, maxItems);

  return (
    <div className="activity-feed">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <div className="text-sm text-gray-400">{recentItems.length} total activities</div>
      </div>

      {displayItems.length === 0 ? (
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No recent activity</p>
          <p className="text-sm text-gray-500">Activities will appear here as they occur</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayItems.map((item, index) => (
            <div
              key={item.id}
              className={`bg-gray-800 rounded-lg p-3 border-l-4 ${getBorderColor(item.type, item.status)} hover:bg-gray-750 transition-colors duration-200`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${getActivityColor(item.type, item.status)} mt-0.5`}>
                  {getActivityIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mt-1">{item.description}</p>

                  {/* Additional Info */}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                    {item.location && (
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-3 h-3" />
                        <span>{item.location}</span>
                      </div>
                    )}

                    {item.weight && (
                      <div className="flex items-center space-x-1">
                        <ScaleIcon className="w-3 h-3" />
                        <span>{item.weight.toLocaleString()} lbs</span>
                      </div>
                    )}

                    {item.status && (
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'success'
                            ? 'bg-green-900 text-green-300'
                            : item.status === 'warning'
                              ? 'bg-yellow-900 text-yellow-300'
                              : item.status === 'error'
                                ? 'bg-red-900 text-red-300'
                                : 'bg-blue-900 text-blue-300'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {recentItems.length > maxItems && (
        <div className="text-center mt-4">
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200">
            View All Activities ({recentItems.length})
          </button>
        </div>
      )}

      {/* Auto-refresh Indicator */}
      <div className="flex items-center justify-center mt-4 space-x-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-400">Auto-updating</span>
      </div>
    </div>
  );
}
