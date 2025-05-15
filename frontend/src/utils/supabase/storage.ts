import { createClient } from './client';

// Bucket name for city logos
export const CITY_LOGOS_BUCKET = 'city-logos';

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
