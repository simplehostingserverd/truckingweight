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
 * Dashboard controller using Prisma
 * This controller provides data for the dashboard components
 */

import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { setCompanyContext } from '../config/prisma';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    companyId?: number;
    isAdmin?: boolean;
  };
}

/**
 * @desc    Get dashboard stats
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;

    // For non-admin users, company ID is required
    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Set company context for Prisma queries with admin flag
    setCompanyContext(companyId, isAdmin);

    // Get today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Define where clauses based on user role
    const companyFilter = isAdmin ? {} : { company_id: companyId };

    // Run queries in parallel for better performance
    const [vehicleCount, driverCount, activeLoads, weightsToday, weights] = await Promise.all([
      // Total vehicles count
      prisma.vehicles.count({
        where: companyFilter,
      }),

      // Active drivers count
      prisma.drivers.count({
        where: {
          ...companyFilter,
          status: 'Active',
        },
      }),

      // Active loads count
      prisma.loads.count({
        where: {
          ...companyFilter,
          status: { in: ['Pending', 'In Transit'] },
        },
      }),

      // Weights created today
      prisma.weights.count({
        where: {
          ...companyFilter,
          date: {
            gte: today.toISOString().split('T')[0],
          },
        },
      }),

      // All weights for compliance calculation
      prisma.weights.findMany({
        where: companyFilter,
        select: { status: true },
      }),
    ]);

    // Calculate compliance rate
    const totalWeights = weights.length;
    const compliantWeights = weights.filter(w => w.status === 'Compliant').length;
    const complianceRate =
      totalWeights > 0 ? Math.round((compliantWeights / totalWeights) * 100) : 0;

    // Get non-compliant weights count
    const nonCompliantWeights = weights.filter(w => w.status === 'Non-Compliant').length;

    // Return dashboard stats
    res.json({
      vehicleCount,
      driverCount,
      activeLoads,
      weightsToday,
      complianceRate,
      nonCompliantWeights,
    });
  } catch (err: any /* @ts-ignore */ ) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    // Clear company context
    setCompanyContext(undefined);
  }
};

/**
 * @desc    Get recent weight measurements
 * @route   GET /api/dashboard/recent-weights
 * @access  Private
 */
export const getRecentWeights = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;

    // For non-admin users, company ID is required
    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Set company context for Prisma queries with admin flag
    setCompanyContext(companyId, isAdmin);

    // Define where clause based on user role
    const companyFilter = isAdmin ? {} : { company_id: companyId };

    // Get recent weights with vehicle and driver info
    const recentWeights = await prisma.weights.findMany({
      where: companyFilter,
      orderBy: { created_at: 'desc' },
      take: 10, // Show more for admin
      include: {
        vehicles: {
          select: {
            id: true,
            name: true,
          },
        },
        drivers: {
          select: {
            id: true,
            name: true,
          },
        },
        companies: isAdmin
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : undefined,
      },
    });

    res.json(recentWeights);
  } catch (err: any /* @ts-ignore */ ) {
    console.error('Error fetching recent weights:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    // Clear company context
    setCompanyContext(undefined);
  }
};

/**
 * @desc    Get compliance data for chart
 * @route   GET /api/dashboard/compliance
 * @access  Private
 */
export const getComplianceData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;
    const { dateRange = 'week', companyFilter: specificCompanyId } = req.query;

    // For non-admin users, company ID is required
    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Set company context for Prisma queries with admin flag
    setCompanyContext(companyId, isAdmin);

    // Calculate date range
    const today = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }

    // Define where clause based on user role and query parameters
    const whereClause: {
      date: {
        gte: string;
        lte: string;
      };
      company_id?: number;
    } = {
      date: {
        gte: startDate.toISOString().split('T')[0],
        lte: today.toISOString().split('T')[0],
      },
    };

    // If admin and specific company filter is provided
    if (isAdmin && specificCompanyId) {
      whereClause.company_id = Number(specificCompanyId);
    }
    // If not admin, filter by user's company
    else if (!isAdmin) {
      whereClause.company_id = companyId;
    }

    // Get weights within date range
    const weights = await prisma.weights.findMany({
      where: whereClause,
      select: {
        status: true,
        company_id: isAdmin, // Include company_id for admins to group by company
      },
    });

    // For admin users, we might want to group by company
    if (isAdmin && !specificCompanyId) {
      // Group weights by company and status
      const companyWeights = new Map();

      for (const weight of weights) {
        const companyId = weight.company_id;
        if (!companyWeights.has(companyId)) {
          companyWeights.set(companyId, {
            compliant: 0,
            warning: 0,
            nonCompliant: 0,
          });
        }

        const stats = companyWeights.get(companyId);
        if (weight.status === 'Compliant') stats.compliant++;
        else if (weight.status === 'Warning') stats.warning++;
        else if (weight.status === 'Non-Compliant') stats.nonCompliant++;
      }

      // Get company names
      const companies = await prisma.companies.findMany({
        select: {
          id: true,
          name: true,
        },
      });

      // Format data for chart
      const complianceByCompany = [];
      for (const [companyId, stats] of companyWeights.entries()) {
        const company = companies.find(c => c.id === companyId);
        const companyName = company ? company.name : `Company ${companyId}`;

        complianceByCompany.push({
          companyId,
          companyName,
          data: [
            { name: 'Compliant', value: stats.compliant },
            { name: 'Warning', value: stats.warning },
            { name: 'Non-Compliant', value: stats.nonCompliant },
          ],
        });
      }

      // Also include overall stats
      const totalCompliant = weights.filter(w => w.status === 'Compliant').length;
      const totalWarning = weights.filter(w => w.status === 'Warning').length;
      const totalNonCompliant = weights.filter(w => w.status === 'Non-Compliant').length;

      const overallData = [
        { name: 'Compliant', value: totalCompliant },
        { name: 'Warning', value: totalWarning },
        { name: 'Non-Compliant', value: totalNonCompliant },
      ];

      res.json({
        byCompany: complianceByCompany,
        overall: overallData,
      });
    } else {
      // Regular user or admin with specific company filter
      // Calculate compliance statistics
      const compliantCount = weights.filter(w => w.status === 'Compliant').length;
      const warningCount = weights.filter(w => w.status === 'Warning').length;
      const nonCompliantCount = weights.filter(w => w.status === 'Non-Compliant').length;

      const complianceData = [
        { name: 'Compliant', value: compliantCount },
        { name: 'Warning', value: warningCount },
        { name: 'Non-Compliant', value: nonCompliantCount },
      ];

      res.json(complianceData);
    }
  } catch (err: any /* @ts-ignore */ ) {
    console.error('Error fetching compliance data:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    // Clear company context
    setCompanyContext(undefined);
  }
};

/**
 * @desc    Get vehicle weight distribution data for chart
 * @route   GET /api/dashboard/vehicle-weights
 * @access  Private
 */
export const getVehicleWeightData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;
    const { dateRange = 'week', companyFilter: specificCompanyId } = req.query;

    // For non-admin users, company ID is required
    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Set company context for Prisma queries with admin flag
    setCompanyContext(companyId, isAdmin);

    // Calculate date range
    const today = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }

    // Define where clauses based on user role and query parameters
    const weightsWhereClause: {
      date: {
        gte: string;
        lte: string;
      };
      company_id?: number;
    } = {
      date: {
        gte: startDate.toISOString().split('T')[0],
        lte: today.toISOString().split('T')[0],
      },
    };

    const vehiclesWhereClause: {
      company_id?: number;
    } = {};

    // If admin and specific company filter is provided
    if (isAdmin && specificCompanyId) {
      weightsWhereClause.company_id = Number(specificCompanyId);
      vehiclesWhereClause.company_id = Number(specificCompanyId);
    }
    // If not admin, filter by user's company
    else if (!isAdmin) {
      weightsWhereClause.company_id = companyId;
      vehiclesWhereClause.company_id = companyId;
    }

    // Get weights and vehicles
    const [weights, vehicles, companies] = await Promise.all([
      prisma.weights.findMany({
        where: weightsWhereClause,
        select: {
          weight: true,
          vehicle_id: true,
          company_id: isAdmin, // Include company_id for admins
        },
      }),

      prisma.vehicles.findMany({
        where: vehiclesWhereClause,
        select: {
          id: true,
          name: true,
          company_id: isAdmin, // Include company_id for admins
        },
      }),

      // Get companies if admin
      isAdmin
        ? prisma.companies.findMany({
            select: {
              id: true,
              name: true,
            },
          })
        : null,
    ]);

    // For admin users, we might want to group by company
    if (isAdmin && !specificCompanyId) {
      // Group weights by company and vehicle
      const companyVehicleWeights = new Map();

      weights.forEach(weight => {
        const companyId = weight.company_id;
        if (!companyVehicleWeights.has(companyId)) {
          companyVehicleWeights.set(companyId, new Map());
        }

        const vehicle = vehicles.find(
          v => v.id === weight.vehicle_id && v.company_id === companyId
        );
        if (vehicle) {
          const vehicleMap = companyVehicleWeights.get(companyId);
          const vehicleName = vehicle.name;
          // Parse weight value (assuming it's stored as a string like "32,500 lbs")
          const weightValue = parseFloat(weight.weight.replace(/[^\d.]/g, ''));

          if (vehicleMap.has(vehicleName)) {
            const currentValue = vehicleMap.get(vehicleName) || 0;
            vehicleMap.set(vehicleName, currentValue + weightValue);
          } else {
            vehicleMap.set(vehicleName, weightValue);
          }
        }
      });

      // Format data for chart
      const weightsByCompany = [];
      for (const [companyId, vehicleMap] of companyVehicleWeights.entries()) {
        const company = companies?.find(c => c.id === companyId);
        const companyName = company ? company.name : `Company ${companyId}`;

        const vehicleWeights = Array.from(vehicleMap.entries())
          .map(([name, weight]) => ({
            name,
            weight: Math.round(weight),
          }))
          .sort((a, b) => b.weight - a.weight)
          .slice(0, 5);

        if (vehicleWeights.length > 0) {
          weightsByCompany.push({
            companyId,
            companyName,
            data: vehicleWeights,
          });
        }
      }

      // Also calculate overall top vehicles
      const overallVehicleMap = new Map<string, number>();

      weights.forEach(weight => {
        const vehicle = vehicles.find(v => v.id === weight.vehicle_id);
        if (vehicle) {
          const vehicleName = `${vehicle.name} (${companies?.find(c => c.id === vehicle.company_id)?.name || 'Unknown'})`;
          const weightValue = parseFloat(weight.weight.replace(/[^\d.]/g, ''));

          if (overallVehicleMap.has(vehicleName)) {
            overallVehicleMap.set(
              vehicleName,
              (overallVehicleMap.get(vehicleName) || 0) + weightValue
            );
          } else {
            overallVehicleMap.set(vehicleName, weightValue);
          }
        }
      });

      const overallData = Array.from(overallVehicleMap.entries())
        .map(([name, weight]) => ({
          name,
          weight: Math.round(weight),
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5);

      res.json({
        byCompany: weightsByCompany,
        overall: overallData,
      });
    } else {
      // Regular user or admin with specific company filter
      // Calculate weights by vehicle
      const weightsByVehicleMap = new Map<string, number>();

      weights.forEach(weight => {
        const vehicle = vehicles.find(v => v.id === weight.vehicle_id);
        if (vehicle) {
          const vehicleName = vehicle.name;
          // Parse weight value (assuming it's stored as a string like "32,500 lbs")
          const weightValue = parseFloat(weight.weight.replace(/[^\d.]/g, ''));

          if (weightsByVehicleMap.has(vehicleName)) {
            weightsByVehicleMap.set(
              vehicleName,
              (weightsByVehicleMap.get(vehicleName) || 0) + weightValue
            );
          } else {
            weightsByVehicleMap.set(vehicleName, weightValue);
          }
        }
      });

      // Convert to array and sort by weight
      const weightsByVehicleArray = Array.from(weightsByVehicleMap.entries())
        .map(([name, weight]) => ({
          name,
          weight: Math.round(weight),
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5);

      res.json(weightsByVehicleArray);
    }
  } catch (err: any /* @ts-ignore */ ) {
    console.error('Error fetching vehicle weight data:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    // Clear company context
    setCompanyContext(undefined);
  }
};

/**
 * @desc    Get load status distribution data for chart
 * @route   GET /api/dashboard/load-status
 * @access  Private
 */
export const getLoadStatusData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Set company context for Prisma queries
    setCompanyContext(companyId);

    // Get loads grouped by status
    const loads = await prisma.loads.findMany({
      where: { company_id: companyId },
      select: { status: true },
    });

    // Calculate loads by status
    const loadsByStatusMap = new Map<string, number>();

    loads.forEach(load => {
      const status = load.status || 'Unknown';

      if (loadsByStatusMap.has(status)) {
        loadsByStatusMap.set(status, (loadsByStatusMap.get(status) || 0) + 1);
      } else {
        loadsByStatusMap.set(status, 1);
      }
    });

    // Convert to array format for chart
    const loadsByStatusArray = Array.from(loadsByStatusMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    res.json(loadsByStatusArray);
  } catch (err: any /* @ts-ignore */ ) {
    console.error('Error fetching load status data:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    // Clear company context
    setCompanyContext(undefined);
  }
};
