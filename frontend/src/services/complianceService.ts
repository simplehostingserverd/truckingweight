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

/**
 * Compliance Service
 *
 * This service provides functions for checking weight compliance with federal
 * and state regulations for commercial vehicles.
 */

// Weight limits in pounds
export interface WeightLimits {
  singleAxle: number;
  tandemAxle: number;
  tridemAxle: number;
  grossVehicle: number;
  bridgeFormula: boolean;
}

// Axle configuration
export interface AxleConfig {
  axleCount: number;
  axleSpacing: number[]; // Spacing between axles in feet
  axleWeights: number[]; // Weight on each axle in pounds
}

// Vehicle configuration
export interface VehicleConfig {
  type: string;
  axles: AxleConfig;
  totalLength: number; // Total length in feet
  grossWeight: number; // Gross weight in pounds
}

// Compliance result
export interface ComplianceResult {
  isCompliant: boolean;
  violations: Violation[];
  maxAllowedWeight: number;
  overWeight: number;
  details: {
    axleViolations: AxleViolation[];
    grossViolation: boolean;
    bridgeFormulaViolation: boolean;
  };
}

// Violation types
export enum ViolationType {
  SINGLE_AXLE = 'Single Axle',
  TANDEM_AXLE = 'Tandem Axle',
  TRIDEM_AXLE = 'Tridem Axle',
  GROSS_WEIGHT = 'Gross Weight',
  BRIDGE_FORMULA = 'Bridge Formula',
}

// Violation
export interface Violation {
  type: ViolationType;
  actual: number;
  limit: number;
  overWeight: number;
  axleIndex?: number;
}

// Axle violation
export interface AxleViolation {
  axleIndex: number;
  type: ViolationType;
  actual: number;
  limit: number;
  overWeight: number;
}

// Federal weight limits (in pounds)
export const FEDERAL_WEIGHT_LIMITS: WeightLimits = {
  singleAxle: 20000,
  tandemAxle: 34000,
  tridemAxle: 42000,
  grossVehicle: 80000,
  bridgeFormula: true,
};

// State weight limits (in pounds)
// This would be expanded to include all states
export const STATE_WEIGHT_LIMITS: Record<string, WeightLimits> = {
  CA: {
    singleAxle: 20000,
    tandemAxle: 34000,
    tridemAxle: 42000,
    grossVehicle: 80000,
    bridgeFormula: true,
  },
  TX: {
    singleAxle: 20000,
    tandemAxle: 34000,
    tridemAxle: 42000,
    grossVehicle: 80000,
    bridgeFormula: true,
  },
  NY: {
    singleAxle: 22400,
    tandemAxle: 36000,
    tridemAxle: 42000,
    grossVehicle: 80000,
    bridgeFormula: true,
  },
  FL: {
    singleAxle: 22000,
    tandemAxle: 44000,
    tridemAxle: 66000,
    grossVehicle: 80000,
    bridgeFormula: true,
  },
};

/**
 * Calculate the maximum weight allowed by the bridge formula
 * W = 500(LN/(N-1) + 12N + 36)
 *
 * @param length Distance in feet between the outer axles of any group of two or more consecutive axles
 * @param axleCount Number of axles in the group
 * @returns Maximum weight in pounds allowed for the axle group
 */
export const calculateBridgeFormula = (length: number, axleCount: number): number => {
  if (axleCount < 2) return FEDERAL_WEIGHT_LIMITS.singleAxle;

  return 500 * ((length * axleCount) / (axleCount - 1) + 12 * axleCount + 36);
};

/**
 * Check if a vehicle configuration complies with federal weight regulations
 *
 * @param vehicle Vehicle configuration
 * @returns Compliance result
 */
export const checkFederalCompliance = (vehicle: VehicleConfig): ComplianceResult => {
  return checkCompliance(vehicle, FEDERAL_WEIGHT_LIMITS);
};

/**
 * Check if a vehicle configuration complies with state weight regulations
 *
 * @param vehicle Vehicle configuration
 * @param stateCode Two-letter state code
 * @returns Compliance result
 */
export const checkStateCompliance = (
  vehicle: VehicleConfig,
  stateCode: string
): ComplianceResult => {
  const stateLimits = STATE_WEIGHT_LIMITS[stateCode.toUpperCase()];

  if (!stateLimits) {
    // If state not found, use federal limits
    return checkFederalCompliance(vehicle);
  }

  return checkCompliance(vehicle, stateLimits);
};

/**
 * Check if a vehicle configuration complies with weight regulations
 *
 * @param vehicle Vehicle configuration
 * @param limits Weight limits to check against
 * @returns Compliance result
 */
export const checkCompliance = (vehicle: VehicleConfig, limits: WeightLimits): ComplianceResult => {
  const { axles, grossWeight } = vehicle;
  const { axleWeights, axleSpacing } = axles;

  const violations: Violation[] = [];
  const axleViolations: AxleViolation[] = [];

  // Check single axle weights
  axleWeights.forEach((weight, index) => {
    if (weight > limits.singleAxle) {
      const violation: AxleViolation = {
        axleIndex: index,
        type: ViolationType.SINGLE_AXLE,
        actual: weight,
        limit: limits.singleAxle,
        overWeight: weight - limits.singleAxle,
      };

      axleViolations.push(violation);
      violations.push({
        type: ViolationType.SINGLE_AXLE,
        actual: weight,
        limit: limits.singleAxle,
        overWeight: weight - limits.singleAxle,
        axleIndex: index,
      });
    }
  });

  // Check tandem axle weights (two consecutive axles)
  if (axleWeights.length >= 2) {
    for (let i = 0; i < axleWeights.length - 1; i++) {
      // Check if these two axles form a tandem (spacing <= 8 feet)
      if (axleSpacing[i] <= 8) {
        const tandemWeight = axleWeights[i] + axleWeights[i + 1];

        if (tandemWeight > limits.tandemAxle) {
          const violation: AxleViolation = {
            axleIndex: i,
            type: ViolationType.TANDEM_AXLE,
            actual: tandemWeight,
            limit: limits.tandemAxle,
            overWeight: tandemWeight - limits.tandemAxle,
          };

          axleViolations.push(violation);
          violations.push({
            type: ViolationType.TANDEM_AXLE,
            actual: tandemWeight,
            limit: limits.tandemAxle,
            overWeight: tandemWeight - limits.tandemAxle,
            axleIndex: i,
          });
        }
      }
    }
  }

  // Check tridem axle weights (three consecutive axles)
  if (axleWeights.length >= 3) {
    for (let i = 0; i < axleWeights.length - 2; i++) {
      // Check if these three axles form a tridem (total spacing <= 8 feet)
      if (axleSpacing[i] + axleSpacing[i + 1] <= 8) {
        const tridemWeight = axleWeights[i] + axleWeights[i + 1] + axleWeights[i + 2];

        if (tridemWeight > limits.tridemAxle) {
          const violation: AxleViolation = {
            axleIndex: i,
            type: ViolationType.TRIDEM_AXLE,
            actual: tridemWeight,
            limit: limits.tridemAxle,
            overWeight: tridemWeight - limits.tridemAxle,
          };

          axleViolations.push(violation);
          violations.push({
            type: ViolationType.TRIDEM_AXLE,
            actual: tridemWeight,
            limit: limits.tridemAxle,
            overWeight: tridemWeight - limits.tridemAxle,
            axleIndex: i,
          });
        }
      }
    }
  }

  // Check gross vehicle weight
  let grossViolation = false;
  if (grossWeight > limits.grossVehicle) {
    grossViolation = true;
    violations.push({
      type: ViolationType.GROSS_WEIGHT,
      actual: grossWeight,
      limit: limits.grossVehicle,
      overWeight: grossWeight - limits.grossVehicle,
    });
  }

  // Check bridge formula if required
  let bridgeFormulaViolation = false;
  if (limits.bridgeFormula && axleWeights.length >= 2) {
    // Calculate total length between first and last axle
    const totalLength = axleSpacing.reduce((sum, spacing) => sum + spacing, 0);

    // Calculate maximum allowed weight by bridge formula
    const maxBridgeWeight = calculateBridgeFormula(totalLength, axleWeights.length);

    if (grossWeight > maxBridgeWeight) {
      bridgeFormulaViolation = true;
      violations.push({
        type: ViolationType.BRIDGE_FORMULA,
        actual: grossWeight,
        limit: maxBridgeWeight,
        overWeight: grossWeight - maxBridgeWeight,
      });
    }
  }

  // Calculate maximum allowed weight and overweight amount
  const maxAllowedWeight = Math.min(
    limits.grossVehicle,
    limits.bridgeFormula ? calculateBridgeFormula(vehicle.totalLength, axles.axleCount) : Infinity
  );

  const overWeight = grossWeight > maxAllowedWeight ? grossWeight - maxAllowedWeight : 0;

  return {
    isCompliant: violations.length === 0,
    violations,
    maxAllowedWeight,
    overWeight,
    details: {
      axleViolations,
      grossViolation,
      bridgeFormulaViolation,
    },
  };
};

export default {
  checkFederalCompliance,
  checkStateCompliance,
  calculateBridgeFormula,
  FEDERAL_WEIGHT_LIMITS,
  STATE_WEIGHT_LIMITS,
};
