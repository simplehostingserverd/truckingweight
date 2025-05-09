/**
 * Compliance Utility
 * 
 * This utility handles weight compliance checking against federal and state regulations
 */

import prisma from '../config/prisma';
import { setCompanyContext } from '../config/prisma';
import { logger } from './logger';

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

// Compliance status types
export const COMPLIANCE_STATUS = {
  COMPLIANT: 'Compliant',
  WARNING: 'Warning',
  NON_COMPLIANT: 'Non-Compliant',
};

// Issue severity types
export const ISSUE_SEVERITY = {
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
export const checkWeightCompliance = async (
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
}> {
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
        axle_weights: true,
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

    // Check gross weight compliance
    if (grossWeight > FEDERAL_WEIGHT_LIMITS.GROSS_WEIGHT) {
      issues.push({
        type: 'gross_weight_exceeded',
        description: `Gross weight of ${grossWeight} lbs exceeds federal limit of ${FEDERAL_WEIGHT_LIMITS.GROSS_WEIGHT} lbs`,
        severity: ISSUE_SEVERITY.HIGH,
        recommendation: 'Reduce load to comply with federal gross weight limit',
      });
    } else if (grossWeight > FEDERAL_WEIGHT_LIMITS.GROSS_WEIGHT * 0.95) {
      issues.push({
        type: 'gross_weight_warning',
        description: `Gross weight of ${grossWeight} lbs is approaching federal limit of ${FEDERAL_WEIGHT_LIMITS.GROSS_WEIGHT} lbs`,
        severity: ISSUE_SEVERITY.MEDIUM,
        recommendation: 'Consider reducing load to ensure compliance with federal gross weight limit',
      });
    }

    // Check axle weight compliance if axle weights are available
    if (weight.axle_weights && weight.axle_weights.length > 0) {
      // Check individual axle weights
      weight.axle_weights.forEach((axle, index) => {
        const axleWeight = Number(axle.axle_weight);
        const axleType = axle.axle_type?.toLowerCase() || '';
        
        // Check single axle weight
        if (axleType.includes('single') || axleType.includes('steering')) {
          if (axleWeight > FEDERAL_WEIGHT_LIMITS.SINGLE_AXLE) {
            issues.push({
              type: 'single_axle_weight_exceeded',
              description: `Axle ${axle.axle_number} (${axleType}) weight of ${axleWeight} lbs exceeds federal limit of ${FEDERAL_WEIGHT_LIMITS.SINGLE_AXLE} lbs`,
              severity: ISSUE_SEVERITY.HIGH,
              recommendation: 'Redistribute load to reduce weight on this axle',
            });
          } else if (axleWeight > FEDERAL_WEIGHT_LIMITS.SINGLE_AXLE * 0.95) {
            issues.push({
              type: 'single_axle_weight_warning',
              description: `Axle ${axle.axle_number} (${axleType}) weight of ${axleWeight} lbs is approaching federal limit of ${FEDERAL_WEIGHT_LIMITS.SINGLE_AXLE} lbs`,
              severity: ISSUE_SEVERITY.MEDIUM,
              recommendation: 'Consider redistributing load to reduce weight on this axle',
            });
          }
        }
        
        // Check tandem axle weight (if this is the first axle in a tandem pair)
        if (index < weight.axle_weights.length - 1 && 
            (axleType.includes('tandem') || 
             (weight.axle_weights[index + 1].axle_type?.toLowerCase() || '').includes('tandem'))) {
          const nextAxleWeight = Number(weight.axle_weights[index + 1].axle_weight);
          const tandemWeight = axleWeight + nextAxleWeight;
          
          if (tandemWeight > FEDERAL_WEIGHT_LIMITS.TANDEM_AXLE) {
            issues.push({
              type: 'tandem_axle_weight_exceeded',
              description: `Tandem axles ${axle.axle_number}-${weight.axle_weights[index + 1].axle_number} weight of ${tandemWeight} lbs exceeds federal limit of ${FEDERAL_WEIGHT_LIMITS.TANDEM_AXLE} lbs`,
              severity: ISSUE_SEVERITY.HIGH,
              recommendation: 'Redistribute load to reduce weight on these axles',
            });
          } else if (tandemWeight > FEDERAL_WEIGHT_LIMITS.TANDEM_AXLE * 0.95) {
            issues.push({
              type: 'tandem_axle_weight_warning',
              description: `Tandem axles ${axle.axle_number}-${weight.axle_weights[index + 1].axle_number} weight of ${tandemWeight} lbs is approaching federal limit of ${FEDERAL_WEIGHT_LIMITS.TANDEM_AXLE} lbs`,
              severity: ISSUE_SEVERITY.MEDIUM,
              recommendation: 'Consider redistributing load to reduce weight on these axles',
            });
          }
        }
      });

      // Check bridge formula compliance
      const axleCount = weight.axle_weights.length;
      if (axleCount > 1) {
        // Calculate the distance between first and last axle (assuming standard spacing)
        // This is a simplified calculation - in a real system, you would use actual measurements
        const axleSpacing = 4.5; // feet, average spacing between axles
        const wheelbaseLength = (axleCount - 1) * axleSpacing;
        
        // Calculate bridge formula weight limit
        const bridgeFormulaLimit = FEDERAL_WEIGHT_LIMITS.BRIDGE_FORMULA.W(wheelbaseLength, axleCount);
        
        if (grossWeight > bridgeFormulaLimit) {
          issues.push({
            type: 'bridge_formula_exceeded',
            description: `Gross weight of ${grossWeight} lbs exceeds bridge formula limit of ${Math.round(bridgeFormulaLimit)} lbs for ${axleCount} axles over ${wheelbaseLength.toFixed(1)} feet`,
            severity: ISSUE_SEVERITY.HIGH,
            recommendation: 'Redistribute load or reduce total weight to comply with bridge formula',
          });
        } else if (grossWeight > bridgeFormulaLimit * 0.95) {
          issues.push({
            type: 'bridge_formula_warning',
            description: `Gross weight of ${grossWeight} lbs is approaching bridge formula limit of ${Math.round(bridgeFormulaLimit)} lbs for ${axleCount} axles over ${wheelbaseLength.toFixed(1)} feet`,
            severity: ISSUE_SEVERITY.MEDIUM,
            recommendation: 'Consider redistributing load or reducing total weight to ensure compliance with bridge formula',
          });
        }
      }
    }

    // Determine overall compliance status
    let status = COMPLIANCE_STATUS.COMPLIANT;
    
    if (issues.some(issue => issue.severity === ISSUE_SEVERITY.HIGH || issue.severity === ISSUE_SEVERITY.CRITICAL)) {
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
export const parseWeight = (weightStr: string): number => {
  if (!weightStr) return 0;
  
  // Remove non-numeric characters except decimal point
  const numericStr = weightStr.replace(/[^\d.]/g, '');
  return parseFloat(numericStr) || 0;
};
