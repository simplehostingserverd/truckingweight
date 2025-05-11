/**
 * QR Code Service
 * 
 * This service handles generation and validation of QR codes for scales and weigh tickets
 */

import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import { setCompanyContext } from '../config/prisma';
import { logger } from '../utils/logger';

/**
 * Generate a QR code for a scale
 * @param scaleId - The ID of the scale
 * @param companyId - The company ID for context
 * @param isAdmin - Whether the user is an admin
 */
export const generateScaleQRCode = async (
  scaleId: number,
  companyId: number,
  isAdmin: boolean = false
): Promise<{ success: boolean; qrCodeDataUrl?: string; qrCodeUuid?: string; error?: string }> => {
  try {
    // Set company context for Prisma queries
    setCompanyContext(companyId, isAdmin);

    // Get scale information
    const scale = await prisma.scales.findUnique({
      where: { id: scaleId },
    });

    if (!scale) {
      return { success: false, error: 'Scale not found' };
    }

    // Generate a UUID for the QR code if one doesn't exist
    const qrCodeUuid = scale.qr_code_uuid || uuidv4();

    // Update the scale with the QR code UUID if needed
    if (!scale.qr_code_uuid) {
      await prisma.scales.update({
        where: { id: scaleId },
        data: { qr_code_uuid: qrCodeUuid },
      });
    }

    // Create the QR code data
    const qrCodeData = {
      type: 'scale',
      scaleId,
      uuid: qrCodeUuid,
      name: scale.name,
      companyId,
      timestamp: new Date().toISOString(),
    };

    // Generate the QR code as a data URL
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData), {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
    });

    return { success: true, qrCodeDataUrl, qrCodeUuid };
  } catch (error: any) {
    logger.error(`Error generating scale QR code: ${error.message}`, { error });
    return { success: false, error: error.message };
  }
};

/**
 * Generate a QR code for a weigh ticket
 * @param ticketId - The ID of the weigh ticket
 * @param companyId - The company ID for context
 * @param isAdmin - Whether the user is an admin
 */
export const generateTicketQRCode = async (
  ticketId: number,
  companyId: number,
  isAdmin: boolean = false
): Promise<{ success: boolean; qrCodeDataUrl?: string; error?: string }> => {
  try {
    // Set company context for Prisma queries
    setCompanyContext(companyId, isAdmin);

    // Get ticket information
    const ticket = await prisma.weigh_tickets.findUnique({
      where: { id: ticketId },
      include: {
        weights: {
          include: {
            vehicles: true,
            drivers: true,
          },
        },
      },
    });

    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    // Create the QR code data
    const qrCodeData = {
      type: 'ticket',
      ticketId,
      ticketNumber: ticket.ticket_number,
      grossWeight: ticket.gross_weight,
      tareWeight: ticket.tare_weight,
      netWeight: ticket.net_weight,
      date: ticket.created_at,
      vehicleId: ticket.weights?.vehicle_id,
      vehicleName: ticket.weights?.vehicles?.name,
      driverId: ticket.weights?.driver_id,
      driverName: ticket.weights?.drivers?.name,
      companyId,
      timestamp: new Date().toISOString(),
    };

    // Generate the QR code as a data URL
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData), {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
    });

    return { success: true, qrCodeDataUrl };
  } catch (error: any) {
    logger.error(`Error generating ticket QR code: ${error.message}`, { error });
    return { success: false, error: error.message };
  }
};

/**
 * Validate a QR code for a scale
 * @param qrCodeData - The data from the scanned QR code
 * @param companyId - The company ID for context
 */
export const validateScaleQRCode = async (
  qrCodeData: any,
  companyId: number
): Promise<{ success: boolean; scale?: any; error?: string }> => {
  try {
    // Set company context for Prisma queries
    setCompanyContext(companyId);

    // Parse the QR code data
    const parsedData = typeof qrCodeData === 'string' ? JSON.parse(qrCodeData) : qrCodeData;

    // Validate the QR code type
    if (parsedData.type !== 'scale') {
      return { success: false, error: 'Invalid QR code type' };
    }

    // Get the scale by UUID
    const scale = await prisma.scales.findFirst({
      where: {
        qr_code_uuid: parsedData.uuid,
        company_id: companyId,
      },
    });

    if (!scale) {
      return { success: false, error: 'Scale not found or not authorized' };
    }

    // Check if scale is active
    if (scale.status !== 'Active') {
      return { success: false, error: `Scale is ${scale.status}` };
    }

    return { success: true, scale };
  } catch (error: any) {
    logger.error(`Error validating scale QR code: ${error.message}`, { error });
    return { success: false, error: error.message };
  }
};

/**
 * Validate a QR code for a weigh ticket
 * @param qrCodeData - The data from the scanned QR code
 * @param companyId - The company ID for context
 */
export const validateTicketQRCode = async (
  qrCodeData: any,
  companyId: number
): Promise<{ success: boolean; ticket?: any; error?: string }> => {
  try {
    // Set company context for Prisma queries
    setCompanyContext(companyId);

    // Parse the QR code data
    const parsedData = typeof qrCodeData === 'string' ? JSON.parse(qrCodeData) : qrCodeData;

    // Validate the QR code type
    if (parsedData.type !== 'ticket') {
      return { success: false, error: 'Invalid QR code type' };
    }

    // Get the ticket by ID and company ID
    const ticket = await prisma.weigh_tickets.findFirst({
      where: {
        id: parsedData.ticketId,
        company_id: companyId,
      },
      include: {
        weights: {
          include: {
            vehicles: true,
            drivers: true,
          },
        },
      },
    });

    if (!ticket) {
      return { success: false, error: 'Ticket not found or not authorized' };
    }

    return { success: true, ticket };
  } catch (error: any) {
    logger.error(`Error validating ticket QR code: ${error.message}`, { error });
    return { success: false, error: error.message };
  }
};
