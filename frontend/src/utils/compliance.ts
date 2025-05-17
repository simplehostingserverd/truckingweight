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
 * Compliance utility functions for weight checking
 */

// Federal weight limits (in pounds)
export const FEDERAL_WEIGHT_LIMITS = {
  SINGLE_AXLE: 20000,
  TANDEM_AXLE: 34000,
  GROSS_VEHICLE_WEIGHT: 80000,
};

// State-specific weight limits for all US states
export const STATE_WEIGHT_LIMITS: Record<string, typeof FEDERAL_WEIGHT_LIMITS> = {
  // Alabama
  AL: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Alaska
  AK: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 38000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Arizona
  AZ: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Arkansas
  AR: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // California
  CA: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Colorado
  CO: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 36000,
    GROSS_VEHICLE_WEIGHT: 85000,
  },
  // Connecticut
  CT: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 36000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Delaware
  DE: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Florida
  FL: {
    SINGLE_AXLE: 22000,
    TANDEM_AXLE: 44000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Georgia
  GA: {
    SINGLE_AXLE: 20340,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Hawaii
  HI: {
    SINGLE_AXLE: 22500,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Idaho
  ID: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 105500,
  },
  // Illinois
  IL: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Indiana
  IN: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Iowa
  IA: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Kansas
  KS: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 85500,
  },
  // Kentucky
  KY: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Louisiana
  LA: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Maine
  ME: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 38000,
    GROSS_VEHICLE_WEIGHT: 100000,
  },
  // Maryland
  MD: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Massachusetts
  MA: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 36000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Michigan
  MI: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 164000,
  },
  // Minnesota
  MN: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Mississippi
  MS: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Missouri
  MO: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Montana
  MT: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 131060,
  },
  // Nebraska
  NE: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 95000,
  },
  // Nevada
  NV: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // New Hampshire
  NH: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 36000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // New Jersey
  NJ: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // New Mexico
  NM: {
    SINGLE_AXLE: 21600,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 86400,
  },
  // New York
  NY: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 36000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // North Carolina
  NC: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 38000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // North Dakota
  ND: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 105500,
  },
  // Ohio
  OH: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Oklahoma
  OK: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 90000,
  },
  // Oregon
  OR: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 105500,
  },
  // Pennsylvania
  PA: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Rhode Island
  RI: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 36000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // South Carolina
  SC: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 35200,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // South Dakota
  SD: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Tennessee
  TN: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Texas
  TX: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Utah
  UT: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Vermont
  VT: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 36000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Virginia
  VA: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Washington
  WA: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 105500,
  },
  // West Virginia
  WV: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Wisconsin
  WI: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
  // Wyoming
  WY: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 36000,
    GROSS_VEHICLE_WEIGHT: 117000,
  },
  // District of Columbia
  DC: {
    SINGLE_AXLE: 22000,
    TANDEM_AXLE: 38000,
    GROSS_VEHICLE_WEIGHT: 80000,
  },
};

// Bridge formula calculation
export function calculateBridgeFormula(
  weightInPounds: number,
  numberOfAxles: number,
  distanceBetweenAxles: number
): boolean {
  // W = 500 * (LN / (N-1) + 12N + 36)
  // Where:
  // W = maximum weight in pounds that can be carried on a group of two or more axles
  // L = distance in feet between the outer axles of any group of two or more consecutive axles
  // N = number of axles in the group under consideration

  if (numberOfAxles <= 1) return true; // Single axle, no bridge formula applies

  const maxWeight =
    500 *
    ((distanceBetweenAxles * (numberOfAxles - 1)) / (numberOfAxles - 1) + 12 * numberOfAxles + 36);

  return weightInPounds <= maxWeight;
}

// Parse weight string to numeric value
export function parseWeight(weightString: string): number {
  // Remove all non-numeric characters except decimal point
  const numericString = weightString.replace(/[^0-9.]/g, '');
  return parseFloat(numericString);
}

// Check if weight is compliant with federal regulations
export function checkFederalCompliance(
  weightInPounds: number,
  axleType: 'SINGLE_AXLE' | 'TANDEM_AXLE' | 'GROSS_VEHICLE_WEIGHT'
): boolean {
  return weightInPounds <= FEDERAL_WEIGHT_LIMITS[axleType];
}

// Check if weight is compliant with state regulations
export function checkStateCompliance(
  weightInPounds: number,
  axleType: 'SINGLE_AXLE' | 'TANDEM_AXLE' | 'GROSS_VEHICLE_WEIGHT',
  stateCode: string
): boolean {
  if (!STATE_WEIGHT_LIMITS[stateCode]) {
    // If state not found, fall back to federal limits
    return checkFederalCompliance(weightInPounds, axleType);
  }

  return weightInPounds <= STATE_WEIGHT_LIMITS[stateCode][axleType];
}

// Determine compliance status based on weight
export function determineComplianceStatus(
  weightString: string,
  axleType: 'SINGLE_AXLE' | 'TANDEM_AXLE' | 'GROSS_VEHICLE_WEIGHT' = 'GROSS_VEHICLE_WEIGHT',
  stateCode: string = ''
): 'Compliant' | 'Warning' | 'Non-Compliant' {
  const weightInPounds = parseWeight(weightString);

  // Check federal compliance
  const isFederalCompliant = checkFederalCompliance(weightInPounds, axleType);

  // Check state compliance if state code provided
  const isStateCompliant = stateCode
    ? checkStateCompliance(weightInPounds, axleType, stateCode)
    : true;

  // If not compliant with either federal or state regulations
  if (!isFederalCompliant || !isStateCompliant) {
    return 'Non-Compliant';
  }

  // Warning threshold (95% of limit)
  const warningThreshold =
    axleType === 'GROSS_VEHICLE_WEIGHT'
      ? FEDERAL_WEIGHT_LIMITS.GROSS_VEHICLE_WEIGHT * 0.95
      : FEDERAL_WEIGHT_LIMITS[axleType] * 0.95;

  // If weight is within 95% of the limit, issue a warning
  if (weightInPounds >= warningThreshold) {
    return 'Warning';
  }

  return 'Compliant';
}

// Get detailed compliance information
export function getComplianceDetails(
  weightString: string,
  axleType: 'SINGLE_AXLE' | 'TANDEM_AXLE' | 'GROSS_VEHICLE_WEIGHT' = 'GROSS_VEHICLE_WEIGHT',
  stateCode: string = ''
): {
  status: 'Compliant' | 'Warning' | 'Non-Compliant';
  weightInPounds: number;
  federalLimit: number;
  stateLimit?: number;
  percentOfLimit: number;
  message: string;
} {
  const weightInPounds = parseWeight(weightString);
  const federalLimit = FEDERAL_WEIGHT_LIMITS[axleType];
  const stateLimit =
    stateCode && STATE_WEIGHT_LIMITS[stateCode]
      ? STATE_WEIGHT_LIMITS[stateCode][axleType]
      : undefined;

  const applicableLimit = stateLimit && stateLimit < federalLimit ? stateLimit : federalLimit;
  const percentOfLimit = (weightInPounds / applicableLimit) * 100;

  const status = determineComplianceStatus(weightString, axleType, stateCode);

  let message = '';
  switch (status) {
    case 'Compliant':
      message = `Weight is compliant with all regulations (${Math.round(percentOfLimit)}% of limit).`;
      break;
    case 'Warning':
      message = `Weight is approaching the maximum limit (${Math.round(percentOfLimit)}% of limit).`;
      break;
    case 'Non-Compliant':
      message = `Weight exceeds the maximum allowed limit (${Math.round(percentOfLimit)}% of limit).`;
      break;
  }

  return {
    status,
    weightInPounds,
    federalLimit,
    stateLimit,
    percentOfLimit,
    message,
  };
}
