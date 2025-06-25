/**
 * Toll Management Controller
 * Handles toll-related business logic and API endpoints
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TollServiceFactory, TollProviderType } from '../services/toll';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Type definitions for toll queries
interface CompanyTollAccountWhereClause {
  company_id: number;
  toll_provider_id?: number;
  account_status?: string;
}

// ===== TOLL PROVIDER CONTROLLERS =====

/**
 * Get all available toll providers
 */
export const getTollProviders = async (req: Request, res: Response) => {
  try {
    const providers = await prisma.toll_providers.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      providers,
    });
  } catch (error) {
    logger.error('Error fetching toll providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch toll providers',
      error: error.message,
    });
  }
};

/**
 * Get specific toll provider information
 */
export const getTollProvider = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;

    const provider = await prisma.toll_providers.findUnique({
      where: { id: parseInt(providerId) },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Toll provider not found',
      });
    }

    // Add provider-specific information from factory
    const providerInfo = TollServiceFactory.getProviderInfo(
      provider.name.toLowerCase().replace(/[^a-z]/g, '') as TollProviderType
    );

    res.json({
      success: true,
      provider: {
        ...provider,
        ...providerInfo,
      },
    });
  } catch (error) {
    logger.error('Error fetching toll provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch toll provider',
      error: error.message,
    });
  }
};

/**
 * Test connection to toll provider
 */
export const testProviderConnection = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    const { credentials } = req.body;

    const provider = await prisma.toll_providers.findUnique({
      where: { id: parseInt(providerId) },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Toll provider not found',
      });
    }

    const providerType = provider.name.toLowerCase().replace(/[^a-z]/g, '') as TollProviderType;
    const config = {
      ...credentials,
      baseUrl: provider.api_endpoint,
    };

    const service = TollServiceFactory.createService(providerType, config);
    const connectionTest = await service.testConnection();

    res.json({
      success: connectionTest,
      message: connectionTest ? 'Connection successful' : 'Connection failed',
    });
  } catch (error) {
    logger.error('Error testing provider connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test provider connection',
      error: error.message,
    });
  }
};

/**
 * Validate toll provider credentials
 */
export const validateProviderCredentials = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    const { credentials } = req.body;

    const provider = await prisma.toll_providers.findUnique({
      where: { id: parseInt(providerId) },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Toll provider not found',
      });
    }

    const providerType = provider.name.toLowerCase().replace(/[^a-z]/g, '') as TollProviderType;
    const config = {
      ...credentials,
      baseUrl: provider.api_endpoint,
    };

    const service = TollServiceFactory.createService(providerType, config);
    const isValid = await service.validateCredentials();

    res.json({
      success: true,
      valid: isValid,
      message: isValid ? 'Credentials are valid' : 'Invalid credentials',
    });
  } catch (error) {
    logger.error('Error validating provider credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate credentials',
      error: error.message,
    });
  }
};

// ===== COMPANY TOLL ACCOUNT CONTROLLERS =====

/**
 * Get all company toll accounts
 */
export const getCompanyTollAccounts = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { provider_id, status, limit = '50', offset = '0' } = req.query;

    const where: CompanyTollAccountWhereClause = { company_id: companyId };
    if (provider_id) where.toll_provider_id = parseInt(provider_id as string);
    if (status) where.account_status = status;

    const accounts = await prisma.company_toll_accounts.findMany({
      where,
      include: {
        toll_providers: true,
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { created_at: 'desc' },
    });

    const total = await prisma.company_toll_accounts.count({ where });

    res.json({
      success: true,
      accounts,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    logger.error('Error fetching company toll accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch toll accounts',
      error: error.message,
    });
  }
};

/**
 * Get specific company toll account
 */
export const getCompanyTollAccount = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const companyId = req.user?.companyId;

    const account = await prisma.company_toll_accounts.findFirst({
      where: {
        id: parseInt(accountId),
        company_id: companyId,
      },
      include: {
        toll_providers: true,
        vehicle_toll_transponders: {
          include: {
            vehicles: true,
          },
        },
      },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Toll account not found',
      });
    }

    // Remove sensitive credentials from response
    const { credentials, ...safeAccount } = account;

    res.json({
      success: true,
      account: safeAccount,
    });
  } catch (error) {
    logger.error('Error fetching toll account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch toll account',
      error: error.message,
    });
  }
};

/**
 * Create new company toll account
 */
export const createCompanyTollAccount = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { toll_provider_id, account_number, account_name, credentials, account_settings } =
      req.body;

    // Check if account already exists
    const existingAccount = await prisma.company_toll_accounts.findFirst({
      where: {
        company_id: companyId,
        toll_provider_id,
        account_number,
      },
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Toll account already exists for this provider and account number',
      });
    }

    // Validate provider exists
    const provider = await prisma.toll_providers.findUnique({
      where: { id: toll_provider_id },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Toll provider not found',
      });
    }

    // Test credentials if provided
    if (credentials) {
      const providerType = provider.name.toLowerCase().replace(/[^a-z]/g, '') as TollProviderType;
      const config = {
        ...credentials,
        baseUrl: provider.api_endpoint,
      };

      try {
        const service = TollServiceFactory.createService(providerType, config);
        const isValid = await service.validateCredentials();

        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: 'Invalid credentials for toll provider',
          });
        }
      } catch (credError) {
        logger.warn('Could not validate credentials during account creation:', credError);
      }
    }

    const account = await prisma.company_toll_accounts.create({
      data: {
        company_id: companyId,
        toll_provider_id,
        account_number,
        account_name,
        credentials,
        account_settings,
        account_status: 'active',
        sync_status: 'pending',
      },
      include: {
        toll_providers: true,
      },
    });

    // Remove sensitive credentials from response
    const { credentials: _, ...safeAccount } = account;

    res.status(201).json({
      success: true,
      account: safeAccount,
      message: 'Toll account created successfully',
    });
  } catch (error) {
    logger.error('Error creating toll account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create toll account',
      error: error.message,
    });
  }
};

/**
 * Update company toll account
 */
export const updateCompanyTollAccount = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const companyId = req.user?.companyId;
    const { account_name, credentials, account_settings, account_status } = req.body;

    const account = await prisma.company_toll_accounts.findFirst({
      where: {
        id: parseInt(accountId),
        company_id: companyId,
      },
      include: {
        toll_providers: true,
      },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Toll account not found',
      });
    }

    // Test new credentials if provided
    if (credentials) {
      const providerType = account.toll_providers.name
        .toLowerCase()
        .replace(/[^a-z]/g, '') as TollProviderType;
      const config = {
        ...credentials,
        baseUrl: account.toll_providers.api_endpoint,
      };

      try {
        const service = TollServiceFactory.createService(providerType, config);
        const isValid = await service.validateCredentials();

        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: 'Invalid credentials for toll provider',
          });
        }
      } catch (credError) {
        logger.warn('Could not validate credentials during account update:', credError);
      }
    }

    const updatedAccount = await prisma.company_toll_accounts.update({
      where: { id: parseInt(accountId) },
      data: {
        account_name,
        credentials,
        account_settings,
        account_status,
        updated_at: new Date(),
      },
      include: {
        toll_providers: true,
      },
    });

    // Remove sensitive credentials from response
    const { credentials: _, ...safeAccount } = updatedAccount;

    res.json({
      success: true,
      account: safeAccount,
      message: 'Toll account updated successfully',
    });
  } catch (error) {
    logger.error('Error updating toll account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update toll account',
      error: error.message,
    });
  }
};

/**
 * Delete company toll account
 */
export const deleteCompanyTollAccount = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const companyId = req.user?.companyId;

    const account = await prisma.company_toll_accounts.findFirst({
      where: {
        id: parseInt(accountId),
        company_id: companyId,
      },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Toll account not found',
      });
    }

    await prisma.company_toll_accounts.delete({
      where: { id: parseInt(accountId) },
    });

    res.json({
      success: true,
      message: 'Toll account deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting toll account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete toll account',
      error: error.message,
    });
  }
};

/**
 * Sync toll account data from provider
 */
export const syncTollAccount = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const companyId = req.user?.companyId;

    const account = await prisma.company_toll_accounts.findFirst({
      where: {
        id: parseInt(accountId),
        company_id: companyId,
      },
      include: {
        toll_providers: true,
      },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Toll account not found',
      });
    }

    if (!account.credentials) {
      return res.status(400).json({
        success: false,
        message: 'No credentials configured for this account',
      });
    }

    // Update sync status to 'syncing'
    await prisma.company_toll_accounts.update({
      where: { id: parseInt(accountId) },
      data: {
        sync_status: 'syncing',
        sync_error_message: null,
      },
    });

    try {
      const providerType = account.toll_providers.name
        .toLowerCase()
        .replace(/[^a-z]/g, '') as TollProviderType;
      const config = {
        ...account.credentials,
        baseUrl: account.toll_providers.api_endpoint,
      };

      const service = TollServiceFactory.createService(providerType, config);
      const syncResult = await service.syncAccountData(account.account_number || '');

      // Log sync result
      await prisma.toll_sync_logs.create({
        data: {
          company_toll_account_id: account.id,
          sync_type: 'full_sync',
          sync_status: syncResult.success ? 'completed' : 'failed',
          records_processed: syncResult.recordsProcessed,
          records_created: syncResult.recordsCreated,
          records_updated: syncResult.recordsUpdated,
          error_message: syncResult.errors.join('; ') || null,
          sync_duration_seconds: Math.round(syncResult.syncDuration / 1000),
          completed_at: new Date(),
        },
      });

      // Update account sync status
      await prisma.company_toll_accounts.update({
        where: { id: parseInt(accountId) },
        data: {
          sync_status: syncResult.success ? 'success' : 'error',
          sync_error_message: syncResult.success ? null : syncResult.errors.join('; '),
          last_sync_at: new Date(),
        },
      });

      res.json({
        success: true,
        syncResult,
        message: syncResult.success ? 'Account synced successfully' : 'Sync completed with errors',
      });
    } catch (syncError) {
      // Update sync status to 'error'
      await prisma.company_toll_accounts.update({
        where: { id: parseInt(accountId) },
        data: {
          sync_status: 'error',
          sync_error_message: syncError.message,
        },
      });

      throw syncError;
    }
  } catch (error) {
    logger.error('Error syncing toll account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync toll account',
      error: error.message,
    });
  }
};

// ===== VEHICLE TRANSPONDER CONTROLLERS =====

/**
 * Get transponders for a vehicle
 */
export const getVehicleTransponders = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const companyId = req.user?.companyId;

    // Verify vehicle belongs to company
    const vehicle = await prisma.vehicles.findFirst({
      where: {
        id: parseInt(vehicleId),
        company_id: companyId,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    const transponders = await prisma.vehicle_toll_transponders.findMany({
      where: { vehicle_id: parseInt(vehicleId) },
      include: {
        company_toll_accounts: {
          include: {
            toll_providers: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({
      success: true,
      transponders,
    });
  } catch (error) {
    logger.error('Error fetching vehicle transponders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle transponders',
      error: error.message,
    });
  }
};

/**
 * Assign transponder to vehicle
 */
export const assignTransponder = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const companyId = req.user?.companyId;
    const { company_toll_account_id, transponder_id, transponder_type, assigned_date, notes } =
      req.body;

    // Verify vehicle belongs to company
    const vehicle = await prisma.vehicles.findFirst({
      where: {
        id: parseInt(vehicleId),
        company_id: companyId,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    // Verify toll account belongs to company
    const tollAccount = await prisma.company_toll_accounts.findFirst({
      where: {
        id: company_toll_account_id,
        company_id: companyId,
      },
    });

    if (!tollAccount) {
      return res.status(404).json({
        success: false,
        message: 'Toll account not found',
      });
    }

    // Check if transponder already assigned to this vehicle and account
    const existingTransponder = await prisma.vehicle_toll_transponders.findFirst({
      where: {
        vehicle_id: parseInt(vehicleId),
        company_toll_account_id,
      },
    });

    if (existingTransponder) {
      return res.status(400).json({
        success: false,
        message: 'Transponder already assigned to this vehicle for this account',
      });
    }

    const transponder = await prisma.vehicle_toll_transponders.create({
      data: {
        vehicle_id: parseInt(vehicleId),
        company_toll_account_id,
        transponder_id,
        transponder_type,
        assigned_date: assigned_date ? new Date(assigned_date) : new Date(),
        notes,
        status: 'active',
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

    res.status(201).json({
      success: true,
      transponder,
      message: 'Transponder assigned successfully',
    });
  } catch (error) {
    logger.error('Error assigning transponder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign transponder',
      error: error.message,
    });
  }
};

// Re-export functions from extended controller
export {
  updateTransponder,
  removeTransponder,
  calculateRouteTolls,
  saveRouteEstimate,
  getRouteEstimates,
  getTollTransactions,
  getTollTransaction,
  syncTransactions,
} from './tollControllerExtended';

// Placeholder functions for reporting (to be implemented)
export const getTollSummary = async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: 'Toll summary feature coming soon',
  });
};

export const getTollReports = async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: 'Toll reports feature coming soon',
  });
};
