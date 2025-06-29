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

import { validationResult } from 'express-validator';
import supabase from '../config/supabase.js';

// @desc    Get all drivers for the company
// @route   GET /api/drivers
// @access  Private
export const getAllDrivers = async (req, res) => {
  try {
    // Get drivers for the company from Supabase
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('company_id', req.user.companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching drivers:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json(drivers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get driver by ID
// @route   GET /api/drivers/:id
// @access  Private
export const getDriverById = async (req, res) => {
  try {
    // Get driver by ID from Supabase
    const { data: driver, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', req.params.id)
      .eq('company_id', req.user.companyId)
      .single();

    if (error) {
      console.error('Error fetching driver:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (!driver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }

    res.json(driver);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create a new driver
// @route   POST /api/drivers
// @access  Private
export const createDriver = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, license_number, license_expiry, phone, email, status } = req.body;

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
          company_id: req.user.companyId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating driver:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.status(201).json(newDriver);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update a driver
// @route   PUT /api/drivers/:id
// @access  Private
export const updateDriver = async (req, res) => {
  try {
    // Check if driver exists and belongs to the company
    const { data: existingDriver, error: checkError } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', req.params.id)
      .eq('company_id', req.user.companyId)
      .single();

    if (checkError) {
      console.error('Error checking for existing driver:', checkError);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (!existingDriver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }

    // Update driver
    const { data: updatedDriver, error } = await supabase
      .from('drivers')
      .update({
        ...req.body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('company_id', req.user.companyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating driver:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json(updatedDriver);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete a driver
// @route   DELETE /api/drivers/:id
// @access  Private
export const deleteDriver = async (req, res) => {
  try {
    // Check if driver exists and belongs to the company
    const { data: existingDriver, error: checkError } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', req.params.id)
      .eq('company_id', req.user.companyId)
      .single();

    if (checkError) {
      console.error('Error checking for existing driver:', checkError);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (!existingDriver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }

    // Delete driver
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', req.params.id)
      .eq('company_id', req.user.companyId);

    if (error) {
      console.error('Error deleting driver:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json({ msg: 'Driver removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
