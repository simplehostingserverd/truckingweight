/**
 * Compliance & Safety API Routes
 * HOS logs, DVIR reports, digital documents, and audit trails
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';
import { ComplianceService } from '../services/compliance/ComplianceService';
import { DOTService } from '../services/compliance/DOTService';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

// Type definitions for where clauses
interface HOSLogWhereClause {
  drivers: {
    company_id: number;
  };
  driver_id?: number;
  status?: string;
  log_date?: {
    gte: Date;
    lte: Date;
  };
}

interface DVIRReportWhereClause {
  drivers: {
    company_id: number;
  };
  driver_id?: number;
  vehicle_id?: number;
  status?: string;
  inspection_date?: {
    gte: Date;
    lte: Date;
  };
}

interface ComplianceDocumentWhereClause {
  company_id: number;
  document_type?: string;
  status?: string;
  expiration_date?: {
    lte: Date;
  };
}

interface ComplianceAuditTrailWhereClause {
  company_id: number;
  entity_type?: string;
  entity_id?: number;
  action?: string;
  timestamp?: {
    gte: Date;
    lte: Date;
  };
}

const router = express.Router();
const complianceService = new ComplianceService();
const _dotService = new DOTService();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

/**
 * GET /api/compliance/hos-logs
 * Get Hours of Service logs with filtering
 */
router.get('/hos-logs', async (req, res) => {
  try {
    const { driverId, startDate, endDate, status, page = 1, limit = 20 } = req.query;
    
    const whereClause: HOSLogWhereClause = {
      drivers: {
        company_id: req.user.companyId
      }
    };

    if (driverId) {
      whereClause.driver_id = parseInt(driverId as string);
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.log_date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const hosLogs = await prisma.hos_logs.findMany({
      where: whereClause,
      include: {
        drivers: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            license_number: true
          }
        },
        vehicles: {
          select: {
            id: true,
            unit_number: true,
            make: true,
            model: true
          }
        }
      },
      orderBy: { log_date: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const totalCount = await prisma.hos_logs.count({
      where: whereClause
    });

    res.json({
      hosLogs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });

  } catch (error) {
    logger.error('Error fetching HOS logs:', error);
    res.status(500).json({ message: 'Error fetching HOS logs' });
  }
});

/**
 * POST /api/compliance/hos-logs
 * Create a new HOS log entry
 */
router.post('/hos-logs', async (req, res) => {
  try {
    const {
      driverId,
      vehicleId,
      logDate,
      dutyStatus,
      startTime,
      endTime,
      location,
      odometer,
      engineHours,
      notes
    } = req.body;

    const hosLog = await complianceService.createHOSLog({
      driverId,
      vehicleId,
      logDate: new Date(logDate),
      dutyStatus,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      location,
      odometer,
      engineHours,
      notes,
      companyId: req.user.companyId,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      hosLog
    });

  } catch (error) {
    logger.error('Error creating HOS log:', error);
    res.status(500).json({ message: 'Error creating HOS log' });
  }
});

/**
 * GET /api/compliance/hos-logs/:id
 * Get a specific HOS log by ID
 */
router.get('/hos-logs/:id', async (req, res) => {
  try {
    const logId = parseInt(req.params.id);

    const hosLog = await prisma.hos_logs.findUnique({
      where: { id: logId },
      include: {
        drivers: true,
        vehicles: true
      }
    });

    if (!hosLog || hosLog.drivers.company_id !== req.user.companyId) {
      return res.status(404).json({ message: 'HOS log not found' });
    }

    res.json(hosLog);

  } catch (error) {
    logger.error('Error fetching HOS log:', error);
    res.status(500).json({ message: 'Error fetching HOS log' });
  }
});

/**
 * PUT /api/compliance/hos-logs/:id
 * Update an HOS log
 */
router.put('/hos-logs/:id', async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    const updateData = req.body;

    const hosLog = await complianceService.updateHOSLog(logId, {
      ...updateData,
      companyId: req.user.companyId,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      hosLog
    });

  } catch (error) {
    logger.error('Error updating HOS log:', error);
    res.status(500).json({ message: 'Error updating HOS log' });
  }
});

/**
 * GET /api/compliance/dvir-reports
 * Get Driver Vehicle Inspection Reports
 */
router.get('/dvir-reports', async (req, res) => {
  try {
    const { driverId, vehicleId, startDate, endDate, status, page = 1, limit = 20 } = req.query;
    
    const whereClause: DVIRReportWhereClause = {
      drivers: {
        company_id: req.user.companyId
      }
    };

    if (driverId) {
      whereClause.driver_id = parseInt(driverId as string);
    }

    if (vehicleId) {
      whereClause.vehicle_id = parseInt(vehicleId as string);
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.inspection_date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const dvirReports = await prisma.dvir_reports.findMany({
      where: whereClause,
      include: {
        drivers: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        },
        vehicles: {
          select: {
            id: true,
            unit_number: true,
            make: true,
            model: true
          }
        }
      },
      orderBy: { inspection_date: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const totalCount = await prisma.dvir_reports.count({
      where: whereClause
    });

    res.json({
      dvirReports,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });

  } catch (error) {
    logger.error('Error fetching DVIR reports:', error);
    res.status(500).json({ message: 'Error fetching DVIR reports' });
  }
});

/**
 * POST /api/compliance/dvir-reports
 * Create a new DVIR report
 */
router.post('/dvir-reports', async (req, res) => {
  try {
    const {
      driverId,
      vehicleId,
      inspectionDate,
      inspectionType,
      odometer,
      defectsFound,
      defectsList,
      satisfactoryCondition,
      driverSignature,
      mechanicSignature,
      notes
    } = req.body;

    const dvirReport = await complianceService.createDVIRReport({
      driverId,
      vehicleId,
      inspectionDate: new Date(inspectionDate),
      inspectionType,
      odometer,
      defectsFound,
      defectsList,
      satisfactoryCondition,
      driverSignature,
      mechanicSignature,
      notes,
      companyId: req.user.companyId,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      dvirReport
    });

  } catch (error) {
    logger.error('Error creating DVIR report:', error);
    res.status(500).json({ message: 'Error creating DVIR report' });
  }
});

/**
 * GET /api/compliance/documents
 * Get compliance documents
 */
router.get('/documents', async (req, res) => {
  try {
    const { type, status, expirationDate, page = 1, limit = 20 } = req.query;
    
    const whereClause: ComplianceDocumentWhereClause = {
      company_id: req.user.companyId
    };

    if (type) {
      whereClause.document_type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (expirationDate) {
      whereClause.expiration_date = {
        lte: new Date(expirationDate as string)
      };
    }

    const documents = await prisma.compliance_documents.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const totalCount = await prisma.compliance_documents.count({
      where: whereClause
    });

    res.json({
      documents,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });

  } catch (error) {
    logger.error('Error fetching compliance documents:', error);
    res.status(500).json({ message: 'Error fetching compliance documents' });
  }
});

/**
 * POST /api/compliance/documents
 * Upload a new compliance document
 */
router.post('/documents', async (req, res) => {
  try {
    const {
      documentType,
      title,
      description,
      fileUrl,
      expirationDate,
      entityType,
      entityId,
      tags
    } = req.body;

    const document = await complianceService.uploadDocument({
      documentType,
      title,
      description,
      fileUrl,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      entityType,
      entityId,
      tags,
      companyId: req.user.companyId,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      document
    });

  } catch (error) {
    logger.error('Error uploading compliance document:', error);
    res.status(500).json({ message: 'Error uploading compliance document' });
  }
});

/**
 * GET /api/compliance/audit-trail
 * Get compliance audit trail
 */
router.get('/audit-trail', async (req, res) => {
  try {
    const { entityType, entityId, action, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const whereClause: ComplianceAuditTrailWhereClause = {
      company_id: req.user.companyId
    };

    if (entityType) {
      whereClause.entity_type = entityType;
    }

    if (entityId) {
      whereClause.entity_id = parseInt(entityId as string);
    }

    if (action) {
      whereClause.action = action;
    }

    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const auditTrail = await prisma.compliance_audit_trail.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const totalCount = await prisma.compliance_audit_trail.count({
      where: whereClause
    });

    res.json({
      auditTrail,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });

  } catch (error) {
    logger.error('Error fetching audit trail:', error);
    res.status(500).json({ message: 'Error fetching audit trail' });
  }
});

export default router;
