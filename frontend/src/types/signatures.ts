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

export interface Signature {
  id: number;
  name: string;
  signature_url?: string;
  company_id?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSignatureRequest {
  name: string;
  company_id?: number;
  created_by?: string;
}

export interface UpdateSignatureRequest {
  name?: string;
  signature_url?: string;
}

export interface SignatureFormData {
  name: string;
  signatureBlob?: Blob;
}

export interface SignatureValidationError {
  field: string;
  message: string;
}

export interface SignatureApiResponse {
  data?: Signature[];
  error?: string;
  success: boolean;
}