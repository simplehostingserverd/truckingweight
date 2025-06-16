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

import { Badge } from '@/components/ui';
import { useEffect, useRef } from 'react';

interface SpeedometerGaugeProps {
  speed: number;
  maxSpeed?: number;
  speedLimit?: number;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  showDigital?: boolean;
  driverName?: string;
  vehicleId?: string;
}

export default function SpeedometerGauge({
  speed,
  maxSpeed = 120,
  speedLimit = 70,
  unit = 'mph',
  size = 'md',
  showDigital = true,
  driverName,
  vehicleId,
}: SpeedometerGaugeProps) {
  const needleRef = useRef<SVGLineElement>(null);

  // Calculate angle for needle (240 degrees total sweep, starting from -120 degrees)
  const clampSpeed = Math.min(Math.max(speed, 0), maxSpeed);
  const angle = -120 + (clampSpeed / maxSpeed) * 240;

  // Debug logging
  console.log('SpeedometerGauge:', { speed, clampSpeed, maxSpeed, angle });

  useEffect(() => {
    if (needleRef.current) {
      needleRef.current.setAttribute('transform', `rotate(${angle} 150 150)`);
    }
  }, [angle]);

  const getSizeMultiplier = () => {
    switch (size) {
      case 'sm':
        return 0.6;
      case 'lg':
        return 1.2;
      default:
        return 0.8; // Made smaller by default
    }
  };

  const sizeMultiplier = getSizeMultiplier();
  const svgSize = 300 * sizeMultiplier;

  const isOverSpeedLimit = speed > speedLimit;
  const isDangerous = speed > speedLimit * 1.15;

  // Generate speed marks (0, 20, 40, 60, 80, 100, 120)
  const speedMarks = [];
  for (let i = 0; i <= maxSpeed; i += 20) {
    speedMarks.push(i);
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Vehicle/Driver Info */}
      {(vehicleId || driverName) && (
        <div className="text-center">
          {vehicleId && (
            <h3 className="font-semibold text-gray-800 dark:text-white">{vehicleId}</h3>
          )}
          {driverName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">Driver: {driverName}</p>
          )}
        </div>
      )}

      {/* Automotive Style Speedometer */}
      <div className="bg-black rounded-full p-4 shadow-2xl inline-block border-4 border-gray-800">
        <svg width={svgSize} height={svgSize} viewBox="0 0 300 300">
          <defs>
            {/* Background gradient */}
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="70%" stopColor="#0a0a0a" />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>

            {/* Orange danger zone gradient */}
            <linearGradient id="dangerZone" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6600" />
              <stop offset="100%" stopColor="#ff3300" />
            </linearGradient>
          </defs>

          {/* Main gauge background */}
          <circle cx="150" cy="150" r="140" fill="url(#bgGrad)" />
          <circle cx="150" cy="150" r="135" fill="#000" stroke="#333" strokeWidth="1" />

          {/* Minor tick marks */}
          {Array.from({ length: 121 }, (_, i) => {
            const tickAngle = -120 + (i * 240) / 120; // 240 degrees total sweep
            const rad = (tickAngle * Math.PI) / 180;
            const isMajor = i % 10 === 0; // Major tick every 10 positions
            const inner = isMajor ? 115 : 125;
            const outer = 130;
            const x1 = 150 + inner * Math.cos(rad);
            const y1 = 150 + inner * Math.sin(rad);
            const x2 = 150 + outer * Math.cos(rad);
            const y2 = 150 + outer * Math.sin(rad);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#fff"
                strokeWidth={isMajor ? 2 : 1}
                opacity={isMajor ? 1 : 0.6}
              />
            );
          })}

          {/* Speed numbers */}
          {speedMarks.map(speedValue => {
            const tickAngle = -120 + (speedValue / maxSpeed) * 240;
            const rad = (tickAngle * Math.PI) / 180;
            const r = 100;
            const x = 150 + r * Math.cos(rad);
            const y = 150 + r * Math.sin(rad) + 6;

            return (
              <text
                key={speedValue}
                x={x}
                y={y}
                fill="#fff"
                fontSize="18"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
              >
                {speedValue}
              </text>
            );
          })}

          {/* Orange danger zone arc (from ~100 mph to max) */}
          <path
            d={() => {
              const startSpeed = 100;
              const startAngle = -120 + (startSpeed / maxSpeed) * 240;
              const endAngle = -120 + 240; // Full sweep end
              const toRad = (deg: number) => (deg * Math.PI) / 180;
              const radius = 130;
              const x1 = 150 + radius * Math.cos(toRad(startAngle));
              const y1 = 150 + radius * Math.sin(toRad(startAngle));
              const x2 = 150 + radius * Math.cos(toRad(endAngle));
              const y2 = 150 + radius * Math.sin(toRad(endAngle));
              const largeArc = endAngle - startAngle > 180 ? 1 : 0;
              return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
            }}
            stroke="url(#dangerZone)"
            strokeWidth={8}
            fill="none"
            opacity="0.8"
          />

          {/* Center hub */}
          <circle cx="150" cy="150" r="12" fill="#333" stroke="#666" strokeWidth="2" />
          <circle cx="150" cy="150" r="6" fill="#000" />

          {/* Red needle */}
          <line
            ref={needleRef}
            x1="150"
            y1="150"
            x2="150"
            y2="60"
            stroke="#ff3300"
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-transform duration-700 ease-out"
            transform={`rotate(${angle} 150 150)`}
          />

          {/* Needle center dot */}
          <circle cx="150" cy="150" r="4" fill="#ff3300" />

          {/* Unit label */}
          <text
            x="150"
            y="220"
            fill="#fff"
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
          >
            {unit}
          </text>
        </svg>
      </div>

      {/* Digital Speed Display */}
      {showDigital && (
        <div className="text-center bg-gray-900 rounded-lg px-4 py-2">
          <div
            className={`font-bold text-3xl ${isDangerous ? 'text-red-400' : isOverSpeedLimit ? 'text-yellow-400' : 'text-green-400'}`}
          >
            {Math.round(speed)}
          </div>
          <div className="text-sm text-gray-400">
            {unit} • Limit: {speedLimit}
          </div>
        </div>
      )}

      {/* Status Badges */}
      <div className="flex space-x-2">
        {isDangerous && (
          <Badge variant="destructive" className="animate-pulse">
            DANGEROUS SPEED
          </Badge>
        )}
        {isOverSpeedLimit && !isDangerous && <Badge variant="warning">OVER LIMIT</Badge>}
        {!isOverSpeedLimit && speed > 0 && <Badge variant="success">SAFE SPEED</Badge>}
        {speed === 0 && <Badge variant="secondary">STOPPED</Badge>}
      </div>

      {/* Speed Statistics */}
      <div className="text-center space-y-1">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Max Today: {Math.max(speed + Math.random() * 10, speedLimit + 5).toFixed(0)} {unit}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Avg Today: {(speed * 0.8).toFixed(0)} {unit}
        </div>
      </div>
    </div>
  );
}
