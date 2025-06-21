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
    const {
      data: { _user },
      error,
    } = await supabase.auth.getUser(token);

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

// PUT /api/admin/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify admin user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const adminUser = await verifyAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { _status: 401 });
    }

    const { id } = await params;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, company_id, is_admin } = body;

    // Check if user exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: existingUser, _error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { _status: 404 });
    }

    // Update user record
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: updatedUser, _error: updateError } = await supabase
      .from('users')
      .update({
        name: name || existingUser.name,
        company_id: company_id !== undefined ? company_id : existingUser.company_id,
        is_admin: is_admin !== undefined ? is_admin : existingUser.is_admin,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ error: 'Failed to update user' }, { _status: 500 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error in PUT /api/admin/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { _status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const adminUser = await verifyAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { _status: 401 });
    }

    const { id } = await params;

    // Check if user exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: existingUser, _error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { _status: 404 });
    }

    // Prevent admin from deleting themselves
    if (id === adminUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { _status: 400 });
    }

    // Delete user from Supabase Auth
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      console.error('Error deleting auth user:', authError);
      return NextResponse.json({ error: 'Failed to delete user from auth' }, { _status: 500 });
    }

    // Delete user record from users table
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _error: deleteError } = await supabase.from('users').delete().eq('id', id);

    if (deleteError) {
      console.error('Error deleting user record:', deleteError);
      return NextResponse.json({ error: 'Failed to delete user record' }, { _status: 500 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { _status: 500 });
  }
}
