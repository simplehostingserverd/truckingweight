import supabase from '../../config/supabase.js';

/**
 * Get all vehicles for the company
 */
async function getAllVehicles(request, reply) {
  try {
    // Get vehicles for the company from Supabase
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('company_id', request.user.companyId)
      .order('created_at', { ascending: false });

    if (error) {
      request.log.error('Error fetching vehicles:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(vehicles);
  } catch (err) {
    request.log.error('Error in getAllVehicles:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Get vehicle by ID
 */
async function getVehicleById(request, reply) {
  try {
    // Get vehicle by ID from Supabase
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (error) {
      request.log.error('Error fetching vehicle:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!vehicle) {
      return reply.code(404).send({ msg: 'Vehicle not found' });
    }

    return reply.send(vehicle);
  } catch (err) {
    request.log.error('Error in getVehicleById:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Create a new vehicle
 */
async function createVehicle(request, reply) {
  try {
    const { name, type, license_plate, vin, make, model, year, status, max_weight } = request.body;

    // Create new vehicle
    const { data: newVehicle, error } = await supabase
      .from('vehicles')
      .insert([
        {
          name,
          type,
          license_plate,
          vin,
          make,
          model,
          year,
          status: status || 'Active',
          max_weight,
          company_id: request.user.companyId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      request.log.error('Error creating vehicle:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.code(201).send(newVehicle);
  } catch (err) {
    request.log.error('Error in createVehicle:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Update a vehicle
 */
async function updateVehicle(request, reply) {
  try {
    // Check if vehicle exists and belongs to the company
    const { data: existingVehicle, error: checkError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing vehicle:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingVehicle) {
      return reply.code(404).send({ msg: 'Vehicle not found' });
    }

    // Update vehicle
    const { data: updatedVehicle, error } = await supabase
      .from('vehicles')
      .update({
        ...request.body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .select()
      .single();

    if (error) {
      request.log.error('Error updating vehicle:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(updatedVehicle);
  } catch (err) {
    request.log.error('Error in updateVehicle:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Delete a vehicle
 */
async function deleteVehicle(request, reply) {
  try {
    // Check if vehicle exists and belongs to the company
    const { data: existingVehicle, error: checkError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing vehicle:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingVehicle) {
      return reply.code(404).send({ msg: 'Vehicle not found' });
    }

    // Delete vehicle
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId);

    if (error) {
      request.log.error('Error deleting vehicle:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send({ msg: 'Vehicle removed' });
  } catch (err) {
    request.log.error('Error in deleteVehicle:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

export { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };

export default {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
