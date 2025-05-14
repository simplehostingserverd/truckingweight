import axios from 'axios'
import { ErpProvider, ErpData } from './index'
import { logger } from '../../utils/logger'

interface SapCredentials {
  baseUrl: string
  username: string
  password: string
  clientId: string
  apiKey?: string
}

export class SapService implements ErpProvider {
  private credentials: SapCredentials | null = null
  private token: string | null = null
  private tokenExpiry: Date | null = null

  constructor(credentials?: SapCredentials) {
    if (credentials) {
      this.credentials = credentials
    }
  }

  /**
   * Set the credentials for SAP
   */
  setCredentials(credentials: SapCredentials): void {
    this.credentials = credentials
    this.token = null
    this.tokenExpiry = null
  }

  /**
   * Authenticate with SAP API
   */
  private async authenticate(): Promise<): Promise<): Promise<): Promise<): ): ): Promise<string> => {> {> { {> { {> {
    if (!this.credentials) {
      throw new Error('SAP credentials not configured')
    }

    // Check if we have a valid token
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token
    }

    try {
      const response = await axios.post(
        `${this.credentials.baseUrl}/oauth/token`,
        {
          grant_type: 'password',
          client_id: this.credentials.clientId,
          username: this.credentials.username,
          password: this.credentials.password,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      this.token = response.data.access_token

      // Set token expiry (typically 1 hour)
      const expiresIn = response.data.expires_in || 3600
      this.tokenExpiry = new Date(Date.now() + expiresIn * 1000)

      return this.token
    } catch (error) {
      logger.error('Error authenticating with SAP:', error)
      throw new Error(`Failed to authenticate with SAP: ${error.message}`)
    }
  }

  /**
   * Make an authenticated call to SAP API
   */
  private async callApi(endpoint: string, method: string = 'GET', data?: any): Promise<): Promise<): Promise<): Promise<): ): ): Promise<any> => {> {> { {> { {> {
    const token = await this.authenticate()

    try {
      const url = `${this.credentials?.baseUrl}${endpoint}`
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }

      // Add API key if available
      if (this.credentials?.apiKey) {
        headers['APIKey'] = this.credentials.apiKey
      }

      let response
      if (method === 'GET') {
        response = await axios.get(url, { headers })
      } else if (method === 'POST') {
        response = await axios.post(url, data, { headers })
      } else if (method === 'PUT') {
        response = await axios.put(url, data, { headers })
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`)
      }

      return response.data
    } catch (error) {
      // If token expired, try to re-authenticate once
      if (error.response && error.response.status === 401) {
        this.token = null
        this.tokenExpiry = null

        const newToken = await this.authenticate()

        const url = `${this.credentials?.baseUrl}${endpoint}`
        const headers = {
          Authorization: `Bearer ${newToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }

        // Add API key if available
        if (this.credentials?.apiKey) {
          headers['APIKey'] = this.credentials.apiKey
        }

        let retryResponse
        if (method === 'GET') {
          retryResponse = await axios.get(url, { headers })
        } else if (method === 'POST') {
          retryResponse = await axios.post(url, data, { headers })
        } else if (method === 'PUT') {
          retryResponse = await axios.put(url, data, { headers })
        }

        return retryResponse.data
      }

      logger.error(`Error calling SAP API:`, error)
      throw new Error(`Failed to call SAP API: ${error.message}`)
    }
  }

  /**
   * Fetch customers from SAP
   */
  async fetchCustomers(): Promise<): Promise<): Promise<): Promise<): ): ): Promise<ErpData[]> => {> {> { {> { {> {
    try {
      // Call SAP API to get customers (Business Partners)
      const response = await this.callApi('/API_BUSINESS_PARTNER/A_BusinessPartner')

      // Transform the response to our standard format
      return response.value.map(customer => ({
        id: customer.BusinessPartner,
        type: 'customer',
        attributes: {
          name: customer.BusinessPartnerFullName,
          category: customer.BusinessPartnerCategory,
          type: customer.BusinessPartnerType,
          group: customer.BusinessPartnerGrouping,
          address: {
            street: customer.AddressLine1,
            city: customer.CityName,
            state: customer.Region,
            zip: customer.PostalCode,
            country: customer.Country,
          },
          phone: customer.PhoneNumber,
          email: customer.EmailAddress,
          taxId: customer.TaxNumber,
        },
      }))
    } catch (error) {
      logger.error('Error fetching customers from SAP:', error)
      throw new Error(`Failed to fetch customers from SAP: ${error.message}`)
    }
  }

  /**
   * Fetch invoices from SAP
   */
  async fetchInvoices(customerId?: string): Promise<): Promise<): Promise<): Promise<): ): ): Promise<ErpData[]> => {> {> { {> { {> {
    try {
      // Build the endpoint with filter if customerId is provided
      let endpoint = '/API_BILLING_DOCUMENT/A_BillingDocument'
      if (customerId) {
        endpoint += `?$filter=BillToParty eq '${customerId}'`
      }

      // Call SAP API to get invoices
      const response = await this.callApi(endpoint)

      // Transform the response to our standard format
      return response.value.map(invoice => ({
        id: invoice.BillingDocument,
        type: 'invoice',
        attributes: {
          documentNumber: invoice.BillingDocument,
          customerId: invoice.BillToParty,
          date: invoice.BillingDocumentDate,
          dueDate: invoice.PaymentDueDate,
          amount: invoice.TotalNetAmount,
          currency: invoice.TransactionCurrency,
          status: invoice.BillingDocumentIsCancelled ? 'Cancelled' : 'Active',
          items: invoice.to_Item
            ? invoice.to_Item.results.map(item => ({
                id: item.BillingDocumentItem,
                description: item.BillingDocumentItemText,
                quantity: item.Quantity,
                unit: item.QuantityUnit,
                price: item.NetAmount,
                currency: item.TransactionCurrency,
              }))
            : [],
        },
      }))
    } catch (error) {
      logger.error('Error fetching invoices from SAP:', error)
      throw new Error(`Failed to fetch invoices from SAP: ${error.message}`)
    }
  }

  /**
   * Create an invoice in SAP
   */
  async createInvoice(invoiceData: any): Promise<): Promise<): Promise<): Promise<): ): ): Promise<ErpData> => {> {> { {> { {> {
    try {
      // Transform our data to SAP format
      const sapInvoice = {
        BillToParty: invoiceData.customerId,
        BillingDocumentDate: invoiceData.date,
        PaymentDueDate: invoiceData.dueDate,
        TransactionCurrency: invoiceData.currency || 'USD',
        to_Item: {
          results: invoiceData.items.map((item, index) => ({
            BillingDocumentItem: (index + 1).toString().padStart(6, '0'),
            BillingDocumentItemText: item.description,
            Quantity: item.quantity,
            QuantityUnit: item.unit || 'EA',
            NetAmount: item.amount,
          })),
        },
      }

      // Call SAP API to create invoice
      const response = await this.callApi(
        '/API_BILLING_DOCUMENT/A_BillingDocument',
        'POST',
        sapInvoice
      )

      // Transform the response to our standard format
      return {
        id: response.BillingDocument,
        type: 'invoice',
        attributes: {
          documentNumber: response.BillingDocument,
          customerId: response.BillToParty,
          date: response.BillingDocumentDate,
          dueDate: response.PaymentDueDate,
          amount: response.TotalNetAmount,
          currency: response.TransactionCurrency,
          status: 'Active',
        },
      }
    } catch (error) {
      logger.error('Error creating invoice in SAP:', error)
      throw new Error(`Failed to create invoice in SAP: ${error.message}`)
    }
  }

  /**
   * Sync a weigh ticket to SAP
   */
  async syncWeighTicket(ticketId: string, ticketData: any): Promise<): Promise<): Promise<): Promise<): ): ): Promise<ErpData> => {> {> { {> { {> {
    try {
      // Transform weigh ticket data to SAP format
      const sapTicket = {
        ExternalReference: ticketData.ticket_number,
        DocumentDate: ticketData.date_time,
        BusinessPartner: ticketData.companies?.id,
        GrossWeight: ticketData.gross_weight,
        TareWeight: ticketData.tare_weight,
        NetWeight: ticketData.net_weight,
        WeightUnit: ticketData.unit || 'LB',
        VehicleID: ticketData.vehicles?.id,
        DriverID: ticketData.drivers?.id,
        MaterialDescription: ticketData.cargo?.[0]?.description || 'General Cargo',
        Notes: ticketData.notes,
      }

      // Call SAP API to sync weigh ticket (custom endpoint)
      const response = await this.callApi('/API_SCALE_MASTER/WeighTicket', 'POST', sapTicket)

      // Transform the response to our standard format
      return {
        id: response.WeighTicketID,
        type: 'weighTicket',
        attributes: {
          ticketId,
          ticketNumber: response.ExternalReference,
          sapId: response.WeighTicketID,
          status: response.Status,
          documentId: response.RelatedDocument,
          syncDate: new Date().toISOString(),
        },
      }
    } catch (error) {
      logger.error('Error syncing weigh ticket to SAP:', error)
      throw new Error(`Failed to sync weigh ticket to SAP: ${error.message}`)
    }
  }
}
