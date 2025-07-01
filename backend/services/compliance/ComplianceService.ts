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

export interface CreateDVIRReportData {
  driverId: number;
  vehicleId: number;
  inspectionDate: Date;
  inspectionType: 'pre_trip' | 'post_trip' | 'en_route';
  odometer: number;
  defectsFound: boolean;
  defectsList?: string;
  satisfactoryCondition: boolean;
  driverSignature: string;
  mechanicSignature?: string;
  notes?: string;
  companyId: number;
  inspectionItems?: any;
  location?: string;
  trailerId?: number;
}

export class ComplianceService {
  /**
   * Create a new DVIR report
   */
  async createDVIRReport(data: CreateDVIRReportData) {
    try {
      const dvirReport = await prisma.dvir_reports.create({
        data: {
          driver_id: data.driverId,
          vehicle_id: data.vehicleId,
          trailer_id: data.trailerId || null,
          inspection_date: data.inspectionDate,
          inspection_type: data.inspectionType,
          odometer_reading: data.odometer,
          location: data.location || '',
          defects_found: data.defectsFound,
          defects_list: data.defectsList || '',
          satisfactory_condition: data.satisfactoryCondition,
          driver_signature: data.driverSignature,
          mechanic_signature: data.mechanicSignature || '',
          notes: data.notes || '',
          inspection_items: data.inspectionItems ? JSON.stringify(data.inspectionItems) : '{}',
          status: data.defectsFound ? 'defects_found' : 'satisfactory',
          created_at: new Date(),
          updated_at: new Date()
        },
        include: {
          drivers: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              license_number: true
            }
          },
          vehicles: {
            select: {
              id: true,
              unit_number: true,
              make: true,
              model: true,
              year: true
            }
          }
        }
      });

      logger.info(`DVIR report created successfully: ${dvirReport.id}`);
      return dvirReport;

    } catch (error) {
      logger.error('Error creating DVIR report:', error);
      throw new Error('Failed to create DVIR report');
    }
  }

  /**
   * Get DVIR reports with filters
   */
  async getDVIRReports(filters: {
    companyId: number;
    driverId?: number;
    vehicleId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        companyId,
        driverId,
        vehicleId,
        startDate,
        endDate,
        status,
        page = 1,
        limit = 10
      } = filters;

      const whereClause: any = {
        drivers: {
          company_id: companyId
        }
      };

      if (driverId) {
        whereClause.driver_id = driverId;
      }

      if (vehicleId) {
        whereClause.vehicle_id = vehicleId;
      }

      if (status) {
        whereClause.status = status;
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

      const [reports, totalCount] = await Promise.all([
        prisma.dvir_reports.findMany({
          where: whereClause,
          include: {
            drivers: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                license_number: true
              }
            },
            vehicles: {
              select: {
                id: true,
                unit_number: true,
                make: true,
                model: true,
                year: true
              }
            }
          },
          orderBy: { inspection_date: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.dvir_reports.count({ where: whereClause })
      ]);

      return {
        reports,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };

    } catch (error) {
      logger.error('Error fetching DVIR reports:', error);
      throw new Error('Failed to fetch DVIR reports');
    }
  }

  /**
   * Update DVIR report status
   */
  async updateDVIRReportStatus(reportId: number, status: string, mechanicSignature?: string) {
    try {
      const updateData: any = {
        status,
        updated_at: new Date()
      };

      if (mechanicSignature) {
        updateData.mechanic_signature = mechanicSignature;
      }

      const updatedReport = await prisma.dvir_reports.update({
        where: { id: reportId },
        data: updateData,
        include: {
          drivers: {
            select: {
              id: true,
              first_name: true,
              last_name: true
            }
          },
          vehicles: {
            select: {
              id: true,
              unit_number: true,
              make: true,
              model: true
            }
          }
        }
      });

      logger.info(`DVIR report ${reportId} status updated to: ${status}`);
      return updatedReport;

    } catch (error) {
      logger.error('Error updating DVIR report status:', error);
      throw new Error('Failed to update DVIR report status');
    }
  }
}

// Export singleton instance
export const complianceService = new ComplianceService();