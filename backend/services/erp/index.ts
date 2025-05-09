import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { NetSuiteService } from './netsuite';
import { SapService } from './sap';
import Redis from 'ioredis';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export interface ErpData {
  id: string;
  type: string;
  attributes: Record<string, any>;
}

export interface ErpProvider {
  fetchCustomers(): Promise<ErpData[]>;
  fetchInvoices(customerId?: string): Promise<ErpData[]>;
  createInvoice(invoiceData: any): Promise<ErpData>;
  syncWeighTicket(ticketId: string, ticketData: any): Promise<ErpData>;
}

export class ErpService {
  private providers: Map<string, ErpProvider> = new Map();

  constructor() {
    // Initialize providers
    this.providers.set('netsuite', new NetSuiteService());
    this.providers.set('sap', new SapService());
  }

  /**
   * Get an ERP provider instance
   */
  getProvider(providerName: string): ErpProvider | null {
    return this.providers.get(providerName.toLowerCase()) || null;
  }

  /**
   * Fetch customers from an ERP provider
   */
  async fetchCustomers(connectionId: string): Promise<ErpData[] | null> {
    try {
      // Get the integration connection
      const connection = await prisma.integration_connections.findUnique({
        where: { id: connectionId }
      });

      if (!connection || connection.integration_type !== 'erp' || !connection.is_active) {
        throw new Error('Invalid or inactive ERP connection');
      }

      // Get the provider
      const provider = this.getProvider(connection.provider);
      if (!provider) {
        throw new Error(`Unsupported ERP provider: ${connection.provider}`);
      }

      // Check cache first
      const cacheKey = `erp:customers:${connectionId}`;
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // Fetch data from provider
      const data = await provider.fetchCustomers();

      // Cache the data for 30 minutes
      await redis.set(cacheKey, JSON.stringify(data), 'EX', 1800);

      // Log the successful fetch
      await this.logErpEvent(connectionId, 'fetch_customers', 'success', {
        count: data.length,
        timestamp: new Date()
      });

      return data;
    } catch (error) {
      logger.error('Error fetching customers from ERP:', error);
      
      // Log the error
      await this.logErpEvent(connectionId, 'fetch_customers', 'error', {
        error: error.message
      });
      
      return null;
    }
  }

  /**
   * Fetch invoices from an ERP provider
   */
  async fetchInvoices(connectionId: string, customerId?: string): Promise<ErpData[] | null> {
    try {
      // Get the integration connection
      const connection = await prisma.integration_connections.findUnique({
        where: { id: connectionId }
      });

      if (!connection || connection.integration_type !== 'erp' || !connection.is_active) {
        throw new Error('Invalid or inactive ERP connection');
      }

      // Get the provider
      const provider = this.getProvider(connection.provider);
      if (!provider) {
        throw new Error(`Unsupported ERP provider: ${connection.provider}`);
      }

      // Check cache first
      const cacheKey = `erp:invoices:${connectionId}:${customerId || 'all'}`;
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // Fetch data from provider
      const data = await provider.fetchInvoices(customerId);

      // Cache the data for 15 minutes
      await redis.set(cacheKey, JSON.stringify(data), 'EX', 900);

      // Log the successful fetch
      await this.logErpEvent(connectionId, 'fetch_invoices', 'success', {
        customerId: customerId || 'all',
        count: data.length,
        timestamp: new Date()
      });

      return data;
    } catch (error) {
      logger.error('Error fetching invoices from ERP:', error);
      
      // Log the error
      await this.logErpEvent(connectionId, 'fetch_invoices', 'error', {
        customerId: customerId || 'all',
        error: error.message
      });
      
      return null;
    }
  }

  /**
   * Create an invoice in an ERP provider
   */
  async createInvoice(connectionId: string, invoiceData: any): Promise<ErpData | null> {
    try {
      // Get the integration connection
      const connection = await prisma.integration_connections.findUnique({
        where: { id: connectionId }
      });

      if (!connection || connection.integration_type !== 'erp' || !connection.is_active) {
        throw new Error('Invalid or inactive ERP connection');
      }

      // Get the provider
      const provider = this.getProvider(connection.provider);
      if (!provider) {
        throw new Error(`Unsupported ERP provider: ${connection.provider}`);
      }

      // Create invoice in provider
      const data = await provider.createInvoice(invoiceData);

      // Invalidate cache
      const cacheKey = `erp:invoices:${connectionId}:${invoiceData.customerId || 'all'}`;
      await redis.del(cacheKey);

      // Log the successful creation
      await this.logErpEvent(connectionId, 'create_invoice', 'success', {
        invoiceId: data.id,
        customerId: invoiceData.customerId,
        timestamp: new Date()
      });

      return data;
    } catch (error) {
      logger.error('Error creating invoice in ERP:', error);
      
      // Log the error
      await this.logErpEvent(connectionId, 'create_invoice', 'error', {
        customerId: invoiceData.customerId,
        error: error.message
      });
      
      return null;
    }
  }

  /**
   * Sync a weigh ticket to an ERP provider
   */
  async syncWeighTicket(connectionId: string, ticketId: string): Promise<ErpData | null> {
    try {
      // Get the integration connection
      const connection = await prisma.integration_connections.findUnique({
        where: { id: connectionId }
      });

      if (!connection || connection.integration_type !== 'erp' || !connection.is_active) {
        throw new Error('Invalid or inactive ERP connection');
      }

      // Get the provider
      const provider = this.getProvider(connection.provider);
      if (!provider) {
        throw new Error(`Unsupported ERP provider: ${connection.provider}`);
      }

      // Get the weigh ticket data
      const ticket = await prisma.weigh_tickets.findUnique({
        where: { id: parseInt(ticketId) },
        include: {
          vehicles: true,
          drivers: true,
          companies: true,
          cargo: true
        }
      });

      if (!ticket) {
        throw new Error(`Weigh ticket with ID ${ticketId} not found`);
      }

      // Sync ticket to ERP
      const data = await provider.syncWeighTicket(ticketId, ticket);

      // Log the successful sync
      await this.logErpEvent(connectionId, 'sync_weigh_ticket', 'success', {
        ticketId,
        erpId: data.id,
        timestamp: new Date()
      });

      return data;
    } catch (error) {
      logger.error('Error syncing weigh ticket to ERP:', error);
      
      // Log the error
      await this.logErpEvent(connectionId, 'sync_weigh_ticket', 'error', {
        ticketId,
        error: error.message
      });
      
      return null;
    }
  }

  /**
   * Log an ERP event
   */
  private async logErpEvent(
    connectionId: string,
    eventType: string,
    status: 'success' | 'error' | 'warning',
    details: any
  ): Promise<void> {
    try {
      await prisma.integration_logs.create({
        data: {
          id: uuidv4(),
          integration_connection_id: connectionId,
          event_type: eventType,
          status,
          message: `ERP ${eventType} ${status}`,
          details
        }
      });
    } catch (error) {
      logger.error('Error logging ERP event:', error);
    }
  }
}

// Export singleton instance
export const erpService = new ErpService();
