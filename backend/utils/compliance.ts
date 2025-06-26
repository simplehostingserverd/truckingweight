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
 * Compliance Utility
 *
 * This utility handles weight compliance checking against federal and state regulations
 */

import prisma, { setCompanyContext } from '../config/prisma.js';
import logger from './logger.js';

// Federal weight limits (in pounds)
const FEDERAL_WEIGHT_LIMITS = {
  SINGLE_AXLE: 20000, // 20,000 lbs
  TANDEM_AXLE: 34000, // 34,000 lbs
  GROSS_WEIGHT: 80000, // 80,000 lbs
  BRIDGE_FORMULA: {
    // Bridge formula constants
    W: (L: number, N: number) => 500 * ((L * N) / (N - 1) + 12 * N + 36),
  },
};

// State-specific weight limits for all US states
const STATE_WEIGHT_LIMITS: Record<
  string,
  {
    SINGLE_AXLE: number;
    TANDEM_AXLE: number;
    GROSS_WEIGHT: number;
  }
> = {
  // Alabama
  AL: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Alaska
  AK: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 38000,
    GROSS_WEIGHT: 80000,
  },
  // Arizona
  AZ: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Arkansas
  AR: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // California
  CA: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Colorado
  CO: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 36000,
    GROSS_WEIGHT: 85000,
  },
  // Connecticut
  CT: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 36000,
    GROSS_WEIGHT: 80000,
  },
  // Delaware
  DE: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Florida
  FL: {
    SINGLE_AXLE: 22000,
    TANDEM_AXLE: 44000,
    GROSS_WEIGHT: 80000,
  },
  // Georgia
  GA: {
    SINGLE_AXLE: 20340,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Hawaii
  HI: {
    SINGLE_AXLE: 22500,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Idaho
  ID: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 105500,
  },
  // Illinois
  IL: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Indiana
  IN: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Iowa
  IA: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Kansas
  KS: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 85500,
  },
  // Kentucky
  KY: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Louisiana
  LA: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Maine
  ME: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 38000,
    GROSS_WEIGHT: 100000,
  },
  // Maryland
  MD: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Massachusetts
  MA: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 36000,
    GROSS_WEIGHT: 80000,
  },
  // Michigan
  MI: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 164000,
  },
  // Minnesota
  MN: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Mississippi
  MS: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Missouri
  MO: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Montana
  MT: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 131060,
  },
  // Nebraska
  NE: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 95000,
  },
  // Nevada
  NV: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // New Hampshire
  NH: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 36000,
    GROSS_WEIGHT: 80000,
  },
  // New Jersey
  NJ: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // New Mexico
  NM: {
    SINGLE_AXLE: 21600,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 86400,
  },
  // New York
  NY: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 36000,
    GROSS_WEIGHT: 80000,
  },
  // North Carolina
  NC: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 38000,
    GROSS_WEIGHT: 80000,
  },
  // North Dakota
  ND: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 105500,
  },
  // Ohio
  OH: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Oklahoma
  OK: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 90000,
  },
  // Oregon
  OR: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 105500,
  },
  // Pennsylvania
  PA: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Rhode Island
  RI: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 36000,
    GROSS_WEIGHT: 80000,
  },
  // South Carolina
  SC: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 35200,
    GROSS_WEIGHT: 80000,
  },
  // South Dakota
  SD: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Tennessee
  TN: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Texas
  TX: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Utah
  UT: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Vermont
  VT: {
    SINGLE_AXLE: 22400,
    TANDEM_AXLE: 36000,
    GROSS_WEIGHT: 80000,
  },
  // Virginia
  VA: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Washington
  WA: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 105500,
  },
  // West Virginia
  WV: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Wisconsin
  WI: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 34000,
    GROSS_WEIGHT: 80000,
  },
  // Wyoming
  WY: {
    SINGLE_AXLE: 20000,
    TANDEM_AXLE: 36000,
    GROSS_WEIGHT: 117000,
  },
  // District of Columbia
  DC: {
    SINGLE_AXLE: 22000,
    TANDEM_AXLE: 38000,
    GROSS_WEIGHT: 80000,
  },
};

// Compliance status types
const COMPLIANCE_STATUS = {
  COMPLIANT: 'Compliant',
  WARNING: 'Warning',
  NON_COMPLIANT: 'Non-Compliant',
};

// Issue severity types
const ISSUE_SEVERITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

/**
 * Check weight compliance for a weight record
 * @param weightId - The ID of the weight record
 * @param companyId - The company ID for context
 */
const checkWeightCompliance = async (
  weightId: number,
  companyId: number
): Promise<{
  status: string;
  issues?: Array<{
    type: string;
    description: string;
    severity: string;
    recommendation?: string;
  }>;
}> => {
  try {
    // Set company context for Prisma queries
    setCompanyContext(companyId);

    // Get the weight record with related data
    const weight = await prisma.weights.findUnique({
      where: { id: weightId },
      include: {
        vehicles: {
          include: {
            axle_configurations: true,
          },
        },
      },
    });

    if (!weight) {
      throw new Error('Weight record not found');
    }

    const issues: Array<{
      type: string;
      description: string;
      severity: string;
      recommendation?: string;
    }> = [];

    // Parse the weight value
    const grossWeight = parseWeight(weight.weight);

    // Get state code from vehicle registration if available
    // Note: registration_state field doesn't exist in vehicles model
    const stateCode = '';

    // Determine applicable weight limits (state or federal)
    const applicableGrossLimit =
      stateCode && STATE_WEIGHT_LIMITS[stateCode]
        ? STATE_WEIGHT_LIMITS[stateCode].GROSS_WEIGHT
        : FEDERAL_WEIGHT_LIMITS.GROSS_WEIGHT;

    const applicableSingleAxleLimit =
      stateCode && STATE_WEIGHT_LIMITS[stateCode]
        ? STATE_WEIGHT_LIMITS[stateCode].SINGLE_AXLE
        : FEDERAL_WEIGHT_LIMITS.SINGLE_AXLE;

    const applicableTandemAxleLimit =
      stateCode && STATE_WEIGHT_LIMITS[stateCode]
        ? STATE_WEIGHT_LIMITS[stateCode].TANDEM_AXLE
        : FEDERAL_WEIGHT_LIMITS.TANDEM_AXLE;

    // Check gross weight compliance
    if (grossWeight > applicableGrossLimit) {
      issues.push({
        type: 'gross_weight_exceeded',
        description: `Gross weight of ${grossWeight} lbs exceeds ${stateCode ? `${stateCode} state` : 'federal'} limit of ${applicableGrossLimit} lbs`,
        severity: ISSUE_SEVERITY.HIGH,
        recommendation: `Reduce load to comply with ${stateCode ? `${stateCode} state` : 'federal'} gross weight limit`,
      });
    } else if (grossWeight > applicableGrossLimit * 0.95) {
      issues.push({
        type: 'gross_weight_warning',
        description: `Gross weight of ${grossWeight} lbs is approaching ${stateCode ? `${stateCode} state` : 'federal'} limit of ${applicableGrossLimit} lbs`,
        severity: ISSUE_SEVERITY.MEDIUM,
        recommendation: `Consider reducing load to ensure compliance with ${stateCode ? `${stateCode} state` : 'federal'} gross weight limit`,
      });
    }

    // Note: axle_weights relation doesn't exist in weights model
    // Axle weight compliance checking would need to be implemented using weigh_tickets -> axle_weights relation
    // For now, we only check gross weight compliance

        // Calculate bridge formula weight limit
        const bridgeFormulaLimit = FEDERAL_WEIGHT_LIMITS.BRIDGE_FORMULA.W(
          wheelbaseLength,
          axleCount
        );

        if (grossWeight > bridgeFormulaLimit) {
          issues.push({
            type: 'bridge_formula_exceeded',
            description: `Gross weight of ${grossWeight} lbs exceeds bridge formula limit of ${Math.round(bridgeFormulaLimit)} lbs for ${axleCount} axles over ${wheelbaseLength.toFixed(1)} feet`,
            severity: ISSUE_SEVERITY.HIGH,
            recommendation:
              'Redistribute load or reduce total weight to comply with bridge formula',
          });
        } else if (grossWeight > bridgeFormulaLimit * 0.95) {
          issues.push({
            type: 'bridge_formula_warning',
            description: `Gross weight of ${grossWeight} lbs is approaching bridge formula limit of ${Math.round(bridgeFormulaLimit)} lbs for ${axleCount} axles over ${wheelbaseLength.toFixed(1)} feet`,
            severity: ISSUE_SEVERITY.MEDIUM,
            recommendation:
              'Consider redistributing load or reducing total weight to ensure compliance with bridge formula',
          });
        }
      }
    }

    // Determine overall compliance status
    let status = COMPLIANCE_STATUS.COMPLIANT;

    if (
      issues.some(
        issue =>
          issue.severity === ISSUE_SEVERITY.HIGH || issue.severity === ISSUE_SEVERITY.CRITICAL
      )
    ) {
      status = COMPLIANCE_STATUS.NON_COMPLIANT;
    } else if (issues.some(issue => issue.severity === ISSUE_SEVERITY.MEDIUM)) {
      status = COMPLIANCE_STATUS.WARNING;
    }

    return { status, issues };
  } catch (error: any) {
    logger.error(`Error checking weight compliance: ${error.message}`, { error });
    return { status: COMPLIANCE_STATUS.WARNING, issues: [] };
  }
};

/**
 * Parse weight string to number
 * @param weightStr - Weight string (e.g., "32,500 lbs")
 */
const parseWeight = (weightStr: string): number => {
  if (!weightStr) return 0;

  // Remove non-numeric characters except decimal point
  const numericStr = weightStr.replace(/[^\d.]/g, '');
  return parseFloat(numericStr) || 0;
};

export {
  checkWeightCompliance,
  COMPLIANCE_STATUS,
  FEDERAL_WEIGHT_LIMITS,
  ISSUE_SEVERITY,
  parseWeight,
  STATE_WEIGHT_LIMITS,
};
