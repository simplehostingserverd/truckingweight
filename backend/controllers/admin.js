const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardData = async (req, res) => {
  try {
    // Get counts for various entities
    const [
      { count: userCount, error: userError },
      { count: companyCount, error: companyError },
      { count: vehicleCount, error: vehicleError },
      { count: driverCount, error: driverError },
      { count: weightCount, error: weightError },
      { count: loadCount, error: loadError }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('vehicles').select('*', { count: 'exact', head: true }),
      supabase.from('drivers').select('*', { count: 'exact', head: true }),
      supabase.from('weights').select('*', { count: 'exact', head: true }),
      supabase.from('loads').select('*', { count: 'exact', head: true })
    ]);

    if (userError || companyError || vehicleError || driverError || weightError || loadError) {
      console.error('Error fetching dashboard data:', userError || companyError || vehicleError || driverError || weightError || loadError);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Get recent users
    const { data: recentUsers, error: recentUsersError } = await supabase
      .from('users')
      .select('id, name, email, company_id, is_admin, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentUsersError) {
      console.error('Error fetching recent users:', recentUsersError);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Get recent weights
    const { data: recentWeights, error: recentWeightsError } = await supabase
      .from('weights')
      .select('id, vehicle_id, weight, date, status, company_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentWeightsError) {
      console.error('Error fetching recent weights:', recentWeightsError);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Get compliance stats
    const { data: complianceStats, error: complianceError } = await supabase
      .from('weights')
      .select('status')
      .order('created_at', { ascending: false });

    if (complianceError) {
      console.error('Error fetching compliance stats:', complianceError);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Calculate compliance percentages
    const totalWeights = complianceStats.length;
    const compliantCount = complianceStats.filter(w => w.status === 'Compliant').length;
    const warningCount = complianceStats.filter(w => w.status === 'Warning').length;
    const nonCompliantCount = complianceStats.filter(w => w.status === 'Non-Compliant').length;

    const compliancePercentage = totalWeights > 0 ? Math.round((compliantCount / totalWeights) * 100) : 0;
    const warningPercentage = totalWeights > 0 ? Math.round((warningCount / totalWeights) * 100) : 0;
    const nonCompliantPercentage = totalWeights > 0 ? Math.round((nonCompliantCount / totalWeights) * 100) : 0;

    res.json({
      counts: {
        users: userCount,
        companies: companyCount,
        vehicles: vehicleCount,
        drivers: driverCount,
        weights: weightCount,
        loads: loadCount
      },
      recentUsers,
      recentWeights,
      compliance: {
        compliant: compliancePercentage,
        warning: warningPercentage,
        nonCompliant: nonCompliantPercentage
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    // Get all users from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, company_id, is_admin, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, companyId, isAdmin } = req.body;

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', checkError);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
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
          is_admin: isAdmin
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, companyId, isAdmin, password } = req.body;
    
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (checkError) {
      console.error('Error checking for existing user:', checkError);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (!existingUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Prepare update data
    const updateData = {
      name: name || existingUser.name,
      email: email || existingUser.email,
      company_id: companyId || existingUser.company_id,
      is_admin: isAdmin !== undefined ? isAdmin : existingUser.is_admin,
      updated_at: new Date().toISOString()
    };

    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Update user
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (checkError) {
      console.error('Error checking for existing user:', checkError);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (!existingUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
