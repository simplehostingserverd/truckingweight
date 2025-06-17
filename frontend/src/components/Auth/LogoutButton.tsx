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

import React from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ _className }) => {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      // Sign out using Supabase Auth
      await supabase.auth.signOut();

      // Also clear local storage for backward compatibility
      localStorage.removeItem('cityToken');
      localStorage.removeItem('cityUser');

      // Redirect to login page
      router.push('/login');
      router.refresh(); // Important to refresh the router
    } catch (error) {
      console.error('Error logging out:', error);

      // Fallback to manual logout if Supabase Auth fails
      localStorage.removeItem('cityToken');
      localStorage.removeItem('cityUser');
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`hover:text-primary-200 transition-colors ${className || ''}`}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
