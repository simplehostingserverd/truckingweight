/**
 * Authentication Hook
 * Wrapper around Supabase auth for consistent authentication interface
 */

import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider';

export interface AuthUser {
  id: string;
  email?: string;
  companyId?: number;
  isAdmin?: boolean;
  user_metadata?: any;
}

export interface AuthHook {
  user: AuthUser | null;
  session: any;
  isLoading: boolean;
  token?: string;
  signIn: (email: string, password: string, captchaToken?: string | null) => Promise<{ error: Error }>;
  signOut: () => Promise<void>;
}

export const useAuth = (): AuthHook => {
  const { user, session, isLoading, signIn, signOut } = useSupabaseAuth();

  // Transform Supabase user to our AuthUser interface
  const authUser: AuthUser | null = user ? {
    id: user.id,
    email: user.email,
    companyId: user.user_metadata?.company_id,
    isAdmin: user.user_metadata?.is_admin || false,
    user_metadata: user.user_metadata,
  } : null;

  // Extract token from session
  const token = session?.access_token;

  return {
    user: authUser,
    session,
    isLoading,
    token,
    signIn,
    signOut,
  };
};
