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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        router.push({ pathname: '/dashboard' });
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
    router.push({ pathname: '/login' });
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
