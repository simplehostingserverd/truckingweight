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


import { createClient } from './client';

// Bucket names for different storage purposes
export const CITY_LOGOS_BUCKET = 'city-logos';
export const CITY_DOCUMENTS_BUCKET = 'city-documents';
export const COMPANY_LOGOS_BUCKET = 'company-logos';
export const VEHICLE_IMAGES_BUCKET = 'vehicle-images';
export const DRIVER_PHOTOS_BUCKET = 'driver-photos';
export const TRUCKING_DOCUMENTS_BUCKET = 'trucking-documents';
export const SIGNATURES_BUCKET = 'signatures';

/**
 * Upload a file to Supabase Storage
 * @param bucket Bucket name
 * @param path File path within the bucket
 * @param file File to upload
 * @param contentType Content type of the file
 * @returns Public URL of the uploaded file
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  contentType?: string
): Promise<string> {
  const supabase = createClient();

  // Upload the file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      cacheControl: '3600',
      upsert: true, // Overwrite if file exists
    });

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Get the public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

  if (!urlData || !urlData.publicUrl) {
    throw new Error('Failed to get public URL for file');
  }

  return urlData.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param bucket Bucket name
 * @param path File path within the bucket
 * @returns True if successful
 */
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }

  return true;
}

/**
 * Get a public URL for a file in Supabase Storage
 * @param bucket Bucket name
 * @param path File path within the bucket
 * @returns Public URL of the file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload a city logo to Supabase Storage
 * @param cityId City ID
 * @param file Logo file
 * @returns Public URL of the uploaded logo
 */
export async function uploadCityLogo(cityId: number, file: File): Promise<string> {
  // Generate a unique filename with timestamp to avoid caching issues
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || 'png';
  const filename = `city_${cityId}_${timestamp}.${fileExtension}`;

  // Upload to the city-logos bucket
  return uploadFile(CITY_LOGOS_BUCKET, filename, file, file.type);
}

/**
 * Upload a city document to Supabase Storage
 * @param cityId City ID
 * @param file Document file
 * @param documentType Type of document (e.g., 'permit', 'violation')
 * @returns Public URL of the uploaded document
 */
export async function uploadCityDocument(
  cityId: number,
  file: File,
  documentType: string
): Promise<string> {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || 'pdf';
  const filename = `${documentType}_${cityId}_${timestamp}.${fileExtension}`;

  return uploadFile(CITY_DOCUMENTS_BUCKET, filename, file, file.type);
}

/**
 * Upload a company logo to Supabase Storage
 * @param companyId Company ID
 * @param file Logo file
 * @returns Public URL of the uploaded logo
 */
export async function uploadCompanyLogo(companyId: number, file: File): Promise<string> {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || 'png';
  const filename = `company_${companyId}_${timestamp}.${fileExtension}`;

  return uploadFile(COMPANY_LOGOS_BUCKET, filename, file, file.type);
}

/**
 * Upload a vehicle image to Supabase Storage
 * @param vehicleId Vehicle ID
 * @param file Image file
 * @param imageType Type of image (e.g., 'front', 'side', 'back')
 * @returns Public URL of the uploaded image
 */
export async function uploadVehicleImage(
  vehicleId: number,
  file: File,
  imageType: string = 'main'
): Promise<string> {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const filename = `vehicle_${vehicleId}_${imageType}_${timestamp}.${fileExtension}`;

  return uploadFile(VEHICLE_IMAGES_BUCKET, filename, file, file.type);
}

/**
 * Upload a driver photo to Supabase Storage
 * @param driverId Driver ID
 * @param file Photo file
 * @returns Public URL of the uploaded photo
 */
export async function uploadDriverPhoto(driverId: number, file: File): Promise<string> {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const filename = `driver_${driverId}_${timestamp}.${fileExtension}`;

  return uploadFile(DRIVER_PHOTOS_BUCKET, filename, file, file.type);
}

/**
 * Upload a trucking document to Supabase Storage
 * @param documentId Document ID
 * @param file Document file
 * @param documentType Type of document (e.g., 'weight_ticket', 'permit')
 * @returns Public URL of the uploaded document
 */
export async function uploadTruckingDocument(
  documentId: number,
  file: File,
  documentType: string
): Promise<string> {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || 'pdf';
  const filename = `${documentType}_${documentId}_${timestamp}.${fileExtension}`;

  return uploadFile(TRUCKING_DOCUMENTS_BUCKET, filename, file, file.type);
}

/**
 * Upload a signature to Supabase Storage
 * @param signatureId Signature ID or reference
 * @param file Signature image file
 * @returns Public URL of the uploaded signature
 */
export async function uploadSignature(signatureId: number | string, file: Blob): Promise<string> {
  const timestamp = Date.now();
  const filename = `signature_${signatureId}_${timestamp}.png`;

  return uploadFile(SIGNATURES_BUCKET, filename, file, 'image/png');
}
