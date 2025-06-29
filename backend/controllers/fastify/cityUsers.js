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

/**
 * City Users Controller
 * Handles CRUD operations for city users
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY
);

/**
 * Get all city users
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function getAllCityUsers(request, reply) {
  try {
    const cityId = request.user.cityId;
    const { limit = 50, offset = 0, role, status } = request.query;

    // Build query
    let query = supabase.from('city_users').select('*', { count: 'exact' }).eq('city_id', cityId);

    // Add filters
    if (role) {
      query = query.eq('role', role);
    }

    if (status) {
      query = query.eq('is_active', status === 'active');
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    // Execute query
    const { data: users, count, error } = await query;

    if (error) {
      request.log.error('Error fetching city users:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Format users for response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      city_id: user.city_id,
      role: user.role,
      status: user.is_active ? 'active' : 'inactive',
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
    }));

    return reply.code(200).send({ users: formattedUsers, count });
  } catch (err) {
    request.log.error('Server error in getAllCityUsers:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Get city user by ID
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function getCityUserById(request, reply) {
  try {
    const cityId = request.user.cityId;
    const userId = request.params.id;

    // Get user from database
    const { data: user, error } = await supabase
      .from('city_users')
      .select('*')
      .eq('id', userId)
      .eq('city_id', cityId)
      .single();

    if (error) {
      request.log.error('Error fetching city user:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!user) {
      return reply.code(404).send({ msg: 'User not found' });
    }

    // Format user for response
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      city_id: user.city_id,
      role: user.role,
      status: user.is_active ? 'active' : 'inactive',
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
    };

    return reply.code(200).send({ user: formattedUser });
  } catch (err) {
    request.log.error('Server error in getCityUserById:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Create a new city user
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function createCityUser(request, reply) {
  try {
    const cityId = request.user.cityId;
    const { name, email, password, role } = request.body;

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('city_users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      request.log.error('Error checking for existing user:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (existingUser) {
      return reply.code(400).send({ msg: 'Email already in use' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        city_id: cityId,
        role,
        user_type: 'city',
      },
    });

    if (authError) {
      request.log.error('Error creating city user in auth:', authError);
      return reply.code(500).send({ msg: 'Error creating user' });
    }

    // Create city user record
    const userId = authData.user.id;
    const { data: newUser, error: createError } = await supabase
      .from('city_users')
      .insert([
        {
          id: userId,
          name,
          email,
          city_id: cityId,
          role,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (createError) {
      request.log.error('Error creating city user record:', createError);
      return reply.code(500).send({ msg: 'Error creating user record' });
    }

    // Format user for response
    const formattedUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      city_id: newUser.city_id,
      role: newUser.role,
      status: newUser.is_active ? 'active' : 'inactive',
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    };

    return reply.code(201).send({
      user: formattedUser,
      msg: 'User created successfully',
    });
  } catch (err) {
    request.log.error('Server error in createCityUser:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Update a city user
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function updateCityUser(request, reply) {
  try {
    const cityId = request.user.cityId;
    const userId = request.params.id;
    const { name, email, role, status } = request.body;

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('city_users')
      .select('*')
      .eq('id', userId)
      .eq('city_id', cityId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing user:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingUser) {
      return reply.code(404).send({ msg: 'User not found' });
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status !== undefined) updateData.is_active = status === 'active';
    updateData.updated_at = new Date().toISOString();

    // Update user record
    const { data: updatedUser, error: updateError } = await supabase
      .from('city_users')
      .update(updateData)
      .eq('id', userId)
      .eq('city_id', cityId)
      .select()
      .single();

    if (updateError) {
      request.log.error('Error updating city user:', updateError);
      return reply.code(500).send({ msg: 'Error updating user' });
    }

    // Update user metadata in Auth if needed
    if (name || email || role) {
      const authUpdateData = { data: {} };
      if (name) authUpdateData.data.name = name;
      if (role) authUpdateData.data.role = role;
      if (email) authUpdateData.email = email;

      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        userId,
        authUpdateData
      );

      if (authUpdateError) {
        request.log.error('Error updating user in auth:', authUpdateError);
        // Continue anyway as the main record was updated
      }
    }

    // Format user for response
    const formattedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      city_id: updatedUser.city_id,
      role: updatedUser.role,
      status: updatedUser.is_active ? 'active' : 'inactive',
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
      last_login: updatedUser.last_login,
    };

    return reply.code(200).send({
      user: formattedUser,
      msg: 'User updated successfully',
    });
  } catch (err) {
    request.log.error('Server error in updateCityUser:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Delete a city user
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function deleteCityUser(request, reply) {
  try {
    const cityId = request.user.cityId;
    const userId = request.params.id;

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('city_users')
      .select('id')
      .eq('id', userId)
      .eq('city_id', cityId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing user:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingUser) {
      return reply.code(404).send({ msg: 'User not found' });
    }

    // Delete user from database
    const { error: deleteError } = await supabase
      .from('city_users')
      .delete()
      .eq('id', userId)
      .eq('city_id', cityId);

    if (deleteError) {
      request.log.error('Error deleting city user:', deleteError);
      return reply.code(500).send({ msg: 'Error deleting user' });
    }

    // Delete user from Auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      request.log.error('Error deleting user from auth:', authDeleteError);
      // Continue anyway as the main record was deleted
    }

    return reply.code(200).send({ msg: 'User deleted successfully' });
  } catch (err) {
    request.log.error('Server error in deleteCityUser:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

export { getAllCityUsers, getCityUserById, createCityUser, updateCityUser, deleteCityUser };

export default {
  getAllCityUsers,
  getCityUserById,
  createCityUser,
  updateCityUser,
  deleteCityUser,
};
