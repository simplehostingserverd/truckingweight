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

/**
 * Scale Controller
 *
 * This controller handles API endpoints for scale management and weight capture
 */

import { Request, Response } from 'express';
import prisma, { setCompanyContext } from '../config/prisma';
import { generateScaleQRCode, validateScaleQRCode } from '../services/qrCodeService';
import {
  configureIoTHardware,
  getAvailableHardwareOptions,
  getScaleReading,
  // processIoTSensorData, // Unused import
  processCameraScannedTicket,
} from '../services/scaleIntegration';
import { logger } from '../utils/logger';
// Unused imports commented out
// import {
//   generateWeighTicket,
//   getWeighTicket,
//   updateWeighTicket,
// } from '../services/weighTicketService';

// Define the authenticated request type
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    companyId?: number;
    isAdmin?: boolean;
  };
}

// Type for handling errors in catch blocks
interface ErrorWithMessage {
  message: string;
}

// Type guard to check if error has message property
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

// Helper function to get error message
function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) return error.message;
  return String(error);
}

/**
 * @desc    Get all scales for a company
 * @route   GET /api/scales
 * @access  Private
 */
export const getScales = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;

    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Set company context for Prisma queries
    setCompanyContext(companyId, isAdmin);

    // Define filter based on user role
    const filter =
      isAdmin && req.query.companyId
        ? { company_id: parseInt(req.query.companyId as string) }
        : isAdmin
          ? {}
          : { company_id: companyId };

    const scales = await prisma.scales.findMany({
      where: filter,
      orderBy: { name: 'asc' },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(scales);
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error getting scales: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Get a scale by ID
 * @route   GET /api/scales/:id
 * @access  Private
 */
export const getScaleById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;
    const scaleId = parseInt(req.params.id);

    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Set company context for Prisma queries
    setCompanyContext(companyId, isAdmin);

    const scale = await prisma.scales.findUnique({
      where: { id: scaleId },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
          },
        },
        scale_calibrations: {
          orderBy: { created_at: 'desc' },
          take: 1,
        }
      },
    });

    if (!scale) {
      return res.status(404).json({ message: 'Scale not found' });
    }

    res.json(scale);
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error getting scale: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Create a new scale
 * @route   POST /api/scales
 * @access  Private
 */
export const createScale = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;

    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Set company context for Prisma queries
    setCompanyContext(companyId, isAdmin);

    // Validate required fields
    const { name, scale_type, location } = req.body;

    if (!name || !scale_type) {
      return res.status(400).json({ message: 'Name and scale type are required' });
    }

    // Create the scale
    const scale = await prisma.scales.create({
      data: {
        name,
        scale_type,
        location,
        manufacturer: req.body.manufacturer,
        model: req.body.model,
        serial_number: req.body.serial_number,
        max_capacity: req.body.max_capacity ? parseInt(req.body.max_capacity) : 0,
        precision: req.body.precision ? parseFloat(req.body.precision) : 0.01,
        last_calibration_date: req.body.calibration_date
          ? new Date(req.body.calibration_date)
          : undefined,
        next_calibration_date: req.body.next_calibration_date
          ? new Date(req.body.next_calibration_date)
          : undefined,
        ip_address: req.body.ip_address,
        port: req.body.port ? parseInt(req.body.port) : undefined,
        protocol: req.body.protocol,
        status: req.body.status || 'Active',
        company_id: isAdmin && req.body.company_id ? parseInt(req.body.company_id) : companyId,
      },
    });

    // Generate QR code for the scale
    const qrCodeResult = await generateScaleQRCode(
      scale.id,
      scale.company_id || companyId,
      isAdmin
    );

    res.status(201).json({
      ...scale,
      qrCode: qrCodeResult.success ? qrCodeResult.qrCodeDataUrl : undefined,
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error creating scale: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Update a scale
 * @route   PUT /api/scales/:id
 * @access  Private
 */
export const updateScale = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;
    const scaleId = parseInt(req.params.id);

    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Set company context for Prisma queries
    setCompanyContext(companyId, isAdmin);

    // Check if scale exists
    const existingScale = await prisma.scales.findUnique({
      where: { id: scaleId },
    });

    if (!existingScale) {
      return res.status(404).json({ message: 'Scale not found' });
    }

    // Update the scale
    const scale = await prisma.scales.update({
      where: { id: scaleId },
      data: {
        name: req.body.name,
        scale_type: req.body.scale_type,
        location: req.body.location,
        manufacturer: req.body.manufacturer,
        model: req.body.model,
        serial_number: req.body.serial_number,
        max_capacity: req.body.max_capacity ? parseInt(req.body.max_capacity) : undefined,
        precision: req.body.precision ? parseFloat(req.body.precision) : undefined,
        last_calibration_date: req.body.calibration_date
          ? new Date(req.body.calibration_date)
          : undefined,
        next_calibration_date: req.body.next_calibration_date
          ? new Date(req.body.next_calibration_date)
          : undefined,
        ip_address: req.body.ip_address,
        port: req.body.port ? parseInt(req.body.port) : undefined,
        protocol: req.body.protocol,
        status: req.body.status,
        company_id: isAdmin && req.body.company_id ? parseInt(req.body.company_id) : undefined,
        updated_at: new Date(),
      },
    });

    res.json(scale);
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error updating scale: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Delete a scale
 * @route   DELETE /api/scales/:id
 * @access  Private
 */
export const deleteScale = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;
    const scaleId = parseInt(req.params.id);

    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Set company context for Prisma queries
    setCompanyContext(companyId, isAdmin);

    // Check if scale exists
    const existingScale = await prisma.scales.findUnique({
      where: { id: scaleId },
    });

    if (!existingScale) {
      return res.status(404).json({ message: 'Scale not found' });
    }

    // Delete the scale
    await prisma.scales.delete({
      where: { id: scaleId },
    });

    res.json({ message: 'Scale deleted successfully' });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error deleting scale: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Get a scale reading
 * @route   GET /api/scales/:id/reading
 * @access  Private
 */
export const getReading = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;
    const scaleId = parseInt(req.params.id);
    const readingType = (req.query.type as string) || 'gross';

    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Get scale reading
    const result = await getScaleReading(scaleId, readingType, companyId, isAdmin);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ reading: result.reading, rawData: result.rawData });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error getting scale reading: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Generate a QR code for a scale
 * @route   GET /api/scales/:id/qrcode
 * @access  Private
 */
export const getScaleQRCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;
    const scaleId = parseInt(req.params.id);

    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Generate QR code
    const result = await generateScaleQRCode(scaleId, companyId, isAdmin);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ qrCode: result.qrCodeDataUrl, uuid: result.qrCodeUuid });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error generating scale QR code: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Validate a QR code for a scale
 * @route   POST /api/scales/validate-qrcode
 * @access  Private
 */
export const validateQRCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      return res.status(400).json({ message: 'QR code data is required' });
    }

    // Validate QR code
    const result = await validateScaleQRCode(qrCodeData, companyId);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ valid: true, scale: result.scale });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error validating scale QR code: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Process a camera-scanned weight ticket
 * @route   POST /api/scales/camera-ticket
 * @access  Private
 */
export const processCameraTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ticketImageUrl } = req.body;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    if (!ticketImageUrl) {
      return res.status(400).json({ message: 'Ticket image URL is required' });
    }

    const result = await processCameraScannedTicket(ticketImageUrl, companyId);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    return res.status(200).json(result);
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error processing camera ticket: ${errorMessage}`, { error });
    return res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Get available IoT hardware options
 * @route   GET /api/scales/hardware-options
 * @access  Private
 */
export const getHardwareOptions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isAdmin = req.user?.isAdmin === true;
    const result = getAvailableHardwareOptions();

    // Filter options based on user role if needed
    if (!isAdmin) {
      // If not admin, filter out city scale system option
      if (result.options) {
        result.options = result.options.filter(option => !option.isCityScaleCompatible);
      }
    }

    return res.status(200).json(result);
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error getting hardware options: ${errorMessage}`, { error });
    return res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Configure IoT hardware for a scale
 * @route   POST /api/scales/:id/configure-hardware
 * @access  Private
 */
export const configureHardware = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;
    const scaleId = parseInt(req.params.id);
    const { hardwareType, config } = req.body;

    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    if (!hardwareType || !config) {
      return res.status(400).json({
        message: 'Hardware type and configuration are required',
      });
    }

    const result = await configureIoTHardware(scaleId, hardwareType, config, companyId, isAdmin);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    return res.status(200).json(result);
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error configuring hardware: ${errorMessage}`, { error });
    return res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};
