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
  user_metadata?: unknown;
}

export interface AuthHook {
  _user: AuthUser | null;
  session: unknown;
  _isLoading: boolean;
  token?: string;
  signIn: (
    email: string,
    password: string,
    captchaToken?: string | null
  ) => Promise<{ _error: Error }>;
  signOut: () => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useAuth = (): AuthHook => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, session, isLoading, signIn, signOut } = useSupabaseAuth();

  // Transform Supabase user to our AuthUser interface
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        email: user.email,
        companyId: user.user_metadata?.company_id,
        isAdmin: user.user_metadata?.is_admin || false,
        user_metadata: user.user_metadata,
      }
    : null;

  // Extract token from session
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const token = session?.access_token;

  return {
    _user: authUser,
    session,
    isLoading,
    token,
    signIn,
    signOut,
  };
};
