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

import React from 'react';
import { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import complianceService, {
  VehicleConfig,
  ComplianceResult,
  ViolationType,
  STATE_WEIGHT_LIMITS,
} from '@/services/complianceService';
import { formatWeight } from '@/utils/formatters';

interface ComplianceCheckerProps {
  initialVehicleType?: string;
  initialAxleCount?: number;
  initialGrossWeight?: number;
  onComplianceChange?: (result: ComplianceResult) => void;
}

export default function ComplianceChecker({
  initialVehicleType = '5-Axle Semi',
  initialAxleCount = 5,
  initialGrossWeight = 80000,
  onComplianceChange,
}: ComplianceCheckerProps) {
  const [vehicleType, setVehicleType] = useState(initialVehicleType);
  const [axleCount, setAxleCount] = useState(initialAxleCount);
  const [axleWeights, setAxleWeights] = useState<number[]>(
    Array(initialAxleCount).fill(initialGrossWeight / initialAxleCount)
  );
  const [axleSpacing, setAxleSpacing] = useState<number[]>(Array(initialAxleCount - 1).fill(4.5));
  const [totalLength, setTotalLength] = useState(
    axleSpacing.reduce((sum, spacing) => sum + spacing, 0)
  );
  const [grossWeight, setGrossWeight] = useState(initialGrossWeight);
  const [stateCode, setStateCode] = useState('US');
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Available states
  const states = [
    { code: 'US', name: 'Federal' },
    ...Object.keys(STATE_WEIGHT_LIMITS).map(code => ({
      code,
      name: getStateName(code),
    })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  // Get state name from code
  function getStateName(code: string): string {
    const stateNames: Record<string, string> = {
      CA: 'California',
      TX: 'Texas',
      NY: 'New York',
      FL: 'Florida',
      // Add more states as needed
    };

    return stateNames[code] || code;
  }

  // Update axle count
  const updateAxleCount = (count: number) => {
    if (count < 2) count = 2; // Minimum 2 axles
    if (count > 9) count = 9; // Maximum 9 axles

    setAxleCount(count);

    // Update axle weights (distribute gross weight evenly)
    const newAxleWeights = Array(count).fill(grossWeight / count);
    setAxleWeights(newAxleWeights);

    // Update axle spacing (default 4.5 feet between axles)
    const newAxleSpacing = Array(count - 1).fill(4.5);
    setAxleSpacing(newAxleSpacing);

    // Update total length
    setTotalLength(newAxleSpacing.reduce((sum, spacing) => sum + spacing, 0));
  };

  // Update axle weight
  const updateAxleWeight = (index: number, weight: number) => {
    const newAxleWeights = [...axleWeights];
    newAxleWeights[index] = weight;
    setAxleWeights(newAxleWeights);

    // Update gross weight
    setGrossWeight(newAxleWeights.reduce((sum, weight) => sum + weight, 0));
  };

  // Update axle spacing
  const updateAxleSpacing = (index: number, spacing: number) => {
    const newAxleSpacing = [...axleSpacing];
    newAxleSpacing[index] = spacing;
    setAxleSpacing(newAxleSpacing);

    // Update total length
    setTotalLength(newAxleSpacing.reduce((sum, spacing) => sum + spacing, 0));
  };

  // Update gross weight
  const updateGrossWeight = (weight: number) => {
    setGrossWeight(weight);

    // Distribute weight evenly across axles
    const newAxleWeights = Array(axleCount).fill(weight / axleCount);
    setAxleWeights(newAxleWeights);
  };

  // Check compliance
  const checkCompliance = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const vehicleConfig: VehicleConfig = {
      type: vehicleType,
      axles: {
        axleCount,
        axleSpacing,
        axleWeights,
      },
      totalLength,
      grossWeight,
    };

    let result: ComplianceResult;

    if (stateCode === 'US') {
      result = complianceService.checkFederalCompliance(vehicleConfig);
    } else {
      result = complianceService.checkStateCompliance(vehicleConfig, stateCode);
    }

    setComplianceResult(result);

    if (onComplianceChange) {
      onComplianceChange(result);
    }
  };

  // Check compliance when inputs change
  useEffect(() => {
    checkCompliance();
  }, [axleWeights, axleSpacing, grossWeight, stateCode]);

  // Get color class based on compliance status
  const _getStatusColorClass = (isCompliant: boolean) => {
    return isCompliant ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
      <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Weight Compliance Checker</h2>
        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
      </div>

      <div className="p-6 space-y-6">
        {/* Vehicle Configuration */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Vehicle Configuration</h3>
            <button
              type="button"
              onClick={() => checkCompliance()}
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              aria-label="Recalculate compliance"
              title="Recalculate compliance based on current settings"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="vehicle-type-select"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Vehicle Type
              </label>
              <select
                id="vehicle-type-select"
                value={vehicleType}
                onChange={e => setVehicleType(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select vehicle type for compliance checking"
                title="Choose the vehicle type to check weight compliance"
              >
                <option value="5-Axle Semi">5-Axle Semi</option>
                <option value="3-Axle Straight Truck">3-Axle Straight Truck</option>
                <option value="6-Axle Semi">6-Axle Semi</option>
                <option value="7-Axle Semi">7-Axle Semi</option>
                <option value="8-Axle Semi">8-Axle Semi</option>
                <option value="9-Axle Semi">9-Axle Semi</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="jurisdiction-select"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Jurisdiction
              </label>
              <select
                id="jurisdiction-select"
                value={stateCode}
                onChange={e => setStateCode(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select jurisdiction for compliance checking"
                title="Choose the state or jurisdiction for weight limit regulations"
              >
                {states.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Number of Axles
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => updateAxleCount(axleCount - 1)}
                  disabled={axleCount <= 2}
                  className="p-1.5 rounded-l-md bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Decrease axle count"
                  title="Decrease number of axles"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <label htmlFor="axle-count-input" className="sr-only">
                  Number of axles
                </label>
                <input
                  id="axle-count-input"
                  type="number"
                  value={axleCount}
                  onChange={e => updateAxleCount(parseInt(e.target.value) || 2)}
                  min="2"
                  max="9"
                  className="w-full bg-gray-700 border-y border-gray-600 px-3 py-2 text-white text-center focus:outline-none"
                  aria-label="Number of axles"
                  title="Enter the number of axles (2-9)"
                />
                <button
                  type="button"
                  onClick={() => updateAxleCount(axleCount + 1)}
                  disabled={axleCount >= 9}
                  className="p-1.5 rounded-r-md bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase axle count"
                  title="Increase number of axles"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="gross-weight-input"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Gross Weight (lbs)
              </label>
              <input
                id="gross-weight-input"
                type="number"
                value={grossWeight}
                onChange={e => updateGrossWeight(parseInt(e.target.value) || 0)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Enter gross weight in pounds"
                title="Enter the total gross weight of the vehicle in pounds"
                placeholder="Enter weight in lbs"
              />
            </div>
          </div>
        </div>

        {/* Axle Weights */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Axle Weights</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {axleWeights.map((weight, index) => (
              <div key={`axle-${index}`}>
                <label
                  htmlFor={`axle-weight-${index}`}
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Axle {index + 1} Weight (lbs)
                </label>
                <input
                  id={`axle-weight-${index}`}
                  type="number"
                  value={weight}
                  onChange={e => updateAxleWeight(index, parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Enter weight for axle ${index + 1} in pounds`}
                  title={`Enter the weight for axle ${index + 1} in pounds`}
                  placeholder="Enter weight"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Axle Spacing */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Axle Spacing (feet)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {axleSpacing.map((spacing, index) => (
              <div key={`spacing-${index}`}>
                <label
                  htmlFor={`axle-spacing-${index}`}
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Between Axle {index + 1} and {index + 2}
                </label>
                <input
                  id={`axle-spacing-${index}`}
                  type="number"
                  value={spacing}
                  onChange={e => updateAxleSpacing(index, parseFloat(e.target.value) || 0)}
                  step="0.1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Enter spacing between axle ${index + 1} and ${index + 2} in feet`}
                  title={`Enter the distance between axle ${index + 1} and ${index + 2} in feet`}
                  placeholder="Enter spacing in feet"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Results */}
        {complianceResult && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Compliance Results</h3>
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-400 hover:text-blue-300"
                aria-label={showDetails ? 'Hide compliance details' : 'Show compliance details'}
                title={
                  showDetails
                    ? 'Hide detailed compliance information'
                    : 'Show detailed compliance information'
                }
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center mb-4">
                {complianceResult.isCompliant ? (
                  <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
                ) : (
                  <XCircleIcon className="h-8 w-8 text-red-500 mr-3" />
                )}
                <div>
                  <h4 className="text-lg font-medium text-white">
                    {complianceResult.isCompliant ? 'Compliant' : 'Non-Compliant'}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {complianceResult.isCompliant
                      ? 'This vehicle configuration complies with all weight regulations.'
                      : `This vehicle configuration has ${complianceResult.violations.length} weight violation(s).`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Maximum Allowed Weight</p>
                  <p className="text-lg text-white">
                    {formatWeight(complianceResult.maxAllowedWeight)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Current Gross Weight</p>
                  <p
                    className={`text-lg ${complianceResult.overWeight > 0 ? 'text-red-400' : 'text-white'}`}
                  >
                    {formatWeight(grossWeight)}
                    {complianceResult.overWeight > 0 && (
                      <span className="text-red-400 text-sm ml-2">
                        ({formatWeight(complianceResult.overWeight)} over)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Violations */}
              {!complianceResult.isCompliant && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-white">Violations:</h5>
                  <ul className="space-y-2">
                    {complianceResult.violations.map((violation, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">
                          {violation.type}: {formatWeight(violation.actual)} exceeds limit of{' '}
                          {formatWeight(violation.limit)}
                          {violation.axleIndex !== undefined &&
                            ` (Axle ${violation.axleIndex + 1})`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Information */}
              {showDetails && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-start mb-2">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">
                      Total vehicle length: {totalLength.toFixed(1)} feet
                    </span>
                  </div>

                  <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">
                      Bridge formula calculation: W = 500(LN/(N-1) + 12N + 36)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
