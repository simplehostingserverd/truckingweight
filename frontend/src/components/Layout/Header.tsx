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

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import LogoutButton from '@/components/Auth/LogoutButton';

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createClient();

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="bg-primary-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Cargo Scale Pro
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-primary-200 transition-colors">
                Home
              </Link>
            </li>
            {isLoggedIn ? (
              <>
                <li>
                  <Link href="/dashboard" className="hover:text-primary-200 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/weights" className="hover:text-primary-200 transition-colors">
                    Weight Management
                  </Link>
                </li>
                <li>
                  <Link href="/loads" className="hover:text-primary-200 transition-colors">
                    Load Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-primary-200 transition-colors">
                    Profile
                  </Link>
                </li>
                <li>
                  <LogoutButton />
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className="hover:text-primary-200 transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-primary-200 transition-colors">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
