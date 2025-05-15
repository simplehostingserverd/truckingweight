import { validationResult } from 'express-validator';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * @desc    Get all companies (admin only)
 * @route   GET /api/companies
 * @access  Private/Admin
 */
exports.getAllCompanies = async (req, res) => {
  try {
    const { data: companies, error } = await supabase.from('companies').select('*').order('name');

    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.json(companies);
  } catch (err) {
    console.error('Error in getAllCompanies:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get company by ID
 * @route   GET /api/companies/:id
 * @access  Private
 */
exports.getCompanyById = async (req, res) => {
  try {
    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, is_admin')
      .eq('id', req.user.id)
      .single();

    if (userError) {
      return res.status(500).json({ message: 'Server error', error: userError.message });
    }

    // Only allow admins to view other companies
    if (!userData.is_admin && userData.company_id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: 'Not authorized to view this company' });
    }

    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (err) {
    console.error('Error in getCompanyById:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Create a new company (admin only)
 * @route   POST /api/companies
 * @access  Private/Admin
 */
exports.createCompany = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    address,
    city,
    state,
    zip,
    country,
    contactName,
    contactEmail,
    contactPhone,
    logo,
    status = 'active',
  } = req.body;

  try {
    // Create company
    const { data: company, error } = await supabase
      .from('companies')
      .insert([
        {
          name,
          address,
          city,
          state,
          zip,
          country,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          logo,
          status,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.status(201).json(company);
  } catch (err) {
    console.error('Error in createCompany:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update a company
 * @route   PUT /api/companies/:id
 * @access  Private/Admin
 */
exports.updateCompany = async (req, res) => {
  const {
    name,
    address,
    city,
    state,
    zip,
    country,
    contactName,
    contactEmail,
    contactPhone,
    logo,
    status,
  } = req.body;

  try {
    // Check if company exists
    const { data: existingCompany, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (companyError || !existingCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update company
    const { data: company, error } = await supabase
      .from('companies')
      .update({
        name,
        address,
        city,
        state,
        zip,
        country,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        logo,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.json(company);
  } catch (err) {
    console.error('Error in updateCompany:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete a company
 * @route   DELETE /api/companies/:id
 * @access  Private/Admin
 */
exports.deleteCompany = async (req, res) => {
  try {
    // Check if company exists
    const { data: existingCompany, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (companyError || !existingCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Delete company
    const { error } = await supabase.from('companies').delete().eq('id', req.params.id);

    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.json({ message: 'Company removed' });
  } catch (err) {
    console.error('Error in deleteCompany:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
