const { validationResult } = require('express-validator');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * @desc    Get all loads for the company
 * @route   GET /api/loads
 * @access  Private
 */
exports.getAllLoads = async (req, res) => {
  try {
    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', req.user.id)
      .single();

    if (userError) {
      return res.status(500).json({ message: 'Server error', error: userError.message });
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
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.json(loads);
  } catch (err) {
    console.error('Error in getAllLoads:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get load by ID
 * @route   GET /api/loads/:id
 * @access  Private
 */
exports.getLoadById = async (req, res) => {
  try {
    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', req.user.id)
      .single();

    if (userError) {
      return res.status(500).json({ message: 'Server error', error: userError.message });
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
      .eq('id', req.params.id)
      .eq('company_id', userData.company_id)
      .single();

    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    res.json(load);
  } catch (err) {
    console.error('Error in getLoadById:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Create a new load
 * @route   POST /api/loads
 * @access  Private
 */
exports.createLoad = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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
  } = req.body;

  try {
    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', req.user.id)
      .single();

    if (userError) {
      return res.status(500).json({ message: 'Server error', error: userError.message });
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
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.status(201).json(load);
  } catch (err) {
    console.error('Error in createLoad:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update a load
 * @route   PUT /api/loads/:id
 * @access  Private
 */
exports.updateLoad = async (req, res) => {
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
  } = req.body;

  try {
    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', req.user.id)
      .single();

    if (userError) {
      return res.status(500).json({ message: 'Server error', error: userError.message });
    }

    // Check if load exists and belongs to the company
    const { data: existingLoad, error: loadError } = await supabase
      .from('loads')
      .select('id')
      .eq('id', req.params.id)
      .eq('company_id', userData.company_id)
      .single();

    if (loadError || !existingLoad) {
      return res.status(404).json({ message: 'Load not found' });
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
      .eq('id', req.params.id)
      .eq('company_id', userData.company_id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.json(load);
  } catch (err) {
    console.error('Error in updateLoad:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete a load
 * @route   DELETE /api/loads/:id
 * @access  Private
 */
exports.deleteLoad = async (req, res) => {
  try {
    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', req.user.id)
      .single();

    if (userError) {
      return res.status(500).json({ message: 'Server error', error: userError.message });
    }

    // Check if load exists and belongs to the company
    const { data: existingLoad, error: loadError } = await supabase
      .from('loads')
      .select('id')
      .eq('id', req.params.id)
      .eq('company_id', userData.company_id)
      .single();

    if (loadError || !existingLoad) {
      return res.status(404).json({ message: 'Load not found' });
    }

    // Delete load
    const { error } = await supabase
      .from('loads')
      .delete()
      .eq('id', req.params.id)
      .eq('company_id', userData.company_id);

    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.json({ message: 'Load removed' });
  } catch (err) {
    console.error('Error in deleteLoad:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
