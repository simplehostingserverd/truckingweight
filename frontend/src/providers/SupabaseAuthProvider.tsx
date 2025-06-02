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

import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

// Define the context type
type SupabaseAuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
    captchaToken?: string | null
  ) => Promise<{ error: any }>;
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

  // Initialize the Supabase client
  const supabase = createClient();

  // Sign in function
  const signIn = async (email: string, password: string, captchaToken?: string | null) => {
    try {
      // Verify captcha token if provided
      if (captchaToken) {
        try {
          // Verify the captcha token with our API
          const response = await fetch('/api/verify-captcha', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: captchaToken }),
          });

          const data = await response.json();

          if (!data.success) {
            return { error: new Error('Captcha verification failed') };
          }

          console.log('Captcha token verified successfully');
        } catch (error) {
          console.error('Error verifying captcha:', error);
          return { error: new Error('Captcha verification failed') };
        }
      }

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
        {
          email: 'horizon.admin@example.com',
          password: 'password',
          id: '4c232710-b655-46f1-8cda-1d43d4b442a1',
          name: 'Horizon Admin',
          company_id: 2,
          is_admin: true,
        },
        {
          email: 'horizon.user@example.com',
          password: 'password',
          id: '82cc2e58-6f6a-4777-acd1-abff62dad330',
          name: 'Horizon User',
          company_id: 2,
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

      // If not a test account, try normal Supabase auth with JWT
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.session) {
        // Get the session to ensure JWT is properly set
        console.log('Successfully authenticated with Supabase JWT');

        // Set the session and user
        setSession(data.session);
        setUser(data.user);

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
    try {
      // Sign out using Supabase Auth
      await supabase.auth.signOut();

      // Also clear local storage for backward compatibility
      localStorage.removeItem('cityToken');
      localStorage.removeItem('cityUser');

      // Clear state
      setUser(null);
      setSession(null);

      // Redirect to login page
      router.push('/login');
      router.refresh(); // Important to refresh the router
    } catch (error) {
      console.error('Error signing out:', error);

      // Fallback to manual logout if Supabase Auth fails
      localStorage.removeItem('cityToken');
      localStorage.removeItem('cityUser');

      // Clear state
      setUser(null);
      setSession(null);

      router.push('/login');
      router.refresh();
    }
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
