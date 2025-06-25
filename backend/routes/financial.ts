/**
 * Financial Management API Routes
 * Automated billing, invoicing, and financial analytics
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';
import { BillingService } from '../services/financial/BillingService';
import { MLService } from '../services/ai/MLService';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';
import { FinancialService } from '../services/financial/FinancialService';

// Type definitions for financial queries
interface InvoiceWhereClause {
  company_id: number;
  status?: string;
  customer_id?: number;
  invoice_date?: {
    gte?: Date;
    lte?: Date;
  };
}

interface FuelTransactionWhereClause {
  company_id: number;
  driver_id?: number;
  vehicle_id?: number;
  transaction_date?: {
    gte?: Date;
    lte?: Date;
  };
}

const router = express.Router();
const billingService = new BillingService();
const mlService = new MLService();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

/**
 * GET /api/financial/invoices
 * Get all invoices with filtering and pagination
 */
router.get('/invoices', async (req, res) => {
  try {
    const { 
      status, 
      customerId, 
      dateFrom, 
      dateTo, 
      page = '1', 
      limit = '50' 
    } = req.query;

    const whereClause: InvoiceWhereClause = {
      company_id: req.user.companyId
    };

    if (status) {
      whereClause.status = status;
    }

    if (customerId) {
      whereClause.customer_id = parseInt(customerId as string);
    }

    if (dateFrom || dateTo) {
      whereClause.invoice_date = {};
      if (dateFrom) whereClause.invoice_date.gte = new Date(dateFrom as string);
      if (dateTo) whereClause.invoice_date.lte = new Date(dateTo as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [invoices, totalCount] = await Promise.all([
      prisma.invoices.findMany({
        where: whereClause,
        include: {
          customers: true,
          loads: true,
          invoice_line_items: true,
          payments: true
        },
        orderBy: { invoice_date: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.invoices.count({ where: whereClause })
    ]);

    const transformedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      customerName: invoice.customers?.name,
      loadNumber: invoice.loads?.load_number,
      invoiceDate: invoice.invoice_date,
      dueDate: invoice.due_date,
      subtotal: invoice.subtotal,
      taxAmount: invoice.tax_amount,
      totalAmount: invoice.total_amount,
      paidAmount: invoice.paid_amount,
      balanceDue: invoice.balance_due,
      status: invoice.status,
      paymentTerms: invoice.payment_terms,
      ediSent: invoice.edi_sent,
      lineItems: invoice.invoice_line_items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        lineType: item.line_type
      })),
      payments: invoice.payments.map(payment => ({
        id: payment.id,
        paymentDate: payment.payment_date,
        amount: payment.amount,
        paymentMethod: payment.payment_method,
        referenceNumber: payment.reference_number
      }))
    }));

    res.json({
      invoices: transformedInvoices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      }
    });

  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
});

/**
 * POST /api/financial/invoice
 * Create a new invoice for a load
 */
router.post('/invoice', async (req, res) => {
  try {
    const { loadId, customerId, lineItems, autoCalculate = true } = req.body;

    const invoice = await billingService.createInvoice({
      loadId,
      customerId,
      companyId: req.user.companyId,
      lineItems,
      autoCalculate
    });

    res.status(201).json({
      success: true,
      invoice
    });

  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Error creating invoice' });
  }
});

/**
 * POST /api/financial/invoice/:id/payment
 * Process a payment for an invoice
 */
router.post('/invoice/:id/payment', async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const { amount, paymentMethod, referenceNumber } = req.body;

    await billingService.processPayment(invoiceId, amount, paymentMethod, referenceNumber);

    res.json({
      success: true,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    logger.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
});

/**
 * GET /api/financial/aging-report
 * Generate accounts receivable aging report
 */
router.get('/aging-report', async (req, res) => {
  try {
    const agingReport = await billingService.generateAgingReport(req.user.companyId);
    res.json(agingReport);

  } catch (error) {
    logger.error('Error generating aging report:', error);
    res.status(500).json({ message: 'Error generating aging report' });
  }
});

/**
 * GET /api/financial/metrics
 * Get financial performance metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const companyId = req.user.companyId;
    const daysBack = parseInt(period as string);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // Get revenue metrics
    const revenueData = await prisma.invoices.aggregate({
      where: {
        company_id: companyId,
        invoice_date: { gte: startDate },
        status: { not: 'cancelled' }
      },
      _sum: {
        total_amount: true,
        paid_amount: true
      },
      _count: { id: true }
    });

    // Get outstanding receivables
    const outstandingReceivables = await prisma.invoices.aggregate({
      where: {
        company_id: companyId,
        balance_due: { gt: 0 },
        status: { not: 'cancelled' }
      },
      _sum: { balance_due: true },
      _count: { id: true }
    });

    // Get payment collection rate
    const totalInvoiced = revenueData._sum.total_amount || 0;
    const totalCollected = revenueData._sum.paid_amount || 0;
    const collectionRate = totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0;

    // Get average days to payment
    const paidInvoices = await prisma.invoices.findMany({
      where: {
        company_id: companyId,
        status: 'paid',
        invoice_date: { gte: startDate }
      },
      include: {
        payments: {
          orderBy: { payment_date: 'desc' },
          take: 1
        }
      }
    });

    const avgDaysToPayment = paidInvoices.length > 0
      ? paidInvoices.reduce((sum, invoice) => {
          const payment = invoice.payments[0];
          if (payment) {
            const days = Math.floor(
              (payment.payment_date.getTime() - invoice.invoice_date.getTime()) / 
              (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }
          return sum;
        }, 0) / paidInvoices.length
      : 0;

    // Get fuel costs
    const fuelCosts = await prisma.fuel_transactions.aggregate({
      where: {
        company_id: companyId,
        transaction_date: { gte: startDate }
      },
      _sum: { total_amount: true },
      _count: { id: true }
    });

    // Get maintenance costs
    const maintenanceCosts = await prisma.maintenance_work_orders.aggregate({
      where: {
        company_id: companyId,
        completed_at: { gte: startDate },
        status: 'completed'
      },
      _sum: { total_cost: true },
      _count: { id: true }
    });

    const metrics = {
      revenue: {
        totalInvoiced: totalInvoiced,
        totalCollected: totalCollected,
        collectionRate: collectionRate,
        invoiceCount: revenueData._count.id
      },
      receivables: {
        outstanding: outstandingReceivables._sum.balance_due || 0,
        invoiceCount: outstandingReceivables._count.id,
        avgDaysToPayment: Math.round(avgDaysToPayment)
      },
      expenses: {
        fuel: fuelCosts._sum.total_amount || 0,
        maintenance: maintenanceCosts._sum.total_cost || 0,
        total: (fuelCosts._sum.total_amount || 0) + (maintenanceCosts._sum.total_cost || 0)
      },
      profitability: {
        grossRevenue: totalInvoiced,
        totalExpenses: (fuelCosts._sum.total_amount || 0) + (maintenanceCosts._sum.total_cost || 0),
        netProfit: totalInvoiced - ((fuelCosts._sum.total_amount || 0) + (maintenanceCosts._sum.total_cost || 0)),
        profitMargin: totalInvoiced > 0 
          ? ((totalInvoiced - ((fuelCosts._sum.total_amount || 0) + (maintenanceCosts._sum.total_cost || 0))) / totalInvoiced) * 100 
          : 0
      }
    };

    res.json(metrics);

  } catch (error) {
    logger.error('Error fetching financial metrics:', error);
    res.status(500).json({ message: 'Error fetching financial metrics' });
  }
});

/**
 * GET /api/financial/revenue-trends
 * Get revenue trends over time
 */
router.get('/revenue-trends', async (req, res) => {
  try {
    const { period = 'monthly', months = '12' } = req.query;
    const companyId = req.user.companyId;
    const monthsBack = parseInt(months as string);

    let groupBy: string;
    let dateFormat: string;

    switch (period) {
      case 'daily':
        groupBy = 'DATE(invoice_date)';
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupBy = 'YEARWEEK(invoice_date)';
        dateFormat = '%Y-%u';
        break;
      case 'monthly':
      default:
        groupBy = 'DATE_FORMAT(invoice_date, "%Y-%m")';
        dateFormat = '%Y-%m';
        break;
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const revenueData = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(invoice_date, ${dateFormat}) as period,
        SUM(total_amount) as total_revenue,
        SUM(paid_amount) as collected_revenue,
        COUNT(*) as invoice_count,
        AVG(total_amount) as avg_invoice_amount
      FROM invoices 
      WHERE company_id = ${companyId} 
        AND invoice_date >= ${startDate}
        AND status != 'cancelled'
      GROUP BY ${groupBy}
      ORDER BY period
    `;

    res.json(revenueData);

  } catch (error) {
    logger.error('Error fetching revenue trends:', error);
    res.status(500).json({ message: 'Error fetching revenue trends' });
  }
});

/**
 * POST /api/financial/dynamic-pricing
 * Get AI-powered dynamic pricing for a load
 */
router.post('/dynamic-pricing', async (req, res) => {
  try {
    const {
      origin,
      destination,
      loadType,
      weight,
      pickupDate,
      equipmentType
    } = req.body;

    const pricingResult = await mlService.calculateDynamicPricing({
      origin,
      destination,
      loadType,
      weight,
      pickupDate: new Date(pickupDate),
      equipmentType
    });

    res.json(pricingResult);

  } catch (error) {
    logger.error('Error calculating dynamic pricing:', error);
    res.status(500).json({ message: 'Error calculating dynamic pricing' });
  }
});

/**
 * GET /api/financial/fuel-transactions
 * Get fuel transaction history
 */
router.get('/fuel-transactions', async (req, res) => {
  try {
    const { 
      driverId, 
      vehicleId, 
      dateFrom, 
      dateTo, 
      page = '1', 
      limit = '50' 
    } = req.query;

    const whereClause: FuelTransactionWhereClause = {
      company_id: req.user.companyId
    };

    if (driverId) {
      whereClause.driver_id = parseInt(driverId as string);
    }

    if (vehicleId) {
      whereClause.vehicle_id = parseInt(vehicleId as string);
    }

    if (dateFrom || dateTo) {
      whereClause.transaction_date = {};
      if (dateFrom) whereClause.transaction_date.gte = new Date(dateFrom as string);
      if (dateTo) whereClause.transaction_date.lte = new Date(dateTo as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, totalCount] = await Promise.all([
      prisma.fuel_transactions.findMany({
        where: whereClause,
        include: {
          drivers: true,
          vehicles: true,
          fuel_cards: true
        },
        orderBy: { transaction_date: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.fuel_transactions.count({ where: whereClause })
    ]);

    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      transactionDate: transaction.transaction_date,
      driverName: transaction.drivers?.name,
      vehicleName: transaction.vehicles?.name,
      locationName: transaction.location_name,
      locationAddress: transaction.location_address,
      fuelType: transaction.fuel_type,
      gallons: transaction.gallons,
      pricePerGallon: transaction.price_per_gallon,
      totalAmount: transaction.total_amount,
      odometerReading: transaction.odometer_reading,
      cardNumber: transaction.fuel_cards?.card_number
    }));

    res.json({
      transactions: transformedTransactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      }
    });

  } catch (error) {
    logger.error('Error fetching fuel transactions:', error);
    res.status(500).json({ message: 'Error fetching fuel transactions' });
  }
});

/**
 * GET /api/financial/expense-analysis
 * Get detailed expense analysis
 */
router.get('/expense-analysis', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const companyId = req.user.companyId;
    const daysBack = parseInt(period as string);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // Fuel expenses by vehicle
    const fuelByVehicle = await prisma.$queryRaw`
      SELECT 
        v.name as vehicle_name,
        SUM(ft.total_amount) as total_fuel_cost,
        SUM(ft.gallons) as total_gallons,
        AVG(ft.price_per_gallon) as avg_price_per_gallon,
        COUNT(*) as transaction_count
      FROM fuel_transactions ft
      JOIN vehicles v ON ft.vehicle_id = v.id
      WHERE ft.company_id = ${companyId} 
        AND ft.transaction_date >= ${startDate}
      GROUP BY v.id, v.name
      ORDER BY total_fuel_cost DESC
    `;

    // Maintenance expenses by category
    const maintenanceByCategory = await prisma.$queryRaw`
      SELECT 
        mp.category,
        SUM(wop.total_cost) as total_cost,
        COUNT(DISTINCT wo.id) as work_order_count,
        AVG(wop.total_cost) as avg_cost_per_order
      FROM maintenance_work_orders wo
      JOIN work_order_parts wop ON wo.id = wop.work_order_id
      JOIN maintenance_parts mp ON wop.part_id = mp.id
      WHERE wo.company_id = ${companyId} 
        AND wo.completed_at >= ${startDate}
        AND wo.status = 'completed'
      GROUP BY mp.category
      ORDER BY total_cost DESC
    `;

    // Monthly expense trends
    const monthlyExpenses = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(date_col, '%Y-%m') as month,
        expense_type,
        SUM(amount) as total_amount
      FROM (
        SELECT transaction_date as date_col, 'fuel' as expense_type, total_amount as amount
        FROM fuel_transactions 
        WHERE company_id = ${companyId} AND transaction_date >= ${startDate}
        
        UNION ALL
        
        SELECT completed_at as date_col, 'maintenance' as expense_type, total_cost as amount
        FROM maintenance_work_orders 
        WHERE company_id = ${companyId} AND completed_at >= ${startDate} AND status = 'completed'
      ) expenses
      GROUP BY DATE_FORMAT(date_col, '%Y-%m'), expense_type
      ORDER BY month, expense_type
    `;

    res.json({
      fuelByVehicle,
      maintenanceByCategory,
      monthlyExpenses,
      period: `${daysBack} days`
    });

  } catch (error) {
    logger.error('Error fetching expense analysis:', error);
    res.status(500).json({ message: 'Error fetching expense analysis' });
  }
});

export default router;
