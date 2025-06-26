/**
 * Advanced Billing Service
 * Automated invoicing with EDI 210 support, fuel surcharges, and accessorial billing
 */

import prisma from '../../config/prisma';
import { logger } from '../../utils/logger';
import { EDIService } from './EDIService';

export interface InvoiceRequest {
  loadId: number;
  customerId: number;
  companyId: number;
  lineItems?: InvoiceLineItem[];
  autoCalculate?: boolean;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineType: 'freight' | 'fuel_surcharge' | 'accessorial' | 'detention' | 'layover' | 'lumper';
  loadStopId?: number;
}

export interface FuelSurchargeCalculation {
  baseRate: number;
  currentFuelPrice: number;
  baseFuelPrice: number;
  surchargePercentage: number;
  surchargeAmount: number;
}

export interface LoadData {
  id: number;
  total_rate?: number;
  pickup_location?: string;
  delivery_location?: string;
  temperature_min?: number;
  temperature_max?: number;
  load_stops: Array<{
    id: number;
    arrival_time?: Date;
    departure_time?: Date;
    stop_number: number;
  }>;
  routes?: any;
  customers?: any;
}

export interface CustomerData {
  id: number;
  name: string;
  billing_address?: string;
  tax_id?: string;
}

export interface InvoiceData {
  id: number;
  invoice_number: string;
  total_amount: number;
  balance_due: number;
  due_date: Date;
  created_at: Date;
  customer_id: number;
  company_id: number;
}

export interface AgingReportData {
  current: number;
  thirtyDays: number;
  sixtyDays: number;
  ninetyDays: number;
  overNinety: number;
  totalOutstanding: number;
  customerBreakdown: Array<{
    customerId: number;
    customerName: string;
    current: number;
    thirtyDays: number;
    sixtyDays: number;
    ninetyDays: number;
    overNinety: number;
    total: number;
  }>;
}

export class BillingService {
  private ediService: EDIService;

  constructor() {
    this.ediService = new EDIService();
  }

  /**
   * Create an automated invoice for a completed load
   */
  async createInvoice(request: InvoiceRequest): Promise<InvoiceData> {
    try {
      logger.info(`Creating invoice for load ${request.loadId}`);

      // Get load details
      const load = await prisma.loads.findUnique({
        where: { id: request.loadId },
        include: {
          load_stops: {
            orderBy: { stop_number: 'asc' }
          },
          routes: true,
          customers: true
        }
      });

      if (!load) {
        throw new Error('Load not found');
      }

      // Get customer details
      const customer = await prisma.customers.findUnique({
        where: { id: request.customerId }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(request.companyId);

      // Calculate line items
      const lineItems = request.autoCalculate 
        ? await this.calculateLineItems(load)
        : request.lineItems || [];

      // Calculate totals
      const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = await this.calculateTax(subtotal, customer);
      const totalAmount = subtotal + taxAmount;

      // Create invoice
      const invoice = await prisma.invoices.create({
        data: {
          invoice_number: invoiceNumber,
          customer_id: request.customerId,
          load_id: request.loadId,
          invoice_date: new Date(),
          due_date: new Date(Date.now() + (customer.payment_terms || 30) * 24 * 60 * 60 * 1000),
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          balance_due: totalAmount,
          status: 'draft',
          payment_terms: customer.payment_terms || 30,
          company_id: request.companyId
        }
      });

      // Create line items
      for (const item of lineItems) {
        await prisma.invoice_line_items.create({
          data: {
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.quantity * item.unitPrice,
            line_type: item.lineType,
            load_stop_id: item.loadStopId
          }
        });
      }

      // Send EDI 210 if customer supports it
      if (await this.customerSupportsEDI(request.customerId)) {
        await this.sendEDI210Invoice(invoice.id);
      }

      logger.info(`Invoice ${invoiceNumber} created successfully`);
      return invoice;

    } catch (error) {
      logger.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Calculate line items automatically based on load details
   */
  private async calculateLineItems(load: LoadData): Promise<InvoiceLineItem[]> {
    const lineItems: InvoiceLineItem[] = [];

    // Base freight charge
    if (load.total_rate) {
      lineItems.push({
        description: `Freight - ${load.pickup_location} to ${load.delivery_location}`,
        quantity: 1,
        unitPrice: load.total_rate,
        lineType: 'freight'
      });
    }

    // Fuel surcharge
    const fuelSurcharge = await this.calculateFuelSurcharge(load);
    if (fuelSurcharge.surchargeAmount > 0) {
      lineItems.push({
        description: `Fuel Surcharge (${fuelSurcharge.surchargePercentage.toFixed(1)}%)`,
        quantity: 1,
        unitPrice: fuelSurcharge.surchargeAmount,
        lineType: 'fuel_surcharge'
      });
    }

    // Accessorial charges
    const accessorials = await this.calculateAccessorialCharges(load);
    lineItems.push(...accessorials);

    // Detention charges
    const detentionCharges = await this.calculateDetentionCharges(load);
    lineItems.push(...detentionCharges);

    return lineItems;
  }

  /**
   * Calculate fuel surcharge based on current fuel prices
   */
  private async calculateFuelSurcharge(load: LoadData): Promise<FuelSurchargeCalculation> {
    const baseRate = load.total_rate || 0;
    const baseFuelPrice = 2.50; // Base fuel price for surcharge calculation
    
    // Get current fuel price (would integrate with fuel price API)
    const currentFuelPrice = await this.getCurrentFuelPrice();
    
    // Calculate surcharge percentage (typically 1% per $0.10 over base)
    const priceDifference = Math.max(0, currentFuelPrice - baseFuelPrice);
    const surchargePercentage = (priceDifference / 0.10) * 1.0; // 1% per $0.10
    
    const surchargeAmount = (baseRate * surchargePercentage) / 100;

    return {
      baseRate,
      currentFuelPrice,
      baseFuelPrice,
      surchargePercentage,
      surchargeAmount
    };
  }

  /**
   * Calculate accessorial charges
   */
  private async calculateAccessorialCharges(load: LoadData): Promise<InvoiceLineItem[]> {
    const accessorials: InvoiceLineItem[] = [];

    // Check for special equipment requirements
    if (load.temperature_min || load.temperature_max) {
      accessorials.push({
        description: 'Refrigerated Service',
        quantity: 1,
        unitPrice: 150, // Base reefer charge
        lineType: 'accessorial'
      });
    }

    // Check for hazmat
    if (load.hazmat_class) {
      accessorials.push({
        description: `Hazmat Service - Class ${load.hazmat_class}`,
        quantity: 1,
        unitPrice: 100,
        lineType: 'accessorial'
      });
    }

    // Check for oversized loads
    if (load.weight && load.weight > 80000) {
      accessorials.push({
        description: 'Overweight Permit',
        quantity: 1,
        unitPrice: 75,
        lineType: 'accessorial'
      });
    }

    return accessorials;
  }

  /**
   * Calculate detention charges based on stop times
   */
  private async calculateDetentionCharges(load: LoadData): Promise<InvoiceLineItem[]> {
    const detentionCharges: InvoiceLineItem[] = [];
    const detentionRate = 50; // $50 per hour
    const freeTime = 2; // 2 hours free time

    for (const stop of load.load_stops) {
      if (stop.arrival_time && stop.departure_time) {
        const arrivalTime = new Date(stop.arrival_time);
        const departureTime = new Date(stop.departure_time);
        const totalHours = (departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60 * 60);
        const detentionHours = Math.max(0, totalHours - freeTime);

        if (detentionHours > 0) {
          detentionCharges.push({
            description: `Detention - ${stop.facility_name || stop.city}`,
            quantity: detentionHours,
            unitPrice: detentionRate,
            lineType: 'detention',
            loadStopId: stop.id
          });
        }
      }
    }

    return detentionCharges;
  }

  /**
   * Calculate tax amount
   */
  private async calculateTax(_subtotal: number, _customer: CustomerData): Promise<number> {
    // Tax calculation would be based on customer location and tax rules
    // For now, return 0 (many freight services are tax-exempt)
    return 0;
  }

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(companyId: number): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get next sequence number for this company/month
    const lastInvoice = await prisma.invoices.findFirst({
      where: {
        company_id: companyId,
        invoice_number: {
          startsWith: `INV-${year}${month}`
        }
      },
      orderBy: { invoice_number: 'desc' }
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoice_number.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Get current fuel price
   */
  private async getCurrentFuelPrice(): Promise<number> {
    // This would integrate with fuel price APIs (EIA, OPIS, etc.)
    // For now, return a mock price
    return 3.45;
  }

  /**
   * Check if customer supports EDI
   */
  private async customerSupportsEDI(customerId: number): Promise<boolean> {
    const _tradingPartner = await prisma.edi_trading_partners.findFirst({
      where: {
        partner_name: {
          // This would match customer name to trading partner
          // For now, return false
        }
      }
    });

    return false; // Simplified for now
  }

  /**
   * Send EDI 210 invoice
   */
  private async sendEDI210Invoice(invoiceId: number): Promise<void> {
    try {
      const invoice = await prisma.invoices.findUnique({
        where: { id: invoiceId },
        include: {
          invoice_line_items: true,
          customers: true,
          loads: {
            include: {
              load_stops: true
            }
          }
        }
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Generate EDI 210 document
      const ediDocument = await this.ediService.generateEDI210(invoice);

      // Send to trading partner
      await this.ediService.sendEDIDocument(ediDocument, invoice.customers.name);

      // Update invoice status
      await prisma.invoices.update({
        where: { id: invoiceId },
        data: {
          edi_sent: true,
          edi_sent_at: new Date(),
          status: 'sent'
        }
      });

      logger.info(`EDI 210 sent for invoice ${invoice.invoice_number}`);

    } catch (error) {
      logger.error('Error sending EDI 210:', error);
      throw error;
    }
  }

  /**
   * Process payment
   */
  async processPayment(invoiceId: number, amount: number, paymentMethod: string, referenceNumber?: string): Promise<void> {
    try {
      const invoice = await prisma.invoices.findUnique({
        where: { id: invoiceId }
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Create payment record
      await prisma.payments.create({
        data: {
          invoice_id: invoiceId,
          payment_date: new Date(),
          amount,
          payment_method: paymentMethod,
          reference_number: referenceNumber,
          company_id: invoice.company_id
        }
      });

      // Update invoice
      const newPaidAmount = invoice.paid_amount + amount;
      const newBalanceDue = invoice.total_amount - newPaidAmount;
      const newStatus = newBalanceDue <= 0 ? 'paid' : 'partial';

      await prisma.invoices.update({
        where: { id: invoiceId },
        data: {
          paid_amount: newPaidAmount,
          balance_due: newBalanceDue,
          status: newStatus
        }
      });

      logger.info(`Payment of $${amount} processed for invoice ${invoice.invoice_number}`);

    } catch (error) {
      logger.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Generate aging report
   */
  async generateAgingReport(companyId: number): Promise<AgingReportData> {
    // TODO: Implement aging report when invoices model is added to schema
    logger.warn('generateAgingReport called but invoices model not available in schema');
    
    return {
      current: 0,
      thirtyDays: 0,
      sixtyDays: 0,
      ninetyDays: 0,
      overNinety: 0,
      totalOutstanding: 0,
      customerBreakdown: []
    };
    
    /* TODO: Uncomment when invoices model is added to schema
    const today = new Date();
    const invoices = await prisma.invoices.findMany({
      where: {
        company_id: companyId,
        balance_due: {
          gt: 0
        }
      },
      include: {
        customers: true
      }
    });
    
    // Process invoices and calculate aging...
    */
  }
}
