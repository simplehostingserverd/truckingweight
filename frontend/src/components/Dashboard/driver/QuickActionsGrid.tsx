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

import React, { useState } from 'react';
import { 
  ExclamationTriangleIcon,
  PauseIcon,
  ChatBubbleLeftIcon,
  PhoneIcon,
  MicrophoneIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';

interface QuickActionsGridProps {
  onReportHazard: () => void;
  onTakeBreak: () => void;
  onUpdateStatus: () => void;
  onEmergency: () => void;
  onVoiceNote: () => void;
  onCallDispatch: () => void;
}

export default function QuickActionsGrid({
  onReportHazard,
  onTakeBreak,
  onUpdateStatus,
  onEmergency,
  onVoiceNote,
  onCallDispatch
}: QuickActionsGridProps) {
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const handleButtonPress = (action: string, callback: () => void) => {
    setPressedButton(action);
    
    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Visual feedback
    setTimeout(() => {
      setPressedButton(null);
      callback();
    }, 150);
  };

  const getButtonClass = (action: string, baseClass: string) => {
    const pressed = pressedButton === action;
    return `${baseClass} ${pressed ? 'scale-95 opacity-80' : 'hover:scale-105'} transition-all duration-150`;
  };

  return (
    <div className="quick-actions">
      <h3 className="text-lg font-semibold text-white mb-3 text-center">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        {/* Report Hazard */}
        <button
          onClick={() => handleButtonPress('hazard', onReportHazard)}
          className={getButtonClass(
            'hazard',
            'bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-lg font-medium text-center min-h-[80px] flex flex-col items-center justify-center space-y-2'
          )}
        >
          <ExclamationTriangleIcon className="w-6 h-6" />
          <span className="text-sm">Report Hazard</span>
        </button>

        {/* Take Break */}
        <button
          onClick={() => handleButtonPress('break', onTakeBreak)}
          className={getButtonClass(
            'break',
            'bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium text-center min-h-[80px] flex flex-col items-center justify-center space-y-2'
          )}
        >
          <PauseIcon className="w-6 h-6" />
          <span className="text-sm">Take Break</span>
        </button>

        {/* Update Status */}
        <button
          onClick={() => handleButtonPress('status', onUpdateStatus)}
          className={getButtonClass(
            'status',
            'bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-medium text-center min-h-[80px] flex flex-col items-center justify-center space-y-2'
          )}
        >
          <ClockIcon className="w-6 h-6" />
          <span className="text-sm">Update Status</span>
        </button>

        {/* Emergency */}
        <button
          onClick={() => handleButtonPress('emergency', onEmergency)}
          className={getButtonClass(
            'emergency',
            'bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg font-bold text-center min-h-[80px] flex flex-col items-center justify-center space-y-2 border-2 border-red-400'
          )}
        >
          <ExclamationCircleIcon className="w-6 h-6" />
          <span className="text-sm">EMERGENCY</span>
        </button>

        {/* Voice Note */}
        <button
          onClick={() => handleButtonPress('voice', onVoiceNote)}
          className={getButtonClass(
            'voice',
            'bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-medium text-center min-h-[80px] flex flex-col items-center justify-center space-y-2'
          )}
        >
          <MicrophoneIcon className="w-6 h-6" />
          <span className="text-sm">Voice Note</span>
        </button>

        {/* Call Dispatch */}
        <button
          onClick={() => handleButtonPress('dispatch', onCallDispatch)}
          className={getButtonClass(
            'dispatch',
            'bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-lg font-medium text-center min-h-[80px] flex flex-col items-center justify-center space-y-2'
          )}
        >
          <PhoneIcon className="w-6 h-6" />
          <span className="text-sm">Call Dispatch</span>
        </button>
      </div>

      {/* Action Feedback */}
      {pressedButton && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Processing action...</span>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          💡 Tip: Hold Emergency button for 3 seconds to activate
        </p>
      </div>
    </div>
  );
}