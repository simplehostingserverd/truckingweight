/**
 * Fastify Toll Management Controller
 * Handles toll-related business logic for Fastify routes
 */

import { createClient } from '@supabase/supabase-js';
import { TollServiceFactory } from '../../services/toll/index.js';
import { logger } from '../../utils/logger.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Toll controller functions
 */
const tollController = {
  // ===== TOLL PROVIDER CONTROLLERS =====

  /**
   * Get all available toll providers
   */
  async getTollProviders(request, reply) {
    try {
      const { data: providers, error } = await supabase
        .from('toll_providers')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        request.log.error('Error fetching toll providers:', error);
        return reply.code(500).send({
          success: false,
          message: 'Failed to fetch toll providers',
          error: error.message,
        });
      }

      return reply.send({
        success: true,
        providers,
      });
    } catch (error) {
      request.log.error('Error fetching toll providers:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch toll providers',
        error: error.message,
      });
    }
  },

  /**
   * Get specific toll provider information
   */
  async getTollProvider(request, reply) {
    try {
      const { providerId } = request.params;

      const { data: provider, error } = await supabase
        .from('toll_providers')
        .select('*')
        .eq('id', parseInt(providerId))
        .single();

      if (error || !provider) {
        return reply.code(404).send({
          success: false,
          message: 'Toll provider not found',
        });
      }

      // Add provider-specific information from factory
      const providerInfo = TollServiceFactory.getProviderInfo(
        provider.name.toLowerCase().replace(/[^a-z]/g, '')
      );

      return reply.send({
        success: true,
        provider: {
          ...provider,
          ...providerInfo,
        },
      });
    } catch (error) {
      request.log.error('Error fetching toll provider:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch toll provider',
        error: error.message,
      });
    }
  },

  /**
   * Test connection to toll provider
   */
  async testProviderConnection(request, reply) {
    try {
      const { providerId } = request.params;
      const { credentials } = request.body;

      const { data: provider, error } = await supabase
        .from('toll_providers')
        .select('*')
        .eq('id', parseInt(providerId))
        .single();

      if (error || !provider) {
        return reply.code(404).send({
          success: false,
          message: 'Toll provider not found',
        });
      }

      const providerType = provider.name.toLowerCase().replace(/[^a-z]/g, '');
      const config = {
        ...credentials,
        baseUrl: provider.api_endpoint,
      };

      const service = TollServiceFactory.createService(providerType, config);
      const connectionTest = await service.testConnection();

      return reply.send({
        success: connectionTest,
        message: connectionTest ? 'Connection successful' : 'Connection failed',
      });
    } catch (error) {
      request.log.error('Error testing provider connection:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to test provider connection',
        error: error.message,
      });
    }
  },

  // ===== COMPANY TOLL ACCOUNT CONTROLLERS =====

  /**
   * Get all company toll accounts
   */
  async getCompanyTollAccounts(request, reply) {
    try {
      const companyId = request.user.companyId;
      const { provider_id, status, limit = '50', offset = '0' } = request.query;

      let query = supabase
        .from('company_toll_accounts')
        .select(`
          *,
          toll_providers (*)
        `)
        .eq('company_id', companyId);

      if (provider_id) query = query.eq('toll_provider_id', parseInt(provider_id));
      if (status) query = query.eq('account_status', status);

      const { data: accounts, error } = await query
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
        .order('created_at', { ascending: false });

      if (error) {
        request.log.error('Error fetching company toll accounts:', error);
        return reply.code(500).send({
          success: false,
          message: 'Failed to fetch toll accounts',
          error: error.message,
        });
      }

      // Get total count
      const { count, error: countError } = await supabase
        .from('company_toll_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      return reply.send({
        success: true,
        accounts,
        total: count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (error) {
      request.log.error('Error fetching company toll accounts:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch toll accounts',
        error: error.message,
      });
    }
  },

  /**
   * Get specific company toll account
   */
  async getCompanyTollAccount(request, reply) {
    try {
      const { accountId } = request.params;
      const companyId = request.user.companyId;

      const { data: account, error } = await supabase
        .from('company_toll_accounts')
        .select(`
          *,
          toll_providers (*),
          vehicle_toll_transponders (
            *,
            vehicles (*)
          )
        `)
        .eq('id', parseInt(accountId))
        .eq('company_id', companyId)
        .single();

      if (error || !account) {
        return reply.code(404).send({
          success: false,
          message: 'Toll account not found',
        });
      }

      // Remove sensitive credentials from response
      const { credentials, ...safeAccount } = account;

      return reply.send({
        success: true,
        account: safeAccount,
      });
    } catch (error) {
      request.log.error('Error fetching toll account:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch toll account',
        error: error.message,
      });
    }
  },

  /**
   * Create new company toll account
   */
  async createCompanyTollAccount(request, reply) {
    try {
      const companyId = request.user.companyId;
      const { toll_provider_id, account_number, account_name, credentials, account_settings } =
        request.body;

      // Check if account already exists
      const { data: existingAccount } = await supabase
        .from('company_toll_accounts')
        .select('id')
        .eq('company_id', companyId)
        .eq('toll_provider_id', toll_provider_id)
        .eq('account_number', account_number)
        .single();

      if (existingAccount) {
        return reply.code(400).send({
          success: false,
          message: 'Toll account already exists for this provider and account number',
        });
      }

      // Validate provider exists
      const { data: provider, error: providerError } = await supabase
        .from('toll_providers')
        .select('*')
        .eq('id', toll_provider_id)
        .single();

      if (providerError || !provider) {
        return reply.code(404).send({
          success: false,
          message: 'Toll provider not found',
        });
      }

      // Test credentials if provided
      if (credentials) {
        const providerType = provider.name.toLowerCase().replace(/[^a-z]/g, '');
        const config = {
          ...credentials,
          baseUrl: provider.api_endpoint,
        };

        try {
          const service = TollServiceFactory.createService(providerType, config);
          const isValid = await service.validateCredentials();

          if (!isValid) {
            return reply.code(400).send({
              success: false,
              message: 'Invalid credentials for toll provider',
            });
          }
        } catch (credError) {
          request.log.warn('Could not validate credentials during account creation:', credError);
        }
      }

      const { data: account, error } = await supabase
        .from('company_toll_accounts')
        .insert([
          {
            company_id: companyId,
            toll_provider_id,
            account_number,
            account_name,
            credentials,
            account_settings,
            account_status: 'active',
            sync_status: 'pending',
          },
        ])
        .select(`
          *,
          toll_providers (*)
        `)
        .single();

      if (error) {
        request.log.error('Error creating toll account:', error);
        return reply.code(500).send({
          success: false,
          message: 'Failed to create toll account',
          error: error.message,
        });
      }

      // Remove sensitive credentials from response
      const { credentials: _, ...safeAccount } = account;

      return reply.code(201).send({
        success: true,
        account: safeAccount,
        message: 'Toll account created successfully',
      });
    } catch (error) {
      request.log.error('Error creating toll account:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to create toll account',
        error: error.message,
      });
    }
  },

  /**
   * Update company toll account
   */
  async updateCompanyTollAccount(request, reply) {
    try {
      const { accountId } = request.params;
      const companyId = request.user.companyId;
      const { account_name, credentials, account_settings, account_status } = request.body;

      const { data: account, error: fetchError } = await supabase
        .from('company_toll_accounts')
        .select(`
          *,
          toll_providers (*)
        `)
        .eq('id', parseInt(accountId))
        .eq('company_id', companyId)
        .single();

      if (fetchError || !account) {
        return reply.code(404).send({
          success: false,
          message: 'Toll account not found',
        });
      }

      // Test new credentials if provided
      if (credentials) {
        const providerType = account.toll_providers.name.toLowerCase().replace(/[^a-z]/g, '');
        const config = {
          ...credentials,
          baseUrl: account.toll_providers.api_endpoint,
        };

        try {
          const service = TollServiceFactory.createService(providerType, config);
          const isValid = await service.validateCredentials();

          if (!isValid) {
            return reply.code(400).send({
              success: false,
              message: 'Invalid credentials for toll provider',
            });
          }
        } catch (credError) {
          request.log.warn('Could not validate credentials during account update:', credError);
        }
      }

      const { data: updatedAccount, error } = await supabase
        .from('company_toll_accounts')
        .update({
          account_name,
          credentials,
          account_settings,
          account_status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', parseInt(accountId))
        .select(`
          *,
          toll_providers (*)
        `)
        .single();

      if (error) {
        request.log.error('Error updating toll account:', error);
        return reply.code(500).send({
          success: false,
          message: 'Failed to update toll account',
          error: error.message,
        });
      }

      // Remove sensitive credentials from response
      const { credentials: _, ...safeAccount } = updatedAccount;

      return reply.send({
        success: true,
        account: safeAccount,
        message: 'Toll account updated successfully',
      });
    } catch (error) {
      request.log.error('Error updating toll account:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to update toll account',
        error: error.message,
      });
    }
  },

  /**
   * Delete company toll account
   */
  async deleteCompanyTollAccount(request, reply) {
    try {
      const { accountId } = request.params;
      const companyId = request.user.companyId;

      const { data: account, error: fetchError } = await supabase
        .from('company_toll_accounts')
        .select('id')
        .eq('id', parseInt(accountId))
        .eq('company_id', companyId)
        .single();

      if (fetchError || !account) {
        return reply.code(404).send({
          success: false,
          message: 'Toll account not found',
        });
      }

      const { error } = await supabase
        .from('company_toll_accounts')
        .delete()
        .eq('id', parseInt(accountId));

      if (error) {
        request.log.error('Error deleting toll account:', error);
        return reply.code(500).send({
          success: false,
          message: 'Failed to delete toll account',
          error: error.message,
        });
      }

      return reply.send({
        success: true,
        message: 'Toll account deleted successfully',
      });
    } catch (error) {
      request.log.error('Error deleting toll account:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to delete toll account',
        error: error.message,
      });
    }
  },

  /**
   * Sync toll account data from provider
   */
  async syncTollAccount(request, reply) {
    try {
      const { accountId } = request.params;
      const companyId = request.user.companyId;

      const { data: account, error: fetchError } = await supabase
        .from('company_toll_accounts')
        .select(`
          *,
          toll_providers (*)
        `)
        .eq('id', parseInt(accountId))
        .eq('company_id', companyId)
        .single();

      if (fetchError || !account) {
        return reply.code(404).send({
          success: false,
          message: 'Toll account not found',
        });
      }

      if (!account.credentials) {
        return reply.code(400).send({
          success: false,
          message: 'No credentials configured for this account',
        });
      }

      // Update sync status to 'syncing'
      await supabase
        .from('company_toll_accounts')
        .update({
          sync_status: 'syncing',
          sync_error_message: null,
        })
        .eq('id', parseInt(accountId));

      try {
        const providerType = account.toll_providers.name.toLowerCase().replace(/[^a-z]/g, '');
        const config = {
          ...account.credentials,
          baseUrl: account.toll_providers.api_endpoint,
        };

        const service = TollServiceFactory.createService(providerType, config);
        const syncResult = await service.syncAccountData(account.account_number || '');

        // Log sync result
        await supabase.from('toll_sync_logs').insert([
          {
            company_toll_account_id: account.id,
            sync_type: 'full_sync',
            sync_status: syncResult.success ? 'completed' : 'failed',
            records_processed: syncResult.recordsProcessed,
            records_created: syncResult.recordsCreated,
            records_updated: syncResult.recordsUpdated,
            error_message: syncResult.errors.join('; ') || null,
            sync_duration_seconds: Math.round(syncResult.syncDuration / 1000),
            completed_at: new Date().toISOString(),
          },
        ]);

        // Update account sync status
        await supabase
          .from('company_toll_accounts')
          .update({
            sync_status: syncResult.success ? 'success' : 'error',
            sync_error_message: syncResult.success ? null : syncResult.errors.join('; '),
            last_sync_at: new Date().toISOString(),
          })
          .eq('id', parseInt(accountId));

        return reply.send({
          success: true,
          syncResult,
          message: syncResult.success ? 'Account synced successfully' : 'Sync completed with errors',
        });
      } catch (syncError) {
        // Update sync status to 'error'
        await supabase
          .from('company_toll_accounts')
          .update({
            sync_status: 'error',
            sync_error_message: syncError.message,
          })
          .eq('id', parseInt(accountId));

        throw syncError;
      }
    } catch (error) {
      request.log.error('Error syncing toll account:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to sync toll account',
        error: error.message,
      });
    }
  },

  // Placeholder functions for other endpoints
  async calculateRouteTolls(request, reply) {
    return reply.code(501).send({
      success: false,
      message: 'Route toll calculation feature coming soon',
    });
  },

  async saveRouteEstimate(request, reply) {
    return reply.code(501).send({
      success: false,
      message: 'Route estimate saving feature coming soon',
    });
  },

  async getRouteEstimates(request, reply) {
    return reply.code(501).send({
      success: false,
      message: 'Route estimates feature coming soon',
    });
  },

  async getTollTransactions(request, reply) {
    return reply.code(501).send({
      success: false,
      message: 'Toll transactions feature coming soon',
    });
  },

  async getTollTransaction(request, reply) {
    return reply.code(501).send({
      success: false,
      message: 'Toll transaction details feature coming soon',
    });
  },

  async syncTransactions(request, reply) {
    return reply.code(501).send({
      success: false,
      message: 'Transaction sync feature coming soon',
    });
  },

  async getTollSummary(request, reply) {
    return reply.code(501).send({
      success: false,
      message: 'Toll summary feature coming soon',
    });
  },

  async getTollReports(request, reply) {
    return reply.code(501).send({
      success: false,
      message: 'Toll reports feature coming soon',
    });
  },
};

export default tollController;
