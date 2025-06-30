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

import React, { useState, useEffect, useRef } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

interface EmergencyButtonProps {
  onEmergencyActivated: (location?: { lat: number; lng: number }) => void;
  disabled?: boolean;
}

export default function EmergencyButton({
  onEmergencyActivated,
  disabled = false,
}: EmergencyButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const HOLD_DURATION = 3000; // 3 seconds
  const PROGRESS_INTERVAL = 50; // Update every 50ms
  const COUNTDOWN_DURATION = 10; // 10 seconds countdown

  useEffect(() => {
    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, []);

  const handleMouseDown = () => {
    if (disabled || isActivated) return;

    setIsPressed(true);
    setHoldProgress(0);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // Start progress animation
    progressTimer.current = setInterval(() => {
      setHoldProgress(prev => {
        const newProgress = prev + (PROGRESS_INTERVAL / HOLD_DURATION) * 100;
        if (newProgress >= 100) {
          activateEmergency();
          return 100;
        }
        return newProgress;
      });
    }, PROGRESS_INTERVAL);

    // Set timeout for emergency activation
    pressTimer.current = setTimeout(() => {
      activateEmergency();
    }, HOLD_DURATION);
  };

  const handleMouseUp = () => {
    if (disabled || isActivated) return;

    setIsPressed(false);
    setHoldProgress(0);

    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const activateEmergency = () => {
    if (isActivated) return;

    setIsActivated(true);
    setIsPressed(false);
    setHoldProgress(100);
    setCountdown(COUNTDOWN_DURATION);

    // Clear timers
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (progressTimer.current) clearInterval(progressTimer.current);

    // Strong haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Start countdown
    countdownTimer.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Emergency activated - get location and call handler
          getCurrentLocation();
          if (countdownTimer.current) clearInterval(countdownTimer.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          onEmergencyActivated({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        error => {
          console.error('Error getting location:', error);
          onEmergencyActivated(); // Call without location
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      onEmergencyActivated(); // Call without location
    }
  };

  const cancelEmergency = () => {
    setIsActivated(false);
    setCountdown(0);
    setHoldProgress(0);

    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
  };

  if (isActivated && countdown > 0) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-red-600 rounded-full p-6 shadow-2xl border-4 border-red-400 animate-pulse">
          <div className="text-center">
            <ExclamationCircleIcon className="w-12 h-12 text-white mx-auto mb-2" />
            <div className="text-white font-bold text-lg">EMERGENCY</div>
            <div className="text-red-100 text-sm">Activating in {countdown}s</div>
            <button
              onClick={cancelEmergency}
              className="mt-3 px-4 py-2 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isActivated && countdown === 0) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-red-700 rounded-full p-6 shadow-2xl border-4 border-red-300">
          <div className="text-center">
            <ExclamationCircleIcon className="w-12 h-12 text-white mx-auto mb-2 animate-spin" />
            <div className="text-white font-bold text-lg">EMERGENCY</div>
            <div className="text-red-100 text-sm">ACTIVATED</div>
            <div className="text-red-100 text-xs mt-1">Help is on the way</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Progress Ring */}
        {isPressed && (
          <div className="absolute inset-0 rounded-full">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(239, 68, 68, 0.3)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - holdProgress / 100)}`}
                className="transition-all duration-75 ease-linear"
              />
            </svg>
          </div>
        )}

        {/* Emergency Button */}
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={disabled}
          className={`
            relative w-20 h-20 rounded-full shadow-2xl transition-all duration-150
            ${
              disabled
                ? 'bg-gray-600 cursor-not-allowed'
                : isPressed
                  ? 'bg-red-700 scale-95 shadow-lg'
                  : 'bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95'
            }
            border-4 border-red-400
            focus:outline-none focus:ring-4 focus:ring-red-300
          `}
        >
          <ExclamationCircleIcon className="w-10 h-10 text-white mx-auto" />

          {/* Pulse Animation */}
          {!disabled && !isPressed && (
            <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20"></div>
          )}
        </button>

        {/* Instructions */}
        {!isPressed && !isActivated && (
          <div className="absolute -top-12 right-0 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200">
            Hold for 3 seconds
          </div>
        )}

        {/* Hold Progress Text */}
        {isPressed && (
          <div className="absolute -top-16 right-0 bg-red-600 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap animate-pulse">
            Hold to activate emergency
          </div>
        )}
      </div>
    </div>
  );
}
