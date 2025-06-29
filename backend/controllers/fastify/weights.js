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

import supabase from '../../config/supabase.js';

// Get all weights for the company
async function getAllWeights(request, reply) {
  try {
    // Get weights for the company from Supabase
    const { data: weights, error } = await supabase
      .from('weights')
      .select('*')
      .eq('company_id', request.user.companyId)
      .order('created_at', { ascending: false });

    if (error) {
      request.log.error('Error fetching weights:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(weights);
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

// Get weight by ID
async function getWeightById(request, reply) {
  try {
    // Find weight by ID
    const { data: weight, error } = await supabase
      .from('weights')
      .select('*')
      .eq('id', request.params.id)
      .single();

    if (error) {
      request.log.error('Error fetching weight:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Check if weight exists
    if (!weight) {
      return reply.code(404).send({ msg: 'Weight entry not found' });
    }

    // Check if weight belongs to user's company
    if (weight.company_id !== request.user.companyId) {
      return reply.code(403).send({ msg: 'Access denied' });
    }

    return reply.send(weight);
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

// Create a new weight entry
async function createWeight(request, reply) {
  try {
    const { vehicle, weight, date, time, driver } = request.body;

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
          company_id: request.user.companyId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      request.log.error('Error creating weight entry:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(newWeight);
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

// Update a weight entry
async function updateWeight(request, reply) {
  try {
    // First, check if the weight exists and belongs to the user's company
    const { data: existingWeight, error: fetchError } = await supabase
      .from('weights')
      .select('*')
      .eq('id', request.params.id)
      .single();

    if (fetchError) {
      request.log.error('Error fetching weight:', fetchError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Check if weight exists
    if (!existingWeight) {
      return reply.code(404).send({ msg: 'Weight entry not found' });
    }

    // Check if weight belongs to user's company
    if (existingWeight.company_id !== request.user.companyId) {
      return reply.code(403).send({ msg: 'Access denied' });
    }

    // Prepare update data
    const updateData = { ...request.body };

    // Ensure company_id doesn't change
    delete updateData.company_id;

    // Determine status based on weight value if weight is updated
    if (request.body.weight) {
      const numericWeight = parseInt(request.body.weight.replace(/[^\d]/g, ''));
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
      .eq('id', request.params.id)
      .select()
      .single();

    if (updateError) {
      request.log.error('Error updating weight:', updateError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(updatedWeight);
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

// Delete a weight entry
async function deleteWeight(request, reply) {
  try {
    // First, check if the weight exists and belongs to the user's company
    const { data: existingWeight, error: fetchError } = await supabase
      .from('weights')
      .select('*')
      .eq('id', request.params.id)
      .single();

    if (fetchError) {
      request.log.error('Error fetching weight:', fetchError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Check if weight exists
    if (!existingWeight) {
      return reply.code(404).send({ msg: 'Weight entry not found' });
    }

    // Check if weight belongs to user's company
    if (existingWeight.company_id !== request.user.companyId) {
      return reply.code(403).send({ msg: 'Access denied' });
    }

    // Delete weight entry
    const { error: deleteError } = await supabase
      .from('weights')
      .delete()
      .eq('id', request.params.id);

    if (deleteError) {
      request.log.error('Error deleting weight:', deleteError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send({ msg: 'Weight entry removed' });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

export { getAllWeights, getWeightById, createWeight, updateWeight, deleteWeight };

export default {
  getAllWeights,
  getWeightById,
  createWeight,
  updateWeight,
  deleteWeight,
};
