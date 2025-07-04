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
import supabase from '../../config/supabase.js';
import * as pasetoService from '../../services/pasetoService.js';

// Register a user
async function register(request, reply) {
  const { name, email, password, companyId } = request.body;

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      request.log.error('Error checking for existing user:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (existingUser) {
      return reply.code(400).send({ msg: 'User already exists' });
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
      request.log.error('Error creating user:', createError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: newUser.id,
        companyId: newUser.company_id,
        isAdmin: newUser.is_admin,
      },
    };

    // Generate Paseto token
    const token = await pasetoService.generateToken(payload);

    // Store token in Redis for validation
    await pasetoService.storeToken(token, {
      userId: newUser.id,
      companyId: newUser.company_id,
      isAdmin: newUser.is_admin,
    });

    return reply.send({ token });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

// Login a user
async function login(request, reply) {
  const { email, password } = request.body;

  try {
    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      request.log.error('Error finding user:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!user) {
      return reply.code(400).send({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.code(400).send({ msg: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        companyId: user.company_id,
        isAdmin: user.is_admin,
      },
    };

    // Generate Paseto token
    const token = await pasetoService.generateToken(payload);

    // Store token in Redis for validation
    await pasetoService.storeToken(token, {
      userId: user.id,
      companyId: user.company_id,
      isAdmin: user.is_admin,
    });

    return reply.send({ token });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

// Get user data
async function getUser(request, reply) {
  try {
    // Find user by ID
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, company_id, is_admin, created_at')
      .eq('id', request.user.id)
      .single();

    if (error) {
      request.log.error('Error finding user:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!user) {
      return reply.code(404).send({ msg: 'User not found' });
    }

    return reply.send(user);
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

export { register, login, getUser };

export default {
  register,
  login,
  getUser,
};
