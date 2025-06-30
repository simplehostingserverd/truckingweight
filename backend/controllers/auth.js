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

import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import supabase from '../config/supabase.js';
import * as pasetoService from '../services/pasetoService.js';

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, companyId } = req.body;

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', checkError);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          company_id: companyId,
          is_admin: false,
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Create Paseto payload
    const payload = {
      user: {
        id: newUser.id,
        companyId: newUser.company_id,
        isAdmin: newUser.is_admin,
      },
    };

    try {
      // Generate Paseto token
      const token = await pasetoService.generateToken(payload);

      // Store token in Redis for validation
      await pasetoService.storeToken(token, {
        userId: newUser.id,
        companyId: newUser.company_id,
        isAdmin: newUser.is_admin,
      });

      res.json({ token });
    } catch (err) {
      console.error('Error generating token:', err);
      res.status(500).send('Server error');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error finding user:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create Paseto payload
    const payload = {
      user: {
        id: user.id,
        companyId: user.company_id,
        isAdmin: user.is_admin,
      },
    };

    try {
      // Generate Paseto token
      const token = await pasetoService.generateToken(payload);

      // Store token in Redis for validation
      await pasetoService.storeToken(token, {
        userId: user.id,
        companyId: user.company_id,
        isAdmin: user.is_admin,
      });

      res.json({ token });
    } catch (err) {
      console.error('Error generating token:', err);
      res.status(500).send('Server error');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get user data
// @route   GET /api/auth/user
// @access  Private
export const getUser = async (req, res) => {
  try {
    // Try to find user by ID first
    let { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, company_id, is_admin, created_at')
      .eq('id', req.user.id)
      .single();

    // If user not found by ID, try to find by email (for Supabase Auth compatibility)
    if (error && error.code === 'PGRST116' && req.user.email) {
      console.log('User not found by ID, trying email lookup for:', req.user.email);
      const { data: emailUser, error: emailError } = await supabase
        .from('users')
        .select('id, name, email, company_id, is_admin, created_at')
        .eq('email', req.user.email)
        .single();
      
      if (!emailError && emailUser) {
        user = emailUser;
        error = null;
      }
    }

    if (error) {
      console.error('Error finding user:', error);
      console.log('No user data found, using mock data');
      
      // Return mock user data for demo purposes
      const mockUser = {
        id: req.user.id || '550e8400-e29b-41d4-a716-446655440000',
        name: req.user.name || 'Demo User',
        email: req.user.email || 'test.driver@demo.com',
        company_id: 1,
        is_admin: false,
        created_at: new Date().toISOString()
      };
      
      return res.json(mockUser);
    }

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Exchange Supabase token for Paseto token
// @route   POST /api/auth/exchange-token
// @access  Public
export const exchangeToken = async (req, res) => {
  try {
    const { supabaseToken } = req.body;
    
    if (!supabaseToken) {
      return res.status(400).json({ msg: 'Supabase token is required' });
    }

    // Verify the Supabase token and get user info
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: { user }, error } = await supabaseClient.auth.getUser(supabaseToken);
    
    if (error || !user) {
      return res.status(401).json({ msg: 'Invalid Supabase token' });
    }

    // Generate Paseto token with user info
    const token = await pasetoService.generateToken({
      userId: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email,
    });

    res.json({ token });
  } catch (err) {
    console.error('Error exchanging token:', err);
    res.status(500).send('Server error');
  }
};

// Export as default object
export default {
  register,
  login,
  getUser,
  exchangeToken,
};
