/**
 * Authentication utilities
 * Provides token management for API requests
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get the current authentication token
 * @returns Promise<string | null> - The access token or null if not authenticated
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting auth session:', error);
      return null;
    }
    
    return session?.access_token || null;
  } catch (error) {
    console.error('Error in getAuthToken:', error);
    return null;
  }
}

/**
 * Check if user is currently authenticated
 * @returns Promise<boolean> - True if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return token !== null;
}