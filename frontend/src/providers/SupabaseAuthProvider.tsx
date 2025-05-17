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

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getSupabaseConfig } from '@/utils/supabase/config';

// Define the context type
type SupabaseAuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

// Create the context with default values
const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: new Error('Not implemented') }),
  signOut: async () => {},
});

// Hook to use the auth context
export const useSupabaseAuth = () => useContext(SupabaseAuthContext);

// Provider component
export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Get Supabase configuration
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  // Initialize the Supabase client
  const supabase = createClientComponentClient({
    supabaseUrl,
    supabaseKey,
    options: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-auth-helpers-nextjs',
        },
      },
    },
  });

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      // Check for test accounts first
      const testAccounts = [
        {
          email: 'truckadmin@example.com',
          password: 'TruckAdmin123!',
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Trucking Admin',
          company_id: 1,
          is_admin: true,
        },
        {
          email: 'dispatcher@example.com',
          password: 'Dispatch123!',
          id: '223e4567-e89b-12d3-a456-426614174001',
          name: 'John Dispatcher',
          company_id: 1,
          is_admin: false,
        },
        {
          email: 'manager@example.com',
          password: 'Manager123!',
          id: '323e4567-e89b-12d3-a456-426614174002',
          name: 'Sarah Manager',
          company_id: 1,
          is_admin: false,
        },
      ];

      // Check if this is a test account
      const testAccount = testAccounts.find(
        account =>
          account.email.toLowerCase() === email.toLowerCase() && account.password === password
      );

      if (testAccount) {
        // For test accounts, create a mock session
        const mockSession = {
          access_token: `mock-token-${testAccount.id}`,
          refresh_token: `mock-refresh-${testAccount.id}`,
          expires_at: Date.now() + 3600 * 1000, // 1 hour from now
          user: {
            id: testAccount.id,
            email: testAccount.email,
            user_metadata: {
              name: testAccount.name,
              company_id: testAccount.company_id,
              is_admin: testAccount.is_admin,
              app_name: 'Simple Scale Solutions',
            },
          },
        };

        // Set the mock session and user
        setSession(mockSession as any);
        setUser(mockSession.user as any);

        // Redirect to dashboard
        router.push('/dashboard');
        router.refresh();

        return { error: null };
      }

      // If not a test account, try normal Supabase auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        router.push('/dashboard');
        router.refresh();
      }

      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Effect to handle auth state changes
  useEffect(() => {
    const getSession = async () => {
      try {
        setIsLoading(true);

        // Get the current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session) {
          setSession(session);
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Call getSession immediately
    getSession();

    // Set up the auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  // Provide the auth context to children
  return (
    <SupabaseAuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}
