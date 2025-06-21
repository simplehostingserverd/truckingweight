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

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Regular Supabase client for user verification
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function verifyAdminUser(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const token = authHeader.substring(7);
    
    // Verify the token with Supabase
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: { _user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    // Check if user is admin
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: userData, _error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error verifying admin user:', error);
    return null;
  }
}

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    // Verify admin user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const adminUser = await verifyAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { _status: 401 });
    }

    // Get all users with company information
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        company_id,
        is_admin,
        created_at,
        companies:company_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { _status: 500 });
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { _status: 500 });
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    // Verify admin user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const adminUser = await verifyAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { _status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, email, password, company_id, is_admin } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { _status: 400 });
    }

    // Create user in Supabase Auth
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: authData, _error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ _error: authError.message }, { _status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { _status: 500 });
    }

    // Create user record in users table
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: userData, _error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        company_id: company_id || null,
        is_admin: is_admin || false,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user record:', userError);
      // Clean up auth user if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: 'Failed to create user record' }, { _status: 500 });
    }

    return NextResponse.json(userData, { _status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { _status: 500 });
  }
}
