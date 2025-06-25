/**
 * Extended Toll Management Controller Functions
 * Additional controller functions for toll management
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TollServiceFactory, TollProviderType } from '../services/toll';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Type definitions for toll queries
interface TollRouteEstimateWhereClause {
  company_id: number;
  load_id?: number;
  vehicle_id?: number;
}

interface TollTransactionWhereClause {
  company_toll_accounts: {
    company_id: number;
  };
  company_toll_account_id?: number;
  vehicle_id?: number;
  driver_id?: number;
  transaction_date?: {
    gte?: Date;
    lte?: Date;
  };
}

/**
 * Update transponder information
 */
export const updateTransponder = async (req: Request, res: Response) => {
  try {
    const { transponderId } = req.params;
    const companyId = req.user?.companyId;
    const { transponder_id, transponder_type, status, last_used_date, notes } = req.body;

    // Verify transponder belongs to company
    const transponder = await prisma.vehicle_toll_transponders.findFirst({
      where: {
        id: parseInt(transponderId),
        vehicles: {
          company_id: companyId,
        },
      },
    });

    if (!transponder) {
      return res.status(404).json({
        success: false,
        message: 'Transponder not found',
      });
    }

    const updatedTransponder = await prisma.vehicle_toll_transponders.update({
      where: { id: parseInt(transponderId) },
      data: {
        transponder_id,
        transponder_type,
        status,
        last_used_date: last_used_date ? new Date(last_used_date) : undefined,
        notes,
        updated_at: new Date(),
      },
      include: {
        company_toll_accounts: {
          include: {
            toll_providers: true,
          },
        },
        vehicles: true,
      },
    });

    res.json({
      success: true,
      transponder: updatedTransponder,
      message: 'Transponder updated successfully',
    });
  } catch (error) {
    logger.error('Error updating transponder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transponder',
      error: error.message,
    });
  }
};

/**
 * Remove transponder from vehicle
 */
export const removeTransponder = async (req: Request, res: Response) => {
  try {
    const { transponderId } = req.params;
    const companyId = req.user?.companyId;

    // Verify transponder belongs to company
    const transponder = await prisma.vehicle_toll_transponders.findFirst({
      where: {
        id: parseInt(transponderId),
        vehicles: {
          company_id: companyId,
        },
      },
    });

    if (!transponder) {
      return res.status(404).json({
        success: false,
        message: 'Transponder not found',
      });
    }

    await prisma.vehicle_toll_transponders.delete({
      where: { id: parseInt(transponderId) },
    });

    res.json({
      success: true,
      message: 'Transponder removed successfully',
    });
  } catch (error) {
    logger.error('Error removing transponder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove transponder',
      error: error.message,
    });
  }
};

// ===== ROUTE CALCULATION CONTROLLERS =====

/**
 * Calculate toll costs for a route
 */
export const calculateRouteTolls = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { origin, destination, vehicleClass, vehicleType, avoidTolls, providerId, routeOptions } =
      req.body;

    let tollProvider;
    if (providerId) {
      tollProvider = await prisma.toll_providers.findUnique({
        where: { id: providerId },
      });
    } else {
      // Use default provider or best provider for route
      tollProvider = await prisma.toll_providers.findFirst({
        where: { is_active: true },
        orderBy: { name: 'asc' },
      });
    }

    if (!tollProvider) {
      return res.status(404).json({
        success: false,
        message: 'No toll provider available',
      });
    }

    // Get company account for this provider
    const tollAccount = await prisma.company_toll_accounts.findFirst({
      where: {
        company_id: companyId,
        toll_provider_id: tollProvider.id,
        account_status: 'active',
      },
    });

    if (!tollAccount || !tollAccount.credentials) {
      return res.status(400).json({
        success: false,
        message: 'No active toll account configured for this provider',
      });
    }

    const providerType = tollProvider.name.toLowerCase().replace(/[^a-z]/g, '') as TollProviderType;
    const config = {
      ...tollAccount.credentials,
      baseUrl: tollProvider.api_endpoint,
    };

    const service = TollServiceFactory.createService(providerType, config);

    const routeRequest = {
      origin,
      destination,
      vehicleClass,
      vehicleType,
      avoidTolls,
      routeOptions,
    };

    const tollCalculation = await service.calculateTolls(routeRequest);

    // Save route calculation to database
    const savedRoute = await prisma.toll_routes.create({
      data: {
        origin_address: origin.address || `${origin.latitude},${origin.longitude}`,
        destination_address:
          destination.address || `${destination.latitude},${destination.longitude}`,
        origin_coordinates:
          origin.latitude && origin.longitude ? `${origin.latitude},${origin.longitude}` : null,
        destination_coordinates:
          destination.latitude && destination.longitude
            ? `${destination.latitude},${destination.longitude}`
            : null,
        distance_miles: tollCalculation.route.distance,
        estimated_duration_minutes: Math.round(tollCalculation.route.duration),
        toll_provider_id: tollProvider.id,
        route_data: tollCalculation as any,
        toll_points: tollCalculation.tollPoints as any,
        total_toll_cost: tollCalculation.totalCost,
        vehicle_class: vehicleClass,
      },
    });

    res.json({
      success: true,
      calculation: tollCalculation,
      routeId: savedRoute.id,
      provider: tollProvider.name,
    });
  } catch (error) {
    logger.error('Error calculating route tolls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate route tolls',
      error: error.message,
    });
  }
};

/**
 * Save route toll estimate
 */
export const saveRouteEstimate = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const {
      route_name,
      origin_address,
      destination_address,
      estimated_toll_cost,
      estimated_distance_miles,
      estimated_duration_minutes,
      vehicle_class,
      toll_breakdown,
      route_alternatives,
      toll_provider_id,
      load_id,
      vehicle_id,
    } = req.body;

    const estimate = await prisma.toll_route_estimates.create({
      data: {
        company_id: companyId,
        route_name,
        origin_address,
        destination_address,
        estimated_toll_cost,
        estimated_distance_miles,
        estimated_duration_minutes,
        vehicle_class,
        toll_breakdown,
        route_alternatives,
        toll_provider_id,
        load_id,
        vehicle_id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
      include: {
        toll_providers: true,
        loads: true,
        vehicles: true,
      },
    });

    res.status(201).json({
      success: true,
      estimate,
      message: 'Route estimate saved successfully',
    });
  } catch (error) {
    logger.error('Error saving route estimate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save route estimate',
      error: error.message,
    });
  }
};

/**
 * Get saved route estimates
 */
export const getRouteEstimates = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { load_id, vehicle_id, limit = '50', offset = '0' } = req.query;

    const where: TollRouteEstimateWhereClause = { company_id: companyId };
    if (load_id) where.load_id = parseInt(load_id as string);
    if (vehicle_id) where.vehicle_id = parseInt(vehicle_id as string);

    const estimates = await prisma.toll_route_estimates.findMany({
      where,
      include: {
        toll_providers: true,
        loads: true,
        vehicles: true,
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { created_at: 'desc' },
    });

    const total = await prisma.toll_route_estimates.count({ where });

    res.json({
      success: true,
      estimates,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    logger.error('Error fetching route estimates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch route estimates',
      error: error.message,
    });
  }
};

// ===== TRANSACTION CONTROLLERS =====

/**
 * Get toll transactions
 */
export const getTollTransactions = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const {
      account_id,
      vehicle_id,
      driver_id,
      start_date,
      end_date,
      limit = '50',
      offset = '0',
    } = req.query;

    const where: TollTransactionWhereClause = {
      company_toll_accounts: {
        company_id: companyId,
      },
    };

    if (account_id) where.company_toll_account_id = parseInt(account_id as string);
    if (vehicle_id) where.vehicle_id = parseInt(vehicle_id as string);
    if (driver_id) where.driver_id = parseInt(driver_id as string);
    if (start_date || end_date) {
      where.transaction_date = {};
      if (start_date) where.transaction_date.gte = new Date(start_date as string);
      if (end_date) where.transaction_date.lte = new Date(end_date as string);
    }

    const transactions = await prisma.toll_transactions.findMany({
      where,
      include: {
        company_toll_accounts: {
          include: {
            toll_providers: true,
          },
        },
        vehicles: true,
        drivers: true,
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { transaction_date: 'desc' },
    });

    const total = await prisma.toll_transactions.count({ where });

    res.json({
      success: true,
      transactions,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    logger.error('Error fetching toll transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch toll transactions',
      error: error.message,
    });
  }
};

/**
 * Get specific toll transaction
 */
export const getTollTransaction = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const companyId = req.user?.companyId;

    const transaction = await prisma.toll_transactions.findFirst({
      where: {
        id: parseInt(transactionId),
        company_toll_accounts: {
          company_id: companyId,
        },
      },
      include: {
        company_toll_accounts: {
          include: {
            toll_providers: true,
          },
        },
        vehicles: true,
        drivers: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    logger.error('Error fetching toll transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch toll transaction',
      error: error.message,
    });
  }
};

/**
 * Sync transactions from toll providers
 */
export const syncTransactions = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { account_id, start_date, end_date } = req.body;

    let accounts;
    if (account_id) {
      accounts = await prisma.company_toll_accounts.findMany({
        where: {
          id: account_id,
          company_id: companyId,
        },
        include: {
          toll_providers: true,
        },
      });
    } else {
      accounts = await prisma.company_toll_accounts.findMany({
        where: {
          company_id: companyId,
          account_status: 'active',
        },
        include: {
          toll_providers: true,
        },
      });
    }

    const syncResults = [];

    for (const account of accounts) {
      if (!account.credentials) {
        syncResults.push({
          accountId: account.id,
          success: false,
          error: 'No credentials configured',
        });
        continue;
      }

      try {
        const providerType = account.toll_providers.name
          .toLowerCase()
          .replace(/[^a-z]/g, '') as TollProviderType;
        const config = {
          ...account.credentials,
          baseUrl: account.toll_providers.api_endpoint,
        };

        const service = TollServiceFactory.createService(providerType, config);

        const startDate = start_date
          ? new Date(start_date)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        const endDate = end_date ? new Date(end_date) : new Date();

        const transactions = await service.getTransactions(
          account.account_number || '',
          startDate,
          endDate
        );

        // Save transactions to database
        let createdCount = 0;
        for (const tx of transactions) {
          try {
            await prisma.toll_transactions.create({
              data: {
                company_toll_account_id: account.id,
                transaction_id: tx.transactionId,
                toll_facility_name: tx.facilityName,
                toll_facility_id: tx.facilityId,
                location_address: tx.location?.address,
                location_coordinates: tx.location
                  ? `${tx.location.latitude},${tx.location.longitude}`
                  : null,
                transaction_date: tx.transactionDate,
                amount: tx.amount,
                currency: tx.currency,
                vehicle_class: tx.vehicleClass,
                entry_time: tx.entryTime,
                exit_time: tx.exitTime,
                transaction_status: tx.status,
                provider_data: tx as any,
              },
            });
            createdCount++;
          } catch (dbError) {
            // Transaction might already exist, skip
            logger.debug('Transaction already exists or failed to create:', tx.transactionId);
          }
        }

        syncResults.push({
          accountId: account.id,
          success: true,
          transactionsProcessed: transactions.length,
          transactionsCreated: createdCount,
        });

        // Log sync result
        await prisma.toll_sync_logs.create({
          data: {
            company_toll_account_id: account.id,
            sync_type: 'transactions',
            sync_status: 'completed',
            records_processed: transactions.length,
            records_created: createdCount,
            records_updated: 0,
            sync_duration_seconds: 0,
            completed_at: new Date(),
          },
        });
      } catch (error) {
        syncResults.push({
          accountId: account.id,
          success: false,
          error: error.message,
        });

        // Log sync error
        await prisma.toll_sync_logs.create({
          data: {
            company_toll_account_id: account.id,
            sync_type: 'transactions',
            sync_status: 'failed',
            error_message: error.message,
            completed_at: new Date(),
          },
        });
      }
    }

    res.json({
      success: true,
      syncResults,
      message: 'Transaction sync completed',
    });
  } catch (error) {
    logger.error('Error syncing transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync transactions',
      error: error.message,
    });
  }
};
