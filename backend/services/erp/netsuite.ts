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

import axios from 'axios';
import { ErpProvider, ErpData } from './index';
import { logger } from '../../utils/logger';

interface NetSuiteCredentials {
  accountId: string;
  consumerKey: string;
  consumerSecret: string;
  tokenId: string;
  tokenSecret: string;
}

export class NetSuiteService implements ErpProvider {
  private credentials: NetSuiteCredentials | null = null;
  private baseUrl: string = 'https://rest.netsuite.com/app/site/hosting/restlet.nl';

  constructor(credentials?: NetSuiteCredentials) {
    if (credentials) {
      this.credentials = credentials;
    }
  }

  /**
   * Set the credentials for NetSuite
   */
  setCredentials(credentials: NetSuiteCredentials): void {
    this.credentials = credentials;
  }

  /**
   * Generate OAuth 1.0 headers for NetSuite
   */
  private generateOAuthHeaders(method: string, url: string): Record<string, string> {
    if (!this.credentials) {
      throw new Error('NetSuite credentials not configured');
    }

    // This is a simplified version - in a real implementation, you would use a proper OAuth 1.0 library
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    return {
      Authorization: `OAuth realm="${this.credentials.accountId}",oauth_consumer_key="${this.credentials.consumerKey}",oauth_token="${this.credentials.tokenId}",oauth_signature_method="HMAC-SHA256",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_version="1.0"`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make an authenticated call to NetSuite API
   */
  private async callApi(
    scriptId: string,
    deployId: string,
    method: string,
    data?: any
  ): Promise<any> {
    try {
      const url = `${this.baseUrl}?script=${scriptId}&deploy=${deployId}`;
      const headers = this.generateOAuthHeaders(method, url);

      let response;
      if (method === 'GET') {
        response = await axios.get(url, { headers });
      } else if (method === 'POST') {
        response = await axios.post(url, data, { headers });
      } else if (method === 'PUT') {
        response = await axios.put(url, data, { headers });
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`);
      }

      return response.data;
    } catch (error) {
      logger.error(`Error calling NetSuite API:`, error);
      throw new Error(`Failed to call NetSuite API: ${error.message}`);
    }
  }

  /**
   * Fetch customers from NetSuite
   */
  async fetchCustomers(): Promise<ErpData[]> {
    try {
      // Call NetSuite RESTlet to get customers
      const response = await this.callApi(
        'customscript_sm_customers',
        'customdeploy_sm_customers',
        'GET'
      );

      // Transform the response to our standard format
      return response.map(customer => ({
        id: customer.id,
        type: 'customer',
        attributes: {
          name: customer.companyName,
          email: customer.email,
          phone: customer.phone,
          address: {
            street: customer.address.addr1,
            city: customer.address.city,
            state: customer.address.state,
            zip: customer.address.zip,
            country: customer.address.country,
          },
          accountNumber: customer.accountNumber,
          terms: customer.terms,
          creditLimit: customer.creditLimit,
        },
      }));
    } catch (error) {
      logger.error('Error fetching customers from NetSuite:', error);
      throw new Error(`Failed to fetch customers from NetSuite: ${error.message}`);
    }
  }

  /**
   * Fetch invoices from NetSuite
   */
  async fetchInvoices(customerId?: string): Promise<ErpData[]> {
    try {
      // Call NetSuite RESTlet to get invoices
      const response = await this.callApi(
        'customscript_sm_invoices',
        'customdeploy_sm_invoices',
        'POST',
        { customerId }
      );

      // Transform the response to our standard format
      return response.map(invoice => ({
        id: invoice.id,
        type: 'invoice',
        attributes: {
          tranId: invoice.tranId,
          customerId: invoice.customer.id,
          customerName: invoice.customer.name,
          date: invoice.tranDate,
          dueDate: invoice.dueDate,
          amount: invoice.total,
          status: invoice.status,
          memo: invoice.memo,
          items: invoice.items.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        },
      }));
    } catch (error) {
      logger.error('Error fetching invoices from NetSuite:', error);
      throw new Error(`Failed to fetch invoices from NetSuite: ${error.message}`);
    }
  }

  /**
   * Create an invoice in NetSuite
   */
  async createInvoice(invoiceData: any): Promise<ErpData> {
    try {
      // Transform our data to NetSuite format
      const netsuiteInvoice = {
        customerId: invoiceData.customerId,
        tranDate: invoiceData.date,
        dueDate: invoiceData.dueDate,
        memo: invoiceData.memo,
        items: invoiceData.items.map(item => ({
          itemId: item.itemId,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
        })),
      };

      // Call NetSuite RESTlet to create invoice
      const response = await this.callApi(
        'customscript_sm_create_invoice',
        'customdeploy_sm_create_invoice',
        'POST',
        netsuiteInvoice
      );

      // Transform the response to our standard format
      return {
        id: response.id,
        type: 'invoice',
        attributes: {
          tranId: response.tranId,
          customerId: response.customer.id,
          customerName: response.customer.name,
          date: response.tranDate,
          dueDate: response.dueDate,
          amount: response.total,
          status: response.status,
          memo: response.memo,
          items: response.items.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        },
      };
    } catch (error) {
      logger.error('Error creating invoice in NetSuite:', error);
      throw new Error(`Failed to create invoice in NetSuite: ${error.message}`);
    }
  }

  /**
   * Sync a weigh ticket to NetSuite
   */
  async syncWeighTicket(ticketId: string, ticketData: any): Promise<ErpData> {
    try {
      // Transform weigh ticket data to NetSuite format
      const netsuiteTicket = {
        ticketId,
        ticketNumber: ticketData.ticket_number,
        date: ticketData.date_time,
        customerId: ticketData.companies?.id,
        customerName: ticketData.companies?.name,
        vehicleId: ticketData.vehicles?.id,
        vehicleName: ticketData.vehicles?.name,
        driverId: ticketData.drivers?.id,
        driverName: ticketData.drivers?.name,
        grossWeight: ticketData.gross_weight,
        tareWeight: ticketData.tare_weight,
        netWeight: ticketData.net_weight,
        unit: ticketData.unit,
        cargo: ticketData.cargo?.map(c => ({
          description: c.description,
          commodityType: c.commodity_type,
          isHazmat: c.is_hazmat,
          hazmatClass: c.hazmat_class,
        })),
      };

      // Call NetSuite RESTlet to sync weigh ticket
      const response = await this.callApi(
        'customscript_sm_sync_ticket',
        'customdeploy_sm_sync_ticket',
        'POST',
        netsuiteTicket
      );

      // Transform the response to our standard format
      return {
        id: response.id,
        type: 'weighTicket',
        attributes: {
          ticketId,
          ticketNumber: response.ticketNumber,
          netsuiteId: response.netsuiteId,
          status: response.status,
          invoiceId: response.invoiceId,
          syncDate: response.syncDate,
        },
      };
    } catch (error) {
      logger.error('Error syncing weigh ticket to NetSuite:', error);
      throw new Error(`Failed to sync weigh ticket to NetSuite: ${error.message}`);
    }
  }
}
