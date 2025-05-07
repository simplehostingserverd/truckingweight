// Supabase configuration
// This file centralizes Supabase configuration to avoid duplication

// Hardcoded Supabase credentials as a fallback
// These should match the values in your .env file
export const SUPABASE_URL = 'https://fjmrukumtldijehoggeb.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbXJ1a3VtdGxkaWplaG9nZ2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MDcxMzAsImV4cCI6MjA2MjE4MzEzMH0.Wy2IcOhbhiefmSN8vzfcSVa1TszUVa5PcxIniwO1p64';

// The JWT secret is used to sign tokens - this should match your Supabase project settings
// This is only used on the server side and should never be exposed to the client
export const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

// Get Supabase URL with fallback
export const getSupabaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
};

// Get Supabase anon key with fallback
export const getSupabaseAnonKey = (): string => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
};

// Get Supabase JWT secret
export const getSupabaseJwtSecret = (): string | undefined => {
  return SUPABASE_JWT_SECRET;
};

// Get Supabase configuration object for client-side use
export const getSupabaseConfig = () => {
  return {
    supabaseUrl: getSupabaseUrl(),
    supabaseKey: getSupabaseAnonKey(),
  };
};

// Get Supabase configuration object for server-side use
export const getSupabaseServerConfig = () => {
  return {
    ...getSupabaseConfig(),
    supabaseJwtSecret: getSupabaseJwtSecret(),
  };
};
