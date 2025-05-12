const bcrypt = require('bcryptjs');
const supabase = require('../../config/supabase');

/**
 * Get admin dashboard data
 */
async function getDashboardData(request, reply) {
  try {
    // Get counts for various entities
    const [
      { count: userCount, error: userError },
      { count: companyCount, error: companyError },
      { count: vehicleCount, error: vehicleError },
      { count: driverCount, error: driverError },
      { count: weightCount, error: weightError },
      { count: loadCount, error: loadError },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('vehicles').select('*', { count: 'exact', head: true }),
      supabase.from('drivers').select('*', { count: 'exact', head: true }),
      supabase.from('weights').select('*', { count: 'exact', head: true }),
      supabase.from('loads').select('*', { count: 'exact', head: true }),
    ]);

    if (userError || companyError || vehicleError || driverError || weightError || loadError) {
      request.log.error(
        'Error fetching dashboard data:',
        userError || companyError || vehicleError || driverError || weightError || loadError
      );
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Get recent users
    const { data: recentUsers, error: recentUsersError } = await supabase
      .from('users')
      .select('id, name, email, company_id, is_admin, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentUsersError) {
      request.log.error('Error fetching recent users:', recentUsersError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Get recent weights
    const { data: recentWeights, error: recentWeightsError } = await supabase
      .from('weights')
      .select('id, vehicle_id, weight, date, status, company_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentWeightsError) {
      request.log.error('Error fetching recent weights:', recentWeightsError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Get compliance stats
    const { data: complianceStats, error: complianceError } = await supabase
      .from('weights')
      .select('status')
      .order('created_at', { ascending: false });

    if (complianceError) {
      request.log.error('Error fetching compliance stats:', complianceError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Calculate compliance percentages
    const totalWeights = complianceStats.length;
    const compliantCount = complianceStats.filter(w => w.status === 'Compliant').length;
    const warningCount = complianceStats.filter(w => w.status === 'Warning').length;
    const nonCompliantCount = complianceStats.filter(w => w.status === 'Non-Compliant').length;

    const compliancePercentage =
      totalWeights > 0 ? Math.round((compliantCount / totalWeights) * 100) : 0;
    const warningPercentage =
      totalWeights > 0 ? Math.round((warningCount / totalWeights) * 100) : 0;
    const nonCompliantPercentage =
      totalWeights > 0 ? Math.round((nonCompliantCount / totalWeights) * 100) : 0;

    return reply.send({
      counts: {
        users: userCount,
        companies: companyCount,
        vehicles: vehicleCount,
        drivers: driverCount,
        weights: weightCount,
        loads: loadCount,
      },
      recentUsers,
      recentWeights,
      compliance: {
        compliant: compliancePercentage,
        warning: warningPercentage,
        nonCompliant: nonCompliantPercentage,
      },
    });
  } catch (err) {
    request.log.error('Error in getDashboardData:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Get all users
 */
async function getAllUsers(request, reply) {
  try {
    // Get all users from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, company_id, is_admin, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      request.log.error('Error fetching users:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(users);
  } catch (err) {
    request.log.error('Error in getAllUsers:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Create a new user
 */
async function createUser(request, reply) {
  const { name, email, password, companyId, isAdmin } = request.body;

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      request.log.error('Error checking for existing user:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (existingUser) {
      return reply.code(400).send({ msg: 'User already exists' });
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
          is_admin: isAdmin,
        },
      ])
      .select()
      .single();

    if (createError) {
      request.log.error('Error creating user:', createError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.code(201).send(newUser);
  } catch (err) {
    request.log.error('Error in createUser:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Update a user
 */
async function updateUser(request, reply) {
  try {
    const { name, email, companyId, isAdmin, password } = request.body;

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', request.params.id)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing user:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingUser) {
      return reply.code(404).send({ msg: 'User not found' });
    }

    // Prepare update data
    const updateData = {
      name: name || existingUser.name,
      email: email || existingUser.email,
      company_id: companyId || existingUser.company_id,
      is_admin: isAdmin !== undefined ? isAdmin : existingUser.is_admin,
      updated_at: new Date().toISOString(),
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
      .eq('id', request.params.id)
      .select()
      .single();

    if (error) {
      request.log.error('Error updating user:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(updatedUser);
  } catch (err) {
    request.log.error('Error in updateUser:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Delete a user
 */
async function deleteUser(request, reply) {
  try {
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', request.params.id)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing user:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingUser) {
      return reply.code(404).send({ msg: 'User not found' });
    }

    // Delete user
    const { error } = await supabase.from('users').delete().eq('id', request.params.id);

    if (error) {
      request.log.error('Error deleting user:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send({ msg: 'User removed' });
  } catch (err) {
    request.log.error('Error in deleteUser:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Get weight reports
 */
async function getWeightReports(request, reply) {
  try {
    // Get weight data with aggregations
    const { data: weights, error } = await supabase
      .from('weights')
      .select(
        `
        id,
        weight,
        date,
        status,
        company_id,
        vehicles(id, name),
        drivers(id, name)
      `
      )
      .order('date', { ascending: false });

    if (error) {
      request.log.error('Error fetching weight reports:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Get company data for reference
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');

    if (companiesError) {
      request.log.error('Error fetching companies:', companiesError);
      return reply.code(500).send({ msg: 'Server error' });
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
          weights: [],
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

    return reply.send({
      weightsByCompany,
      totalWeights: weights.length,
    });
  } catch (err) {
    request.log.error('Error in getWeightReports:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Get load reports
 */
async function getLoadReports(request, reply) {
  try {
    // Get load data with aggregations
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
        company_id,
        vehicles(id, name),
        drivers(id, name)
      `
      )
      .order('pickup_date', { ascending: false });

    if (error) {
      request.log.error('Error fetching load reports:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Get company data for reference
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');

    if (companiesError) {
      request.log.error('Error fetching companies:', companiesError);
      return reply.code(500).send({ msg: 'Server error' });
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
          loads: [],
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

    return reply.send({
      loadsByCompany,
      totalLoads: loads.length,
    });
  } catch (err) {
    request.log.error('Error in getLoadReports:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Get compliance reports
 */
async function getComplianceReports(request, reply) {
  try {
    // Get weight data for compliance analysis
    const { data: weights, error } = await supabase
      .from('weights')
      .select(
        `
        id,
        weight,
        date,
        status,
        company_id,
        vehicles(id, name),
        drivers(id, name)
      `
      )
      .order('date', { ascending: false });

    if (error) {
      request.log.error('Error fetching compliance data:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Get company data for reference
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');

    if (companiesError) {
      request.log.error('Error fetching companies:', companiesError);
      return reply.code(500).send({ msg: 'Server error' });
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
          nonCompliant: 0,
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
      const stats = complianceByCompany[company];
      const total = stats.total;

      if (total > 0) {
        stats.compliantPercentage = Math.round((stats.compliant / total) * 100);
        stats.warningPercentage = Math.round((stats.warning / total) * 100);
        stats.nonCompliantPercentage = Math.round((stats.nonCompliant / total) * 100);
      } else {
        stats.compliantPercentage = 0;
        stats.warningPercentage = 0;
        stats.nonCompliantPercentage = 0;
      }
    });

    return reply.send({
      complianceByCompany,
      totalWeights: weights.length,
    });
  } catch (err) {
    request.log.error('Error in getComplianceReports:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Export data
 */
async function exportData(request, reply) {
  try {
    // type parameter is not used in this implementation
    const { entity, format = 'csv' } = request.query;

    if (!entity) {
      return reply.code(400).send({ msg: 'Entity parameter is required' });
    }

    let data;
    let error;

    // Fetch data based on entity type
    switch (entity) {
      case 'weights':
        ({ data, error } = await supabase.from('weights').select('*').order('date', { ascending: false }));
        break;
      case 'loads':
        ({ data, error } = await supabase.from('loads').select('*').order('pickup_date', { ascending: false }));
        break;
      case 'vehicles':
        ({ data, error } = await supabase.from('vehicles').select('*').order('name', { ascending: true }));
        break;
      case 'drivers':
        ({ data, error } = await supabase.from('drivers').select('*').order('name', { ascending: true }));
        break;
      case 'companies':
        ({ data, error } = await supabase.from('companies').select('*').order('name', { ascending: true }));
        break;
      case 'users':
        ({ data, error } = await supabase.from('users').select('id, name, email, company_id, is_admin, created_at').order('name', { ascending: true }));
        break;
      default:
        return reply.code(400).send({ msg: 'Invalid entity type' });
    }

    if (error) {
      request.log.error(`Error fetching ${entity} data:`, error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!data || data.length === 0) {
      return reply.code(404).send({ msg: 'No data found' });
    }

    // Format data based on requested format
    if (format === 'json') {
      // Set appropriate headers for JSON download
      reply.header('Content-Type', 'application/json');
      reply.header('Content-Disposition', `attachment; filename=${entity}_export_${new Date().toISOString().split('T')[0]}.json`);

      return reply.send(data);
    } else if (format === 'csv') {
      // Convert data to CSV
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => {
        return Object.values(item).map(value => {
          // Handle values with commas by wrapping in quotes
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          value = String(value);
          return value.includes(',') ? `"${value}"` : value;
        }).join(',');
      }).join('\n');

      const csv = `${headers}\n${rows}`;

      // Set appropriate headers for CSV download
      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', `attachment; filename=${entity}_export_${new Date().toISOString().split('T')[0]}.csv`);

      return reply.send(csv);
    } else {
      return reply.code(400).send({ msg: 'Invalid format. Supported formats: csv, json' });
    }
  } catch (err) {
    request.log.error('Error in exportData:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

module.exports = {
  getDashboardData,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getWeightReports,
  getLoadReports,
  getComplianceReports,
  exportData,
};
