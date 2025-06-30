/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './client';

export default async function Dashboard() {
  const supabase = createClient();

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user data from backend API (with fallback to mock data)
  let userData = null;
  let driverData = null;
  
  try {
    // First, exchange Supabase token for Paseto token
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/exchange-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        supabaseToken: user.access_token
      })
    });
    
    if (tokenResponse.ok) {
      const { token } = await tokenResponse.json();
      
      // Now get user data with the Paseto token
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/user`, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (userResponse.ok) {
        userData = await userResponse.json();
      }
    }
  } catch (error) {
    console.log('Backend API not available, using direct database query');
  }
  
  // Fallback to direct database query if backend API fails
  if (!userData) {
    const { data: dbUserData } = await supabase
      .from('users')
      .select('name, is_admin, email')
      .eq('email', user.email) // Use email instead of ID for compatibility
      .single();
    userData = dbUserData;
  }

  // Check if user is a driver by matching email
  const { data: dbDriverData } = await supabase
    .from('drivers')
    .select('id, name, status')
    .eq('email', user.email)
    .eq('status', 'Active')
    .single();
  
  driverData = dbDriverData;

  // If user is an active driver, redirect to driver dashboard
  if (driverData && !userData?.is_admin) {
    redirect('/driver-dashboard');
  }

  return (
    <DashboardClient userName={userData?.name || 'User'} isAdmin={userData?.is_admin || false} />
  );
}
