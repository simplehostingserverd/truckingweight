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

import supabase from '../../config/supabase.js';

/**
 * Get all drivers for the company
 */
async function getAllDrivers(request, reply) {
  try {
    // Get drivers for the company from Supabase
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('company_id', request.user.companyId)
      .order('created_at', { ascending: false });

    if (error) {
      request.log.error('Error fetching drivers:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(drivers);
  } catch (err) {
    request.log.error('Error in getAllDrivers:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Get driver by ID
 */
async function getDriverById(request, reply) {
  try {
    // Get driver by ID from Supabase
    const { data: driver, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (error) {
      request.log.error('Error fetching driver:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!driver) {
      return reply.code(404).send({ msg: 'Driver not found' });
    }

    return reply.send(driver);
  } catch (err) {
    request.log.error('Error in getDriverById:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Create a new driver
 */
async function createDriver(request, reply) {
  try {
    const { name, license_number, license_expiry, phone, email, status } = request.body;

    // Create new driver
    const { data: newDriver, error } = await supabase
      .from('drivers')
      .insert([
        {
          name,
          license_number,
          license_expiry,
          phone,
          email,
          status: status || 'Active',
          company_id: request.user.companyId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      request.log.error('Error creating driver:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.code(201).send(newDriver);
  } catch (err) {
    request.log.error('Error in createDriver:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Update a driver
 */
async function updateDriver(request, reply) {
  try {
    // Check if driver exists and belongs to the company
    const { data: existingDriver, error: checkError } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing driver:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingDriver) {
      return reply.code(404).send({ msg: 'Driver not found' });
    }

    // Update driver
    const { data: updatedDriver, error } = await supabase
      .from('drivers')
      .update({
        ...request.body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .select()
      .single();

    if (error) {
      request.log.error('Error updating driver:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(updatedDriver);
  } catch (err) {
    request.log.error('Error in updateDriver:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Delete a driver
 */
async function deleteDriver(request, reply) {
  try {
    // Check if driver exists and belongs to the company
    const { data: existingDriver, error: checkError } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing driver:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingDriver) {
      return reply.code(404).send({ msg: 'Driver not found' });
    }

    // Delete driver
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId);

    if (error) {
      request.log.error('Error deleting driver:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send({ msg: 'Driver removed' });
  } catch (err) {
    request.log.error('Error in deleteDriver:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

export { getAllDrivers, getDriverById, createDriver, updateDriver, deleteDriver };

export default {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
};
