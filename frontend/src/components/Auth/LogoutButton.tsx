'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
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
