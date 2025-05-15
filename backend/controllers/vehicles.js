import { validationResult } from 'express-validator';
import supabase from '../config/supabase.js';

// @desc    Get all vehicles for the company
// @route   GET /api/vehicles
// @access  Private
exports.getAllVehicles = async (req, res) => {
  try {
    // Get vehicles for the company from Supabase
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('company_id', req.user.companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json(vehicles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicleById = async (req, res) => {
  try {
    // Get vehicle by ID from Supabase
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', req.params.id)
      .eq('company_id', req.user.companyId)
      .single();

    if (error) {
      console.error('Error fetching vehicle:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private
exports.createVehicle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, type, license_plate, vin, make, model, year, status, max_weight } = req.body;

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
          company_id: req.user.companyId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating vehicle:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.status(201).json(newVehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
exports.updateVehicle = async (req, res) => {
  try {
    // Check if vehicle exists and belongs to the company
    const { data: existingVehicle, error: checkError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', req.params.id)
      .eq('company_id', req.user.companyId)
      .single();

    if (checkError) {
      console.error('Error checking for existing vehicle:', checkError);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (!existingVehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }

    // Update vehicle
    const { data: updatedVehicle, error } = await supabase
      .from('vehicles')
      .update({
        ...req.body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('company_id', req.user.companyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating vehicle:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json(updatedVehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
exports.deleteVehicle = async (req, res) => {
  try {
    // Check if vehicle exists and belongs to the company
    const { data: existingVehicle, error: checkError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', req.params.id)
      .eq('company_id', req.user.companyId)
      .single();

    if (checkError) {
      console.error('Error checking for existing vehicle:', checkError);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (!existingVehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }

    // Delete vehicle
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', req.params.id)
      .eq('company_id', req.user.companyId);

    if (error) {
      console.error('Error deleting vehicle:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json({ msg: 'Vehicle removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
