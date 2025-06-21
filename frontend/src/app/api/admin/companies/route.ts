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

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to get all companies (admin only)
 * This proxies the request to the backend or handles it directly with Supabase
 */

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _supabase = createClient();

    // Get authenticated user
    const {
      data: { _user },
      _error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { _status: 401 });
    }

    // Check if user is admin
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: userData, _error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { _status: 403 });
    }

    // Get all companies
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: companies, _error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      return NextResponse.json({ error: 'Failed to fetch companies' }, { _status: 500 });
    }

    return NextResponse.json(companies || []);
  } catch (error) {
    console.error('Error in admin companies API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { _status: 500 });
  }
}
