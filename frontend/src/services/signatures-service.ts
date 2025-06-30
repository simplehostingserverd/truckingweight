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

import { createClient } from '@/utils/supabase/client';
import { uploadSignature } from '@/utils/supabase/storage';
import type {
  Signature,
  CreateSignatureRequest,
  UpdateSignatureRequest,
  SignatureFormData,
  SignatureValidationError,
  SignatureApiResponse,
} from '@/types/signatures';

export class SignaturesService {
  private supabase = createClient();

  /**
   * Validate signature form data
   */
  validateSignatureData(data: SignatureFormData): SignatureValidationError[] {
    const errors: SignatureValidationError[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Signature name is required' });
    }

    if (data.name && data.name.trim().length > 255) {
      errors.push({ field: 'name', message: 'Signature name must be less than 255 characters' });
    }

    if (!data.signatureBlob) {
      errors.push({ field: 'signature', message: 'Signature drawing is required' });
    }

    return errors;
  }

  /**
   * Get current user's company ID
   */
  async getCurrentUserCompany(): Promise<{ userId: string; companyId: number } | null> {
    try {
      const {
        data: { user },
        error: authError,
      } = await this.supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.company_id) {
        throw new Error('User company not found');
      }

      return {
        userId: user.id,
        companyId: userData.company_id,
      };
    } catch (error) {
      console.error('Error getting user company:', error);
      return null;
    }
  }

  /**
   * Get all signatures for the current user's company
   */
  async getSignatures(): Promise<SignatureApiResponse> {
    try {
      const userCompany = await this.getCurrentUserCompany();
      if (!userCompany) {
        return {
          error: 'Authentication required',
          success: false,
        };
      }

      const { data, error } = await this.supabase
        .from('signatures')
        .select('*')
        .eq('company_id', userCompany.companyId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        success: true,
      };
    } catch (error) {
      console.error('Error fetching signatures:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch signatures',
        success: false,
      };
    }
  }

  /**
   * Get a specific signature by ID
   */
  async getSignature(id: number): Promise<{ data?: Signature; error?: string }> {
    try {
      const userCompany = await this.getCurrentUserCompany();
      if (!userCompany) {
        return { error: 'Authentication required' };
      }

      const { data, error } = await this.supabase
        .from('signatures')
        .select('*')
        .eq('id', id)
        .eq('company_id', userCompany.companyId)
        .single();

      if (error) {
        throw error;
      }

      return { data };
    } catch (error) {
      console.error('Error fetching signature:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch signature',
      };
    }
  }

  /**
   * Create a new signature
   */
  async createSignature(formData: SignatureFormData): Promise<{ data?: Signature; error?: string }> {
    try {
      // Validate input
      const validationErrors = this.validateSignatureData(formData);
      if (validationErrors.length > 0) {
        return {
          error: validationErrors.map(e => e.message).join(', '),
        };
      }

      const userCompany = await this.getCurrentUserCompany();
      if (!userCompany) {
        return { error: 'Authentication required' };
      }

      // Create signature record
      const signatureData: CreateSignatureRequest = {
        name: formData.name.trim(),
        company_id: userCompany.companyId,
        created_by: userCompany.userId,
      };

      const { data: newSignature, error: createError } = await this.supabase
        .from('signatures')
        .insert(signatureData)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Upload signature image if provided
      let signatureUrl: string | undefined;
      if (formData.signatureBlob) {
        try {
          signatureUrl = await uploadSignature(newSignature.id, formData.signatureBlob);

          // Update signature record with image URL
          const { error: updateError } = await this.supabase
            .from('signatures')
            .update({ signature_url: signatureUrl })
            .eq('id', newSignature.id);

          if (updateError) {
            console.error('Error updating signature URL:', updateError);
            // Don't fail the entire operation if URL update fails
          }
        } catch (uploadError) {
          console.error('Error uploading signature image:', uploadError);
          // Don't fail the entire operation if upload fails
        }
      }

      return {
        data: {
          ...newSignature,
          signature_url: signatureUrl,
        },
      };
    } catch (error) {
      console.error('Error creating signature:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to create signature',
      };
    }
  }

  /**
   * Update an existing signature
   */
  async updateSignature(
    id: number,
    updateData: UpdateSignatureRequest
  ): Promise<{ data?: Signature; error?: string }> {
    try {
      const userCompany = await this.getCurrentUserCompany();
      if (!userCompany) {
        return { error: 'Authentication required' };
      }

      // Validate name if provided
      if (updateData.name !== undefined) {
        if (!updateData.name || updateData.name.trim().length === 0) {
          return { error: 'Signature name cannot be empty' };
        }
        if (updateData.name.trim().length > 255) {
          return { error: 'Signature name must be less than 255 characters' };
        }
      }

      const { data, error } = await this.supabase
        .from('signatures')
        .update({
          ...updateData,
          name: updateData.name?.trim(),
        })
        .eq('id', id)
        .eq('company_id', userCompany.companyId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data };
    } catch (error) {
      console.error('Error updating signature:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to update signature',
      };
    }
  }

  /**
   * Delete a signature
   */
  async deleteSignature(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const userCompany = await this.getCurrentUserCompany();
      if (!userCompany) {
        return { success: false, error: 'Authentication required' };
      }

      // First check if signature exists and belongs to user's company
      const { data: existingSignature, error: fetchError } = await this.supabase
        .from('signatures')
        .select('id, signature_url')
        .eq('id', id)
        .eq('company_id', userCompany.companyId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return { success: false, error: 'Signature not found' };
        }
        throw fetchError;
      }

      // Delete signature record
      const { error: deleteError } = await this.supabase
        .from('signatures')
        .delete()
        .eq('id', id)
        .eq('company_id', userCompany.companyId);

      if (deleteError) {
        throw deleteError;
      }

      // TODO: Optionally delete signature image from storage
      // This would require parsing the URL to get the file path
      // and calling supabase.storage.from('signatures').remove([filePath])

      return { success: true };
    } catch (error) {
      console.error('Error deleting signature:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete signature',
      };
    }
  }

  /**
   * Check if canvas is empty (no signature drawn)
   */
  isCanvasEmpty(canvas: HTMLCanvasElement): boolean {
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;

    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return !pixelData.some(channel => channel !== 0);
  }

  /**
   * Convert canvas to blob
   */
  async canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        'image/png',
        0.9
      );
    });
  }
}

// Export singleton instance
export const signaturesService = new SignaturesService();