/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

/**
 * Weigh Ticket Controller
 *
 * This controller handles API endpoints for weigh ticket management
 */

import { Request, Response } from 'express';
import prisma, { setCompanyContext } from '../config/prisma';
import { validateTicketQRCode } from '../services/qrCodeService';
import { processCameraScannedTicket } from '../services/scaleIntegration';
import {
  generateWeighTicket,
  getWeighTicket,
  updateWeighTicket,
} from '../services/weighTicketService';
import { logger } from '../utils/logger';

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
 * @desc    Get all weigh tickets for a company
 * @route   GET /api/weigh-tickets
 * @access  Private
 */
export const getWeighTickets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;

    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Set company context for Prisma queries
    setCompanyContext(companyId, isAdmin);

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Define filter based on user role
    const filter =
      isAdmin && req.query.companyId
        ? { company_id: parseInt(req.query.companyId as string) }
        : isAdmin
          ? {}
          : { company_id: companyId };

    // Add date range filter if provided
    if (req.query.startDate && req.query.endDate) {
      filter.created_at = {
        gte: new Date(req.query.startDate as string),
        lte: new Date(req.query.endDate as string),
      };
    }

    // Add vehicle filter if provided
    if (req.query.vehicleId) {
      filter.vehicle_id = parseInt(req.query.vehicleId as string);
    }

    // Add driver filter if provided
    if (req.query.driverId) {
      filter.driver_id = parseInt(req.query.driverId as string);
    }

    // Get total count for pagination
    const totalCount = await prisma.weigh_tickets.count({
      where: filter,
    });

    // Get weigh tickets
    const tickets = await prisma.weigh_tickets.findMany({
      where: filter,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        vehicles: {
          select: {
            id: true,
            name: true,
            license_plate: true,
          },
        },
        drivers: {
          select: {
            id: true,
            name: true,
            license_number: true,
          },
        },
        scales: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        companies: isAdmin
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : undefined,
      }
    });

    res.json({
      tickets,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error getting weigh tickets: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Get a weigh ticket by ID
 * @route   GET /api/weigh-tickets/:id
 * @access  Private
 */
export const getWeighTicketById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const isAdmin = req.user?.isAdmin === true;
    const ticketId = parseInt(req.params.id);

    if (!companyId && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    // Get weigh ticket
    const result = await getWeighTicket(ticketId, companyId, isAdmin);

    if (!result.success) {
      return res.status(404).json({ message: result.error });
    }

    res.json(result.ticket);
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error getting weigh ticket: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Create a new weigh ticket
 * @route   POST /api/weigh-tickets
 * @access  Private
 */
export const createWeighTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    if (!companyId || !userId) {
      return res.status(401).json({ message: 'Unauthorized - User information not found' });
    }

    // Validate required fields
    const { vehicleId, driverId, scaleId, grossWeight, weighType, weighMethod } = req.body;

    if (!vehicleId || !driverId || !scaleId || !grossWeight || !weighType || !weighMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create weigh ticket
    const result = await generateWeighTicket(
      {
        vehicleId: parseInt(vehicleId),
        driverId: parseInt(driverId),
        scaleId: parseInt(scaleId),
        grossWeight: parseFloat(grossWeight),
        tareWeight: req.body.tareWeight ? parseFloat(req.body.tareWeight) : undefined,
        axleWeights: req.body.axleWeights,
        weighType,
        weighMethod,
        notes: req.body.notes,
        ticketImageUrl: req.body.ticketImageUrl,
        signatureImageUrl: req.body.signatureImageUrl,
        signatureName: req.body.signatureName,
        signatureRole: req.body.signatureRole,
      },
      companyId,
      userId
    );

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(201).json(result.ticket);
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error creating weigh ticket: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Update a weigh ticket
 * @route   PUT /api/weigh-tickets/:id
 * @access  Private
 */
export const updateWeighTicketById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.id;
    const ticketId = parseInt(req.params.id);

    if (!companyId || !userId) {
      return res.status(401).json({ message: 'Unauthorized - User information not found' });
    }

    // Update weigh ticket
    const result = await updateWeighTicket(
      ticketId,
      {
        grossWeight: req.body.grossWeight ? parseFloat(req.body.grossWeight) : undefined,
        tareWeight: req.body.tareWeight ? parseFloat(req.body.tareWeight) : undefined,
        notes: req.body.notes,
        ticketImageUrl: req.body.ticketImageUrl,
        signatureImageUrl: req.body.signatureImageUrl,
        signatureName: req.body.signatureName,
        signatureRole: req.body.signatureRole,
      },
      companyId,
      userId
    );

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json(result.ticket);
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error updating weigh ticket: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Process a camera-scanned ticket
 * @route   POST /api/weigh-tickets/camera-scan
 * @access  Private
 */
export const processCameraScan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized - Company ID not found' });
    }

    const { ticketImageUrl } = req.body;

    if (!ticketImageUrl) {
      return res.status(400).json({ message: 'Ticket image URL is required' });
    }

    // Process camera-scanned ticket
    const result = await processCameraScannedTicket(ticketImageUrl, companyId);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json(result.ticketData);
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error processing camera-scanned ticket: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * @desc    Validate a QR code for a weigh ticket
 * @route   POST /api/weigh-tickets/validate-qrcode
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
    const result = await validateTicketQRCode(qrCodeData, companyId);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ valid: true, ticket: result.ticket });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logger.error(`Error validating weigh ticket QR code: ${errorMessage}`, { error });
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};
