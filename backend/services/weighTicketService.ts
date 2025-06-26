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
 * Weigh Ticket Service
 *
 * This service handles the generation and management of weigh tickets
 */

// UUID import removed as it's not used in this file
import prisma from '../config/prisma';
import { setCompanyContext } from '../config/prisma';
import { logger } from '../utils/logger';
import { generateTicketQRCode } from './qrCodeService';
import { checkWeightCompliance } from '../utils/compliance';

// Type definitions
interface AxleWeight {
  axleNumber: number;
  weight: number;
  axleType?: string;
}

interface WeightData {
  vehicleId: number;
  driverId: number;
  scaleId: number;
  grossWeight: number;
  tareWeight?: number;
  axleWeights?: AxleWeight[];
  weighType: string; // 'gross_only', 'tare_only', 'gross_tare', 'split_weigh'
  weighMethod: string; // 'scale_api', 'manual_entry', 'camera_scan', 'iot_sensor'
  notes?: string;
  ticketImageUrl?: string;
  signatureImageUrl?: string;
  signatureName?: string;
  signatureRole?: string;
}

interface WeighTicket {
  id: number;
  ticketNumber: string;
  vehicleId: number;
  driverId: number;
  scaleId: number;
  grossWeight: number;
  tareWeight?: number;
  netWeight?: number;
  weighType: string;
  weighMethod: string;
  notes?: string;
  ticketImageUrl?: string;
  signatureImageUrl?: string;
  signatureName?: string;
  signatureRole?: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WeighTicketResult {
  success: boolean;
  ticket?: WeighTicket;
  error?: string;
}

/**
 * Generate a new weigh ticket
 * @param weightData - The weight data for the ticket
 * @param companyId - The company ID for context
 * @param userId - The ID of the user creating the ticket
 */
export async function generateWeighTicket(
  weightData: WeightData,
  companyId: number,
  userId: string
): Promise<WeighTicketResult> {
  try {
    // Set company context for Prisma queries
    setCompanyContext(companyId);

    // Generate a unique ticket number
    const ticketNumber = `TKT-${companyId}-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 1000
    )
      .toString()
      .padStart(3, '0')}`;

    // Calculate net weight if both gross and tare are provided
    const netWeight = weightData.tareWeight
      ? weightData.grossWeight - weightData.tareWeight
      : undefined;

    // Create a new weight record
    const weight = await prisma.weights.create({
      data: {
        vehicle_id: weightData.vehicleId,
        driver_id: weightData.driverId,
        weight: weightData.grossWeight.toString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        status: 'Pending', // Will be updated after compliance check
        capture_method: weightData.weighMethod,
        notes: weightData.notes,
        company_id: companyId,
        created_by: userId,
      },
    });

    // Create axle weight records if provided
    if (weightData.axleWeights && weightData.axleWeights.length > 0) {
      await prisma.axle_weights.createMany({
        data: weightData.axleWeights.map(axle => ({
          weight_id: weight.id,
          axle_number: axle.axleNumber,
          axle_weight: axle.weight,
          axle_type: axle.axleType,
        })),
      });
    }

    // Create the weigh ticket
    const ticket = await prisma.weigh_tickets.create({
      data: {
        ticket_number: ticketNumber,
        weight_id: weight.id,
        scale_id: weightData.scaleId,
        gross_weight: weightData.grossWeight,
        tare_weight: weightData.tareWeight,
        net_weight: netWeight,
        weigh_type: weightData.weighType,
        weigh_method: weightData.weighMethod,
        notes: weightData.notes,
        company_id: companyId,
      },
    });

    // Save ticket image if provided
    if (weightData.ticketImageUrl) {
      await prisma.ticket_images.create({
        data: {
          weigh_ticket_id: ticket.id,
          image_url: weightData.ticketImageUrl,
          image_type: 'ticket',
          captured_by: userId,
        },
      });
    }

    // Save signature if provided
    if (weightData.signatureImageUrl && weightData.signatureName) {
      await prisma.ticket_signatures.create({
        data: {
          weigh_ticket_id: ticket.id,
          signature_url: weightData.signatureImageUrl,
          name: weightData.signatureName,
          role: weightData.signatureRole,
        },
      });
    }

    // Check compliance
    const complianceResult = await checkWeightCompliance(weight.id, companyId);

    // Update weight status based on compliance check
    await prisma.weights.update({
      where: { id: weight.id },
      data: { status: complianceResult.status },
    });

    // Create compliance issues if any
    if (complianceResult.issues && complianceResult.issues.length > 0) {
      await prisma.compliance_issues.createMany({
        data: complianceResult.issues.map(issue => ({
          weigh_ticket_id: ticket.id,
          issue_type: issue.type,
          description: issue.description,
          severity: issue.severity,
          recommendation: issue.recommendation,
        })),
      });
    }

    // Generate QR code for the ticket
    const qrCodeResult = await generateTicketQRCode(ticket.id, companyId);

    // Return the created ticket with additional information
    const completeTicket = await prisma.weigh_tickets.findUnique({
      where: { id: ticket.id },
      include: {
        weights: {
          include: {
            vehicles: true,
            drivers: true,
            axle_weights: true,
          },
        },
        scales: true,
        compliance_issues: true,
        ticket_images: true,
        ticket_signatures: true,
      },
    });

    return {
      success: true,
      ticket: {
        ...completeTicket,
        qrCode: qrCodeResult.success ? qrCodeResult.qrCodeDataUrl : undefined,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error(`Error generating weigh ticket: ${errorMessage}`, { error });
    return { success: false, error: errorMessage };
  }
}

/**
 * Get a weigh ticket by ID
 * @param ticketId - The ID of the weigh ticket
 * @param companyId - The company ID for context
 * @param isAdmin - Whether the user is an admin
 */
export async function getWeighTicket(
  ticketId: number,
  companyId: number,
  isAdmin: boolean = false
): Promise<WeighTicketResult> {
  try {
    // Set company context for Prisma queries
    setCompanyContext(companyId, isAdmin);

    // Get the ticket
    const ticket = await prisma.weigh_tickets.findUnique({
      where: { id: ticketId },
      include: {
        weights: {
          include: {
            vehicles: true,
            drivers: true,
            axle_weights: true,
          },
        },
        scales: true,
        compliance_issues: true,
        ticket_images: true,
        ticket_signatures: true,
      },
    });

    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    // Generate QR code for the ticket
    const qrCodeResult = await generateTicketQRCode(ticket.id, companyId, isAdmin);

    return {
      success: true,
      ticket: {
        ...ticket,
        qrCode: qrCodeResult.success ? qrCodeResult.qrCodeDataUrl : undefined,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error(`Error getting weigh ticket: ${errorMessage}`, { error });
    return { success: false, error: errorMessage };
  }
}

/**
 * Update a weigh ticket
 * @param ticketId - The ID of the weigh ticket
 * @param updateData - The data to update
 * @param companyId - The company ID for context
 * @param userId - The ID of the user updating the ticket
 */
interface UpdateWeighTicketData {
  grossWeight?: number;
  tareWeight?: number;
  notes?: string;
  ticketImageUrl?: string;
  signatureImageUrl?: string;
  signatureName?: string;
  signatureRole?: string;
}

export async function updateWeighTicket(
  ticketId: number,
  updateData: UpdateWeighTicketData,
  companyId: number,
  userId: string
): Promise<WeighTicketResult> {
  try {
    // Set company context for Prisma queries
    setCompanyContext(companyId);

    // Get the existing ticket
    const existingTicket = await prisma.weigh_tickets.findUnique({
      where: { id: ticketId },
      include: {
        weights: true,
      },
    });

    if (!existingTicket) {
      return { success: false, error: 'Ticket not found' };
    }

    // Calculate net weight if both gross and tare are provided
    const grossWeight = updateData.grossWeight || existingTicket.gross_weight;
    const tareWeight = updateData.tareWeight || existingTicket.tare_weight;
    const netWeight = tareWeight ? grossWeight - tareWeight : undefined;

    // Update the ticket
    const updatedTicket /* eslint-disable-line @typescript-eslint/no-unused-vars */ =
      await prisma.weigh_tickets.update({
        where: { id: ticketId },
        data: {
          gross_weight: grossWeight,
          tare_weight: tareWeight,
          net_weight: netWeight,
          notes: updateData.notes,
          updated_at: new Date(),
        },
      });

    // Update the weight record
    if (existingTicket.weight_id) {
      await prisma.weights.update({
        where: { id: existingTicket.weight_id },
        data: {
          weight: grossWeight.toString(),
          notes: updateData.notes,
          updated_at: new Date(),
        },
      });

      // Re-check compliance
      const complianceResult = await checkWeightCompliance(existingTicket.weight_id, companyId);

      // Update weight status based on compliance check
      await prisma.weights.update({
        where: { id: existingTicket.weight_id },
        data: { status: complianceResult.status },
      });

      // Clear existing compliance issues
      await prisma.compliance_issues.deleteMany({
        where: { weigh_ticket_id: ticketId },
      });

      // Create new compliance issues if any
      if (complianceResult.issues && complianceResult.issues.length > 0) {
        await prisma.compliance_issues.createMany({
          data: complianceResult.issues.map(issue => ({
            weigh_ticket_id: ticketId,
            issue_type: issue.type,
            description: issue.description,
            severity: issue.severity,
            recommendation: issue.recommendation,
          })),
        });
      }
    }

    // Save new ticket image if provided
    if (updateData.ticketImageUrl) {
      await prisma.ticket_images.create({
        data: {
          weigh_ticket_id: ticketId,
          image_url: updateData.ticketImageUrl,
          image_type: 'ticket',
          captured_by: userId,
        },
      });
    }

    // Save new signature if provided
    if (updateData.signatureImageUrl && updateData.signatureName) {
      await prisma.ticket_signatures.create({
        data: {
          weigh_ticket_id: ticketId,
          signature_url: updateData.signatureImageUrl,
          name: updateData.signatureName,
          role: updateData.signatureRole,
        },
      });
    }

    // Get the updated ticket with all related data
    const completeTicket = await prisma.weigh_tickets.findUnique({
      where: { id: ticketId },
      include: {
        weights: {
          include: {
            vehicles: true,
            drivers: true,
            axle_weights: true,
          },
        },
        scales: true,
        compliance_issues: true,
        ticket_images: true,
        ticket_signatures: true,
      },
    });

    return { success: true, ticket: completeTicket };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error(`Error updating weigh ticket: ${errorMessage}`, { error });
    return { success: false, error: errorMessage };
  }
}
