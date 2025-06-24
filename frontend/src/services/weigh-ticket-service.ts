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
 * This service handles the creation and management of weigh tickets
 */

import { createClient } from '@/utils/supabase/client';
import {
  Cargo,
  ComplianceIssue,
  TicketImage,
  TicketSignature,
  WeighTicket,
  WeightReading,
} from '@/types/scale-master';

export class WeighTicketService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private supabase = createClient();

  /**
   * Generate a unique ticket number
   * @returns Unique ticket number
   */
  private generateTicketNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `TKT-${timestamp}-${random}`;
  }

  /**
   * Create a new weigh ticket from a weight reading
   * @param reading Weight reading
   * @param vehicleId Vehicle ID
   * @param driverId Driver ID
   * @param scaleId Scale ID
   * @param facilityId Facility ID
   * @param notes Optional notes
   * @returns Created weigh ticket
   */
  async createTicket(
    reading: WeightReading,
    vehicleId: number,
    driverId: number,
    scaleId: number | null,
    facilityId: number | null,
    notes?: string
  ): Promise<WeighTicket> {
    // Get the current user
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the user's company ID
    const { data: userData, error: userError } = await this.supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('Failed to get user data');
    }

    // Create the weigh ticket
    const ticketData = {
      ticket_number: this.generateTicketNumber(),
      vehicle_id: vehicleId,
      driver_id: driverId,
      scale_id: scaleId,
      facility_id: facilityId,
      gross_weight: reading.grossWeight,
      tare_weight: reading.tareWeight,
      net_weight: reading.netWeight,
      unit: reading.unit,
      date_time: reading.timestamp.toISOString(),
      status: 'Created',
      compliance_status: this.determineComplianceStatus(reading),
      capture_method: reading.captureMethod.toUpperCase(),
      latitude: reading.locationData?.latitude,
      longitude: reading.locationData?.longitude,
      notes: notes,
      company_id: userData.company_id,
      created_by: user.id,
    };

    const { data: ticket, error } = await this.supabase
      .from('weigh_tickets')
      .insert(ticketData)
      .select()
      .single();

    if (error || !ticket) {
      throw new Error(`Failed to create weigh ticket: ${error?.message}`);
    }

    // If we have axle weights, save them
    if (reading.axleWeights && reading.axleWeights.length > 0) {
      await this.saveAxleWeights(ticket.id, reading.axleWeights);
    }

    return ticket;
  }

  /**
   * Save axle weights for a weigh ticket
   * @param ticketId Weigh ticket ID
   * @param axleWeights Axle weights from the reading
   */
  private async saveAxleWeights(
    ticketId: number,
    axleWeights: WeightReading['axleWeights']
  ): Promise<void> {
    if (!axleWeights || axleWeights.length === 0) {
      return;
    }

    const axleWeightData = axleWeights.map(aw => ({
      weigh_ticket_id: ticketId,
      axle_position: aw.position,
      weight: aw.weight,
      max_legal_weight: aw.maxLegal,
      compliance_status: this.determineAxleComplianceStatus(aw.weight, aw.maxLegal),
    }));

    const { error } = await this.supabase.from('axle_weights').insert(axleWeightData);

    if (error) {
      console.error('Failed to save axle weights:', error);
    }
  }

  /**
   * Determine the compliance status based on the weight reading
   * @param reading Weight reading
   * @returns Compliance status
   */
  private determineComplianceStatus(
    reading: WeightReading
  ): 'Compliant' | 'Warning' | 'Non-Compliant' {
    // If we have axle weights, check if any are non-compliant
    if (reading.axleWeights && reading.axleWeights.length > 0) {
      const axleStatuses = reading.axleWeights.map(aw =>
        this.determineAxleComplianceStatus(aw.weight, aw.maxLegal)
      );

      if (axleStatuses.includes('Non-Compliant')) {
        return 'Non-Compliant';
      }

      if (axleStatuses.includes('Warning')) {
        return 'Warning';
      }
    }

    // If no axle weights or all are compliant, return Compliant
    return 'Compliant';
  }

  /**
   * Determine the compliance status for an axle
   * @param weight Axle weight
   * @param maxLegal Maximum legal weight
   * @returns Compliance status
   */
  private determineAxleComplianceStatus(
    weight: number,
    maxLegal: number
  ): 'Compliant' | 'Warning' | 'Non-Compliant' {
    // If weight is over the legal limit, it's non-compliant
    if (weight > maxLegal) {
      return 'Non-Compliant';
    }

    // If weight is within 5% of the legal limit, it's a warning
    if (weight > maxLegal * 0.95) {
      return 'Warning';
    }

    // Otherwise, it's compliant
    return 'Compliant';
  }

  /**
   * Get a weigh ticket by ID
   * @param ticketId Weigh ticket ID
   * @returns Weigh ticket with related data
   */
  async getTicket(ticketId: number): Promise<WeighTicket> {
    const { data: ticket, error } = await this.supabase
      .from('weigh_tickets')
      .select(
        `
        *,
        vehicle:vehicle_id(*),
        driver:driver_id(*),
        axle_weights(*),
        cargo(*),
        images:ticket_images(*),
        signatures:ticket_signatures(*),
        compliance_issues(*)
      `
      )
      .eq('id', ticketId)
      .single();

    if (error || !ticket) {
      throw new Error(`Failed to get weigh ticket: ${error?.message}`);
    }

    return ticket;
  }

  /**
   * Update a weigh ticket
   * @param ticketId Weigh ticket ID
   * @param updates Updates to apply
   * @returns Updated weigh ticket
   */
  async updateTicket(ticketId: number, updates: Partial<WeighTicket>): Promise<WeighTicket> {
    const { data: ticket, error } = await this.supabase
      .from('weigh_tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single();

    if (error || !ticket) {
      throw new Error(`Failed to update weigh ticket: ${error?.message}`);
    }

    return ticket;
  }

  /**
   * Add cargo information to a weigh ticket
   * @param ticketId Weigh ticket ID
   * @param cargoData Cargo data
   * @returns Created cargo record
   */
  async addCargo(
    ticketId: number,
    cargoData: Omit<Cargo, 'id' | 'weigh_ticket_id' | 'created_at'>
  ): Promise<Cargo> {
    const { data: cargo, error } = await this.supabase
      .from('cargo')
      .insert({
        ...cargoData,
        weigh_ticket_id: ticketId,
      })
      .select()
      .single();

    if (error || !cargo) {
      throw new Error(`Failed to add cargo information: ${error?.message}`);
    }

    return cargo;
  }

  /**
   * Add an image to a weigh ticket
   * @param ticketId Weigh ticket ID
   * @param imageUrl Image URL
   * @param imageType Image type
   * @returns Created image record
   */
  async addImage(
    ticketId: number,
    imageUrl: string,
    imageType: 'Vehicle' | 'Cargo' | 'Document'
  ): Promise<TicketImage> {
    // Get the current user
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: image, error } = await this.supabase
      .from('ticket_images')
      .insert({
        weigh_ticket_id: ticketId,
        image_url: imageUrl,
        image_type: imageType,
        captured_by: user.id,
      })
      .select()
      .single();

    if (error || !image) {
      throw new Error(`Failed to add image: ${error?.message}`);
    }

    return image;
  }

  /**
   * Add a signature to a weigh ticket
   * @param ticketId Weigh ticket ID
   * @param signatureUrl Signature image URL
   * @param name Signer's name
   * @param role Signer's role
   * @returns Created signature record
   */
  async addSignature(
    ticketId: number,
    signatureUrl: string,
    name: string,
    role?: string
  ): Promise<TicketSignature> {
    const { data: signature, error } = await this.supabase
      .from('ticket_signatures')
      .insert({
        weigh_ticket_id: ticketId,
        signature_url: signatureUrl,
        name,
        role,
        ip_address: '127.0.0.1', // In a real app, we would get the client's IP
      })
      .select()
      .single();

    if (error || !signature) {
      throw new Error(`Failed to add signature: ${error?.message}`);
    }

    return signature;
  }

  /**
   * Add a compliance issue to a weigh ticket
   * @param ticketId Weigh ticket ID
   * @param issueType Issue type
   * @param description Issue description
   * @param severity Issue severity
   * @param recommendation Optional recommendation
   * @returns Created compliance issue record
   */
  async addComplianceIssue(
    ticketId: number,
    issueType: string,
    description: string,
    severity: 'Low' | 'Medium' | 'High' | 'Critical',
    recommendation?: string
  ): Promise<ComplianceIssue> {
    const { data: issue, error } = await this.supabase
      .from('compliance_issues')
      .insert({
        weigh_ticket_id: ticketId,
        issue_type: issueType,
        description,
        severity,
        recommendation,
      })
      .select()
      .single();

    if (error || !issue) {
      throw new Error(`Failed to add compliance issue: ${error?.message}`);
    }

    return issue;
  }
}

// Create and export a singleton instance
export const weighTicketService = new WeighTicketService();
