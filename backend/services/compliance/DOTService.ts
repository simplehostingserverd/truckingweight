/*
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

import prisma from '../../config/prisma';
import { logger } from '../../utils/logger';

export interface DOTInspectionData {
  vehicleId: number;
  driverId: number;
  inspectionDate: Date;
  inspectionLevel: number;
  violations: any[];
  outOfServiceViolations: any[];
  inspectorName: string;
  inspectorBadge: string;
  location: string;
  companyId: number;
}

export class DOTService {
  /**
   * Record a DOT inspection
   */
  async recordDOTInspection(data: DOTInspectionData) {
    try {
      const inspection = await prisma.dot_inspections.create({
        data: {
          vehicle_id: data.vehicleId,
          driver_id: data.driverId,
          inspection_date: data.inspectionDate,
          inspection_level: data.inspectionLevel,
          violations: JSON.stringify(data.violations),
          out_of_service_violations: JSON.stringify(data.outOfServiceViolations),
          inspector_name: data.inspectorName,
          inspector_badge: data.inspectorBadge,
          location: data.location,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      logger.info(`DOT inspection recorded: ${inspection.id}`);
      return inspection;

    } catch (error) {
      logger.error('Error recording DOT inspection:', error);
      throw new Error('Failed to record DOT inspection');
    }
  }

  /**
   * Get DOT inspection history
   */
  async getDOTInspections(filters: {
    companyId: number;
    vehicleId?: number;
    driverId?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        companyId,
        vehicleId,
        driverId,
        startDate,
        endDate,
        page = 1,
        limit = 10
      } = filters;

      const whereClause: any = {
        vehicles: {
          company_id: companyId
        }
      };

      if (vehicleId) {
        whereClause.vehicle_id = vehicleId;
      }

      if (driverId) {
        whereClause.driver_id = driverId;
      }

      if (startDate || endDate) {
        whereClause.inspection_date = {};
        if (startDate) {
          whereClause.inspection_date.gte = startDate;
        }
        if (endDate) {
          whereClause.inspection_date.lte = endDate;
        }
      }

      const [inspections, totalCount] = await Promise.all([
        prisma.dot_inspections.findMany({
          where: whereClause,
          include: {
            vehicles: {
              select: {
                id: true,
                unit_number: true,
                make: true,
                model: true
              }
            },
            drivers: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                license_number: true
              }
            }
          },
          orderBy: { inspection_date: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.dot_inspections.count({ where: whereClause })
      ]);

      return {
        inspections,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };

    } catch (error) {
      logger.error('Error fetching DOT inspections:', error);
      throw new Error('Failed to fetch DOT inspections');
    }
  }

  /**
   * Calculate safety score based on inspection history
   */
  async calculateSafetyScore(companyId: number, vehicleId?: number, driverId?: number) {
    try {
      const whereClause: any = {
        vehicles: {
          company_id: companyId
        },
        inspection_date: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last 12 months
        }
      };

      if (vehicleId) {
        whereClause.vehicle_id = vehicleId;
      }

      if (driverId) {
        whereClause.driver_id = driverId;
      }

      const inspections = await prisma.dot_inspections.findMany({
        where: whereClause,
        select: {
          violations: true,
          out_of_service_violations: true
        }
      });

      if (inspections.length === 0) {
        return { score: 100, totalInspections: 0, violations: 0, outOfService: 0 };
      }

      let totalViolations = 0;
      let totalOutOfService = 0;

      inspections.forEach(inspection => {
        const violations = JSON.parse(inspection.violations || '[]');
        const oosViolations = JSON.parse(inspection.out_of_service_violations || '[]');
        totalViolations += violations.length;
        totalOutOfService += oosViolations.length;
      });

      // Calculate score (100 - penalty for violations)
      const violationPenalty = totalViolations * 2;
      const oosPenalty = totalOutOfService * 10;
      const score = Math.max(0, 100 - violationPenalty - oosPenalty);

      return {
        score,
        totalInspections: inspections.length,
        violations: totalViolations,
        outOfService: totalOutOfService
      };

    } catch (error) {
      logger.error('Error calculating safety score:', error);
      throw new Error('Failed to calculate safety score');
    }
  }
}

// Export singleton instance
export const dotService = new DOTService();