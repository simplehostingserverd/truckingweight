import supabase from '../../config/supabase.js';

/**
 * Get all loads for the company
 */
async function getAllLoads(request, reply) {
  try {
    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', request.user.id)
      .single();

    if (userError) {
      request.log.error('Error fetching user data:', userError);
      return reply.code(500).send({ message: 'Server error', error: userError.message });
    }

    // Get loads for the company with vehicle and driver info
    const { data: loads, error } = await supabase
      .from('loads')
      .select(
        `
        id, 
        description, 
        origin, 
        destination, 
        weight, 
        status, 
        pickup_date, 
        delivery_date, 
        created_at,
        updated_at,
        vehicles(id, name, license_plate), 
        drivers(id, name, license_number)
      `
      )
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false });

    if (error) {
      request.log.error('Error fetching loads:', error);
      return reply.code(500).send({ message: 'Server error', error: error.message });
    }

    return reply.send(loads);
  } catch (err) {
    request.log.error('Error in getAllLoads:', err);
    return reply.code(500).send({ message: 'Server error' });
  }
}

/**
 * Get load by ID
 */
async function getLoadById(request, reply) {
  try {
    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', request.user.id)
      .single();

    if (userError) {
      request.log.error('Error fetching user data:', userError);
      return reply.code(500).send({ message: 'Server error', error: userError.message });
    }

    // Get load with vehicle and driver info
    const { data: load, error } = await supabase
      .from('loads')
      .select(
        `
        id, 
        description, 
        origin, 
        destination, 
        weight, 
        status, 
        pickup_date, 
        delivery_date, 
        created_at,
        updated_at,
        vehicles(id, name, license_plate), 
        drivers(id, name, license_number)
      `
      )
      .eq('id', request.params.id)
      .eq('company_id', userData.company_id)
      .single();

    if (error) {
      request.log.error('Error fetching load:', error);
      return reply.code(500).send({ message: 'Server error', error: error.message });
    }

    if (!load) {
      return reply.code(404).send({ message: 'Load not found' });
    }

    return reply.send(load);
  } catch (err) {
    request.log.error('Error in getLoadById:', err);
    return reply.code(500).send({ message: 'Server error' });
  }
}

/**
 * Create a new load
 */
async function createLoad(request, reply) {
  const {
    description,
    origin,
    destination,
    weight,
    vehicle_id,
    driver_id,
    pickup_date,
    delivery_date,
    status = 'pending',
  } = request.body;

  try {
    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', request.user.id)
      .single();

    if (userError) {
      request.log.error('Error fetching user data:', userError);
      return reply.code(500).send({ message: 'Server error', error: userError.message });
    }

    // Create load
    const { data: load, error } = await supabase
      .from('loads')
      .insert([
        {
          description,
          origin,
          destination,
          weight,
          vehicle_id,
          driver_id,
          pickup_date,
          delivery_date,
          status,
          company_id: userData.company_id,
        },
      ])
      .select()
      .single();

    if (error) {
      request.log.error('Error creating load:', error);
      return reply.code(500).send({ message: 'Server error', error: error.message });
    }

    return reply.code(201).send(load);
  } catch (err) {
    request.log.error('Error in createLoad:', err);
    return reply.code(500).send({ message: 'Server error' });
  }
}

/**
 * Update a load
 */
async function updateLoad(request, reply) {
  const {
    description,
    origin,
    destination,
    weight,
    vehicle_id,
    driver_id,
    pickup_date,
    delivery_date,
    status,
  } = request.body;

  try {
    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', request.user.id)
      .single();

    if (userError) {
      request.log.error('Error fetching user data:', userError);
      return reply.code(500).send({ message: 'Server error', error: userError.message });
    }

    // Check if load exists and belongs to the company
    const { data: existingLoad, error: loadError } = await supabase
      .from('loads')
      .select('id')
      .eq('id', request.params.id)
      .eq('company_id', userData.company_id)
      .single();

    if (loadError || !existingLoad) {
      return reply.code(404).send({ message: 'Load not found' });
    }

    // Update load
    const { data: load, error } = await supabase
      .from('loads')
      .update({
        description,
        origin,
        destination,
        weight,
        vehicle_id,
        driver_id,
        pickup_date,
        delivery_date,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.params.id)
      .eq('company_id', userData.company_id)
      .select()
      .single();

    if (error) {
      request.log.error('Error updating load:', error);
      return reply.code(500).send({ message: 'Server error', error: error.message });
    }

    return reply.send(load);
  } catch (err) {
    request.log.error('Error in updateLoad:', err);
    return reply.code(500).send({ message: 'Server error' });
  }
}

/**
 * Delete a load
 */
async function deleteLoad(request, reply) {
  try {
    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', request.user.id)
      .single();

    if (userError) {
      request.log.error('Error fetching user data:', userError);
      return reply.code(500).send({ message: 'Server error', error: userError.message });
    }

    // Check if load exists and belongs to the company
    const { data: existingLoad, error: loadError } = await supabase
      .from('loads')
      .select('id')
      .eq('id', request.params.id)
      .eq('company_id', userData.company_id)
      .single();

    if (loadError || !existingLoad) {
      return reply.code(404).send({ message: 'Load not found' });
    }

    // Delete load
    const { error } = await supabase
      .from('loads')
      .delete()
      .eq('id', request.params.id)
      .eq('company_id', userData.company_id);

    if (error) {
      request.log.error('Error deleting load:', error);
      return reply.code(500).send({ message: 'Server error', error: error.message });
    }

    return reply.send({ message: 'Load removed' });
  } catch (err) {
    request.log.error('Error in deleteLoad:', err);
    return reply.code(500).send({ message: 'Server error' });
  }
}

export default {
  getAllLoads,
  getLoadById,
  createLoad,
  updateLoad,
  deleteLoad,
};
