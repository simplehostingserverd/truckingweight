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


import { validationResult } from 'express-validator';
import supabase from '../config/supabase.js';

// @desc    Get all weights for the company
// @route   GET /api/weights
// @access  Private
export const getAllWeights = async (req, res) => {
  try {
    // Get weights for the company from Supabase
    const { data: weights, error } = await supabase
      .from('weights')
      .select('*')
      .eq('company_id', req.user.companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching weights:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json(weights);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get weight by ID
// @route   GET /api/weights/:id
// @access  Private
export const getWeightById = async (req, res) => {
  try {
    // Find weight by ID
    const { data: weight, error } = await supabase
      .from('weights')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error('Error fetching weight:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Check if weight exists
    if (!weight) {
      return res.status(404).json({ msg: 'Weight entry not found' });
    }

    // Check if weight belongs to user's company
    if (weight.company_id !== req.user.companyId) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    res.json(weight);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create a new weight entry
// @route   POST /api/weights
// @access  Private
export const createWeight = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { vehicle, weight, date, time, driver } = req.body;

    // Determine status based on weight value
    let status = 'Compliant';
    const numericWeight = parseInt(weight.replace(/[^\d]/g, ''));
    if (numericWeight > 36000) {
      status = 'Non-Compliant';
    } else if (numericWeight > 34000) {
      status = 'Warning';
    }

    // Create new weight entry
    const { data: newWeight, error } = await supabase
      .from('weights')
      .insert([
        {
          vehicle,
          weight,
          date,
          time: time || new Date().toLocaleTimeString(),
          driver,
          status,
          company_id: req.user.companyId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating weight entry:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json(newWeight);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update a weight entry
// @route   PUT /api/weights/:id
// @access  Private
export const updateWeight = async (req, res) => {
  try {
    // First, check if the weight exists and belongs to the user's company
    const { data: existingWeight, error: fetchError } = await supabase
      .from('weights')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError) {
      console.error('Error fetching weight:', fetchError);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Check if weight exists
    if (!existingWeight) {
      return res.status(404).json({ msg: 'Weight entry not found' });
    }

    // Check if weight belongs to user's company
    if (existingWeight.company_id !== req.user.companyId) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Prepare update data
    const updateData = { ...req.body };

    // Ensure company_id doesn't change
    delete updateData.company_id;

    // Determine status based on weight value if weight is updated
    if (req.body.weight) {
      const numericWeight = parseInt(req.body.weight.replace(/[^\d]/g, ''));
      if (numericWeight > 36000) {
        updateData.status = 'Non-Compliant';
      } else if (numericWeight > 34000) {
        updateData.status = 'Warning';
      } else {
        updateData.status = 'Compliant';
      }
    }

    // Update weight entry
    const { data: updatedWeight, error: updateError } = await supabase
      .from('weights')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating weight:', updateError);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json(updatedWeight);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete a weight entry
// @route   DELETE /api/weights/:id
// @access  Private
export const deleteWeight = async (req, res) => {
  try {
    // First, check if the weight exists and belongs to the user's company
    const { data: existingWeight, error: fetchError } = await supabase
      .from('weights')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError) {
      console.error('Error fetching weight:', fetchError);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Check if weight exists
    if (!existingWeight) {
      return res.status(404).json({ msg: 'Weight entry not found' });
    }

    // Check if weight belongs to user's company
    if (existingWeight.company_id !== req.user.companyId) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Delete weight entry
    const { error: deleteError } = await supabase.from('weights').delete().eq('id', req.params.id);

    if (deleteError) {
      console.error('Error deleting weight:', deleteError);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json({ msg: 'Weight entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
