/**
 * EDI Integration API Routes
 * Electronic Data Interchange for trading partners and transactions
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';
import { EDIService } from '../services/edi/EDIService';
import { TradingPartnerService } from '../services/edi/TradingPartnerService';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

const router = express.Router();
const ediService = new EDIService();
const tradingPartnerService = new TradingPartnerService();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

/**
 * GET /api/edi/trading-partners
 * Get all trading partners with filtering
 */
router.get('/trading-partners', async (req, res) => {
  try {
    const { type, status, connectionType, search, page = 1, limit = 20 } = req.query;
    
    const whereClause: any = {
      company_id: req.user.companyId
    };

    if (type) {
      whereClause.partner_type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (connectionType) {
      whereClause.connection_type = connectionType;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { edi_id: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const tradingPartners = await prisma.edi_trading_partners.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const totalCount = await prisma.edi_trading_partners.count({
      where: whereClause
    });

    res.json({
      tradingPartners,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });

  } catch (error) {
    logger.error('Error fetching trading partners:', error);
    res.status(500).json({ message: 'Error fetching trading partners' });
  }
});

/**
 * POST /api/edi/trading-partners
 * Create a new trading partner
 */
router.post('/trading-partners', async (req, res) => {
  try {
    const {
      name,
      ediId,
      partnerType,
      connectionType,
      configuration,
      supportedTransactions,
      contactInfo,
      testMode
    } = req.body;

    const tradingPartner = await tradingPartnerService.createTradingPartner({
      name,
      ediId,
      partnerType,
      connectionType,
      configuration,
      supportedTransactions,
      contactInfo,
      testMode,
      companyId: req.user.companyId,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      tradingPartner
    });

  } catch (error) {
    logger.error('Error creating trading partner:', error);
    res.status(500).json({ message: 'Error creating trading partner' });
  }
});

/**
 * GET /api/edi/trading-partners/:id
 * Get a specific trading partner by ID
 */
router.get('/trading-partners/:id', async (req, res) => {
  try {
    const partnerId = parseInt(req.params.id);

    const tradingPartner = await prisma.edi_trading_partners.findUnique({
      where: { id: partnerId },
      include: {
        edi_transactions: {
          orderBy: { created_at: 'desc' },
          take: 10 // Recent transactions
        }
      }
    });

    if (!tradingPartner || tradingPartner.company_id !== req.user.companyId) {
      return res.status(404).json({ message: 'Trading partner not found' });
    }

    res.json(tradingPartner);

  } catch (error) {
    logger.error('Error fetching trading partner:', error);
    res.status(500).json({ message: 'Error fetching trading partner' });
  }
});

/**
 * PUT /api/edi/trading-partners/:id
 * Update a trading partner
 */
router.put('/trading-partners/:id', async (req, res) => {
  try {
    const partnerId = parseInt(req.params.id);
    const updateData = req.body;

    const tradingPartner = await tradingPartnerService.updateTradingPartner(partnerId, {
      ...updateData,
      companyId: req.user.companyId,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      tradingPartner
    });

  } catch (error) {
    logger.error('Error updating trading partner:', error);
    res.status(500).json({ message: 'Error updating trading partner' });
  }
});

/**
 * POST /api/edi/trading-partners/:id/test-connection
 * Test connection to a trading partner
 */
router.post('/trading-partners/:id/test-connection', async (req, res) => {
  try {
    const partnerId = parseInt(req.params.id);

    const testResult = await tradingPartnerService.testConnection(partnerId, {
      companyId: req.user.companyId
    });

    res.json({
      success: true,
      testResult
    });

  } catch (error) {
    logger.error('Error testing trading partner connection:', error);
    res.status(500).json({ message: 'Error testing connection' });
  }
});

/**
 * GET /api/edi/transactions
 * Get EDI transactions with filtering
 */
router.get('/transactions', async (req, res) => {
  try {
    const { 
      partnerId, 
      transactionType, 
      status, 
      direction,
      startDate, 
      endDate, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const whereClause: any = {
      edi_trading_partners: {
        company_id: req.user.companyId
      }
    };

    if (partnerId) {
      whereClause.trading_partner_id = parseInt(partnerId as string);
    }

    if (transactionType) {
      whereClause.transaction_type = transactionType;
    }

    if (status) {
      whereClause.status = status;
    }

    if (direction) {
      whereClause.direction = direction;
    }

    if (startDate && endDate) {
      whereClause.created_at = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const transactions = await prisma.edi_transactions.findMany({
      where: whereClause,
      include: {
        edi_trading_partners: {
          select: {
            id: true,
            name: true,
            edi_id: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const totalCount = await prisma.edi_transactions.count({
      where: whereClause
    });

    res.json({
      transactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });

  } catch (error) {
    logger.error('Error fetching EDI transactions:', error);
    res.status(500).json({ message: 'Error fetching EDI transactions' });
  }
});

/**
 * POST /api/edi/transactions
 * Create a new EDI transaction
 */
router.post('/transactions', async (req, res) => {
  try {
    const {
      tradingPartnerId,
      transactionType,
      direction,
      controlNumber,
      documentData,
      businessData
    } = req.body;

    const transaction = await ediService.createTransaction({
      tradingPartnerId,
      transactionType,
      direction,
      controlNumber,
      documentData,
      businessData,
      companyId: req.user.companyId,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      transaction
    });

  } catch (error) {
    logger.error('Error creating EDI transaction:', error);
    res.status(500).json({ message: 'Error creating EDI transaction' });
  }
});

/**
 * GET /api/edi/transactions/:id
 * Get a specific EDI transaction by ID
 */
router.get('/transactions/:id', async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);

    const transaction = await prisma.edi_transactions.findUnique({
      where: { id: transactionId },
      include: {
        edi_trading_partners: true
      }
    });

    if (!transaction || transaction.edi_trading_partners.company_id !== req.user.companyId) {
      return res.status(404).json({ message: 'EDI transaction not found' });
    }

    res.json(transaction);

  } catch (error) {
    logger.error('Error fetching EDI transaction:', error);
    res.status(500).json({ message: 'Error fetching EDI transaction' });
  }
});

/**
 * POST /api/edi/transactions/:id/resend
 * Resend a failed EDI transaction
 */
router.post('/transactions/:id/resend', async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);

    const result = await ediService.resendTransaction(transactionId, {
      companyId: req.user.companyId,
      retriedBy: req.user.id
    });

    res.json({
      success: true,
      result
    });

  } catch (error) {
    logger.error('Error resending EDI transaction:', error);
    res.status(500).json({ message: 'Error resending EDI transaction' });
  }
});

/**
 * GET /api/edi/metrics
 * Get EDI performance metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysBack = parseInt(period as string);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const companyId = req.user.companyId;

    // Transaction counts by status
    const transactionCounts = await prisma.edi_transactions.groupBy({
      by: ['status'],
      where: {
        edi_trading_partners: { company_id: companyId },
        created_at: { gte: startDate }
      },
      _count: { id: true }
    });

    // Transaction counts by type
    const transactionTypes = await prisma.edi_transactions.groupBy({
      by: ['transaction_type'],
      where: {
        edi_trading_partners: { company_id: companyId },
        created_at: { gte: startDate }
      },
      _count: { id: true }
    });

    // Partner activity
    const partnerActivity = await prisma.edi_transactions.groupBy({
      by: ['trading_partner_id'],
      where: {
        edi_trading_partners: { company_id: companyId },
        created_at: { gte: startDate }
      },
      _count: { id: true }
    });

    // Calculate success rate
    const totalTransactions = transactionCounts.reduce((sum, item) => sum + item._count.id, 0);
    const successfulTransactions = transactionCounts
      .filter(item => ['completed', 'acknowledged'].includes(item.status))
      .reduce((sum, item) => sum + item._count.id, 0);
    
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

    const metrics = {
      totalTransactions,
      successRate: Math.round(successRate * 10) / 10,
      transactionsByStatus: transactionCounts.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      transactionsByType: transactionTypes.reduce((acc, item) => {
        acc[item.transaction_type] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      activePartners: partnerActivity.length,
      period: `${daysBack} days`
    };

    res.json(metrics);

  } catch (error) {
    logger.error('Error fetching EDI metrics:', error);
    res.status(500).json({ message: 'Error fetching EDI metrics' });
  }
});

export default router;
