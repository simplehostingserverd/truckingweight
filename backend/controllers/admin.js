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

// @desc    Get weight reports
// @route   GET /api/admin/reports/weights
// @access  Private/Admin
exports.getWeightReports = async (req, res) => {
  try {
    // Get weight data with aggregations
    const { data: weights, error } = await supabase
      .from('weights')
      .select(`
        id,
        weight,
        date,
        status,
        company_id,
        vehicles(id, name),
        drivers(id, name)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching weight reports:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Get company data for reference
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Process data for reporting
    const companyMap = {};
    companies.forEach(company => {
      companyMap[company.id] = company.name;
    });

    // Group weights by company
    const weightsByCompany = {};
    weights.forEach(weight => {
      const companyId = weight.company_id;
      const companyName = companyMap[companyId] || 'Unknown';

      if (!weightsByCompany[companyName]) {
        weightsByCompany[companyName] = {
          total: 0,
          compliant: 0,
          nonCompliant: 0,
          weights: []
        };
      }

      weightsByCompany[companyName].total++;
      if (weight.status === 'Compliant') {
        weightsByCompany[companyName].compliant++;
      } else if (weight.status === 'Non-Compliant') {
        weightsByCompany[companyName].nonCompliant++;
      }

      weightsByCompany[companyName].weights.push(weight);
    });

    res.json({
      weightsByCompany,
      totalWeights: weights.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get load reports
// @route   GET /api/admin/reports/loads
// @access  Private/Admin
exports.getLoadReports = async (req, res) => {
  try {
    // Get load data with aggregations
    const { data: loads, error } = await supabase
      .from('loads')
      .select(`
        id,
        description,
        origin,
        destination,
        weight,
        status,
        pickup_date,
        delivery_date,
        company_id,
        vehicles(id, name),
        drivers(id, name)
      `)
      .order('pickup_date', { ascending: false });

    if (error) {
      console.error('Error fetching load reports:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Get company data for reference
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Process data for reporting
    const companyMap = {};
    companies.forEach(company => {
      companyMap[company.id] = company.name;
    });

    // Group loads by company
    const loadsByCompany = {};
    loads.forEach(load => {
      const companyId = load.company_id;
      const companyName = companyMap[companyId] || 'Unknown';

      if (!loadsByCompany[companyName]) {
        loadsByCompany[companyName] = {
          total: 0,
          pending: 0,
          inTransit: 0,
          delivered: 0,
          loads: []
        };
      }

      loadsByCompany[companyName].total++;
      if (load.status === 'pending') {
        loadsByCompany[companyName].pending++;
      } else if (load.status === 'in-transit') {
        loadsByCompany[companyName].inTransit++;
      } else if (load.status === 'delivered') {
        loadsByCompany[companyName].delivered++;
      }

      loadsByCompany[companyName].loads.push(load);
    });

    res.json({
      loadsByCompany,
      totalLoads: loads.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get compliance reports
// @route   GET /api/admin/reports/compliance
// @access  Private/Admin
exports.getComplianceReports = async (req, res) => {
  try {
    // Get weight data for compliance analysis
    const { data: weights, error } = await supabase
      .from('weights')
      .select(`
        id,
        weight,
        date,
        status,
        company_id,
        vehicles(id, name),
        drivers(id, name)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching compliance data:', error);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Get company data for reference
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      return res.status(500).json({ msg: 'Server error' });
    }

    // Process data for compliance reporting
    const companyMap = {};
    companies.forEach(company => {
      companyMap[company.id] = company.name;
    });

    // Calculate compliance metrics
    const complianceByCompany = {};
    weights.forEach(weight => {
      const companyId = weight.company_id;
      const companyName = companyMap[companyId] || 'Unknown';

      if (!complianceByCompany[companyName]) {
        complianceByCompany[companyName] = {
          total: 0,
          compliant: 0,
          warning: 0,
          nonCompliant: 0
        };
      }

      complianceByCompany[companyName].total++;
      if (weight.status === 'Compliant') {
        complianceByCompany[companyName].compliant++;
      } else if (weight.status === 'Warning') {
        complianceByCompany[companyName].warning++;
      } else if (weight.status === 'Non-Compliant') {
        complianceByCompany[companyName].nonCompliant++;
      }
    });

    // Calculate percentages
    Object.keys(complianceByCompany).forEach(company => {
      const data = complianceByCompany[company];
      data.complianceRate = data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0;
      data.warningRate = data.total > 0 ? Math.round((data.warning / data.total) * 100) : 0;
      data.nonComplianceRate = data.total > 0 ? Math.round((data.nonCompliant / data.total) * 100) : 0;
    });

    res.json({
      complianceByCompany,
      totalWeights: weights.length,
      overallCompliance: {
        total: weights.length,
        compliant: weights.filter(w => w.status === 'Compliant').length,
        warning: weights.filter(w => w.status === 'Warning').length,
        nonCompliant: weights.filter(w => w.status === 'Non-Compliant').length
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Export data (CSV, PDF)
// @route   GET /api/admin/export/:type
// @access  Private/Admin
exports.exportData = async (req, res) => {
  try {
    const { type } = req.params;
    const { entity, format } = req.query;

    if (!entity || !['weights', 'loads', 'vehicles', 'drivers', 'users', 'companies'].includes(entity)) {
      return res.status(400).json({ msg: 'Invalid entity type' });
    }

    if (!format || !['csv', 'pdf', 'excel'].includes(format)) {
      return res.status(400).json({ msg: 'Invalid export format' });
    }

    // Get data for the requested entity
    const { data, error } = await supabase
      .from(entity)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching ${entity} for export:`, error);
      return res.status(500).json({ msg: 'Server error' });
    }

    // For now, just return the data as JSON
    // In a real implementation, you would format the data as CSV, PDF, or Excel
    // and set the appropriate headers for file download
    res.json({
      message: `Export of ${entity} as ${format} would be generated here`,
      data
    });

    // Example of how you might implement CSV export:
    /*
    if (format === 'csv') {
      const fields = Object.keys(data[0] || {});
      const csv = json2csv({ data, fields });

      res.setHeader('Content-disposition', `attachment; filename=${entity}-export.csv`);
      res.set('Content-Type', 'text/csv');
      return res.status(200).send(csv);
    }
    */

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
