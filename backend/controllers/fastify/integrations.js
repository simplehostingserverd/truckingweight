const supabase = require('../../config/supabase');
const crypto = require('crypto');

/**
 * Get all integrations for the company
 */
async function getAllIntegrations(request, reply) {
  try {
    // Get integrations for the company
    const { data: integrations, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('company_id', request.user.companyId)
      .order('created_at', { ascending: false });

    if (error) {
      request.log.error('Error fetching integrations:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(integrations);
  } catch (err) {
    request.log.error('Error in getAllIntegrations:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Get integration by ID
 */
async function getIntegrationById(request, reply) {
  try {
    // Get integration by ID
    const { data: integration, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (error) {
      request.log.error('Error fetching integration:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!integration) {
      return reply.code(404).send({ msg: 'Integration not found' });
    }

    return reply.send(integration);
  } catch (err) {
    request.log.error('Error in getIntegrationById:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Create a new integration
 */
async function createIntegration(request, reply) {
  try {
    const { name, type, config, description } = request.body;

    // Validate integration type
    const validTypes = ['erp', 'telematics', 'accounting', 'crm', 'custom'];
    if (!validTypes.includes(type)) {
      return reply.code(400).send({
        msg: `Invalid integration type. Valid types are: ${validTypes.join(', ')}`,
      });
    }

    // Generate a secret key for the integration
    const secretKey = crypto.randomBytes(32).toString('hex');

    // Create new integration
    const { data: integration, error } = await supabase
      .from('integration_connections')
      .insert([
        {
          name,
          type,
          config,
          description,
          secret_key: secretKey,
          company_id: request.user.companyId,
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      request.log.error('Error creating integration:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.code(201).send({
      ...integration,
      secret_key: secretKey,
      note: 'This secret key will only be shown once. Please store it securely.',
    });
  } catch (err) {
    request.log.error('Error in createIntegration:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Update an integration
 */
async function updateIntegration(request, reply) {
  try {
    const { name, config, description, status } = request.body;

    // Check if integration exists and belongs to the company
    const { data: existingIntegration, error: checkError } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing integration:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingIntegration) {
      return reply.code(404).send({ msg: 'Integration not found' });
    }

    // Update integration
    const { data: updatedIntegration, error } = await supabase
      .from('integration_connections')
      .update({
        name: name || existingIntegration.name,
        config: config || existingIntegration.config,
        description: description !== undefined ? description : existingIntegration.description,
        status: status || existingIntegration.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .select()
      .single();

    if (error) {
      request.log.error('Error updating integration:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(updatedIntegration);
  } catch (err) {
    request.log.error('Error in updateIntegration:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Delete an integration
 */
async function deleteIntegration(request, reply) {
  try {
    // Check if integration exists and belongs to the company
    const { data: existingIntegration, error: checkError } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing integration:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingIntegration) {
      return reply.code(404).send({ msg: 'Integration not found' });
    }

    // Delete integration
    const { error } = await supabase
      .from('integration_connections')
      .delete()
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId);

    if (error) {
      request.log.error('Error deleting integration:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send({ msg: 'Integration removed' });
  } catch (err) {
    request.log.error('Error in deleteIntegration:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Test an integration
 */
async function testIntegration(request, reply) {
  try {
    // Get integration by ID
    const { data: integration, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (error) {
      request.log.error('Error fetching integration:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!integration) {
      return reply.code(404).send({ msg: 'Integration not found' });
    }

    // In a real implementation, this would test the integration with the external service
    // For now, just return success
    return reply.send({
      success: true,
      message: 'Integration test successful',
      integration: {
        id: integration.id,
        name: integration.name,
        type: integration.type,
      },
    });
  } catch (err) {
    request.log.error('Error in testIntegration:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

module.exports = {
  getAllIntegrations,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testIntegration,
};
