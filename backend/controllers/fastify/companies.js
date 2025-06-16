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

import supabase from '../../config/supabase.js';

/**
 * Get all companies (admin only)
 */
async function getAllCompanies(request, reply) {
  try {
    const { data: companies, error } = await supabase.from('companies').select('*').order('name');

    if (error) {
      request.log.error('Error fetching companies:', error);
      return reply.code(500).send({ message: 'Server error', error: error.message });
    }

    return reply.send(companies);
  } catch (err) {
    request.log.error('Error in getAllCompanies:', err);
    return reply.code(500).send({ message: 'Server error' });
  }
}

/**
 * Get company by ID
 */
async function getCompanyById(request, reply) {
  try {
    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, is_admin')
      .eq('id', request.user.id)
      .single();

    if (userError) {
      request.log.error('Error fetching user data:', userError);
      return reply.code(500).send({ message: 'Server error', error: userError.message });
    }

    // Only allow admins to view other companies
    if (!userData.is_admin && userData.company_id !== parseInt(request.params.id)) {
      return reply.code(403).send({ message: 'Not authorized to view this company' });
    }

    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', request.params.id)
      .single();

    if (error) {
      request.log.error('Error fetching company:', error);
      return reply.code(500).send({ message: 'Server error', error: error.message });
    }

    if (!company) {
      return reply.code(404).send({ message: 'Company not found' });
    }

    return reply.send(company);
  } catch (err) {
    request.log.error('Error in getCompanyById:', err);
    return reply.code(500).send({ message: 'Server error' });
  }
}

/**
 * Create a new company (admin only)
 */
async function createCompany(request, reply) {
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
  } = request.body;

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
      request.log.error('Error creating company:', error);
      return reply.code(500).send({ message: 'Server error', error: error.message });
    }

    return reply.code(201).send(company);
  } catch (err) {
    request.log.error('Error in createCompany:', err);
    return reply.code(500).send({ message: 'Server error' });
  }
}

/**
 * Update a company
 */
async function updateCompany(request, reply) {
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
  } = request.body;

  try {
    // Check if company exists
    const { data: existingCompany, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', request.params.id)
      .single();

    if (companyError || !existingCompany) {
      return reply.code(404).send({ message: 'Company not found' });
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
      .eq('id', request.params.id)
      .select()
      .single();

    if (error) {
      request.log.error('Error updating company:', error);
      return reply.code(500).send({ message: 'Server error', error: error.message });
    }

    return reply.send(company);
  } catch (err) {
    request.log.error('Error in updateCompany:', err);
    return reply.code(500).send({ message: 'Server error' });
  }
}

/**
 * Delete a company
 */
async function deleteCompany(request, reply) {
  try {
    // Check if company exists
    const { data: existingCompany, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', request.params.id)
      .single();

    if (companyError || !existingCompany) {
      return reply.code(404).send({ message: 'Company not found' });
    }

    // Delete company
    const { error } = await supabase.from('companies').delete().eq('id', request.params.id);

    if (error) {
      request.log.error('Error deleting company:', error);
      return reply.code(500).send({ message: 'Server error', error: error.message });
    }

    return reply.send({ message: 'Company removed' });
  } catch (err) {
    request.log.error('Error in deleteCompany:', err);
    return reply.code(500).send({ message: 'Server error' });
  }
}

export { getAllCompanies, getCompanyById, createCompany, updateCompany, deleteCompany };

export default {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};
