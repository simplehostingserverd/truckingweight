import supabase from '../../config/supabase.js';
import crypto from 'crypto';

/**
 * Get all API keys for the company
 */
async function getAllApiKeys(request, reply) {
  try {
    // Get API keys for the company
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select(
        'id, name, prefix, scopes, expires_at, created_at, updated_at, created_by, last_used_at, status'
      )
      .eq('company_id', request.user.companyId)
      .order('created_at', { ascending: false });

    if (error) {
      request.log.error('Error fetching API keys:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(apiKeys);
  } catch (err) {
    request.log.error('Error in getAllApiKeys:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Get API key by ID
 */
async function getApiKeyById(request, reply) {
  try {
    // Get API key by ID
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .select(
        'id, name, prefix, scopes, expires_at, created_at, updated_at, created_by, last_used_at, status'
      )
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (error) {
      request.log.error('Error fetching API key:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!apiKey) {
      return reply.code(404).send({ msg: 'API key not found' });
    }

    return reply.send(apiKey);
  } catch (err) {
    request.log.error('Error in getApiKeyById:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Create a new API key
 */
async function createApiKey(request, reply) {
  try {
    const { name, scopes, expiresAt } = request.body;

    // Validate scopes
    const validScopes = [
      'read:weights',
      'write:weights',
      'read:loads',
      'write:loads',
      'read:vehicles',
      'write:vehicles',
      'read:drivers',
      'write:drivers',
    ];
    const invalidScopes = scopes.filter(scope => !validScopes.includes(scope));

    if (invalidScopes.length > 0) {
      return reply.code(400).send({
        msg: `Invalid scopes: ${invalidScopes.join(', ')}. Valid scopes are: ${validScopes.join(', ')}`,
      });
    }

    // Generate API key
    const apiKeyValue = crypto.randomBytes(32).toString('hex');
    const prefix = crypto.randomBytes(4).toString('hex');

    // Hash the API key for storage
    const hashedKey = crypto.createHash('sha256').update(apiKeyValue).digest('hex');

    // Create new API key
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert([
        {
          name,
          prefix,
          key: hashedKey,
          scopes,
          expires_at: expiresAt || null,
          company_id: request.user.companyId,
          created_by: request.user.id,
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ])
      .select('id, name, prefix, scopes, expires_at, created_at, status')
      .single();

    if (error) {
      request.log.error('Error creating API key:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Return the API key value (this is the only time it will be available)
    return reply.code(201).send({
      ...apiKey,
      key: `${prefix}.${apiKeyValue}`,
      note: 'This API key will only be shown once. Please store it securely.',
    });
  } catch (err) {
    request.log.error('Error in createApiKey:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Update an API key
 */
async function updateApiKey(request, reply) {
  try {
    const { name, scopes, status } = request.body;

    // Check if API key exists and belongs to the company
    const { data: existingApiKey, error: checkError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing API key:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingApiKey) {
      return reply.code(404).send({ msg: 'API key not found' });
    }

    // Validate scopes if provided
    if (scopes) {
      const validScopes = [
        'read:weights',
        'write:weights',
        'read:loads',
        'write:loads',
        'read:vehicles',
        'write:vehicles',
        'read:drivers',
        'write:drivers',
      ];
      const invalidScopes = scopes.filter(scope => !validScopes.includes(scope));

      if (invalidScopes.length > 0) {
        return reply.code(400).send({
          msg: `Invalid scopes: ${invalidScopes.join(', ')}. Valid scopes are: ${validScopes.join(', ')}`,
        });
      }
    }

    // Update API key
    const { data: updatedApiKey, error } = await supabase
      .from('api_keys')
      .update({
        name: name || existingApiKey.name,
        scopes: scopes || existingApiKey.scopes,
        status: status || existingApiKey.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .select(
        'id, name, prefix, scopes, expires_at, created_at, updated_at, created_by, last_used_at, status'
      )
      .single();

    if (error) {
      request.log.error('Error updating API key:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(updatedApiKey);
  } catch (err) {
    request.log.error('Error in updateApiKey:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Delete an API key
 */
async function deleteApiKey(request, reply) {
  try {
    // Check if API key exists and belongs to the company
    const { data: existingApiKey, error: checkError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing API key:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingApiKey) {
      return reply.code(404).send({ msg: 'API key not found' });
    }

    // Delete API key
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId);

    if (error) {
      request.log.error('Error deleting API key:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send({ msg: 'API key removed' });
  } catch (err) {
    request.log.error('Error in deleteApiKey:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Verify an API key
 */
async function verifyApiKey(request, reply) {
  try {
    const { apiKey } = request.body;

    if (!apiKey) {
      return reply.code(400).send({ msg: 'API key is required' });
    }

    // Split the API key into prefix and value
    const [prefix, value] = apiKey.split('.');

    if (!prefix || !value) {
      return reply.code(401).send({ msg: 'Invalid API key format' });
    }

    // Hash the API key value
    const hashedKey = crypto.createHash('sha256').update(value).digest('hex');

    // Find the API key in the database
    const { data: apiKeyData, error } = await supabase
      .from('api_keys')
      .select('id, name, scopes, expires_at, company_id, status')
      .eq('prefix', prefix)
      .eq('key', hashedKey)
      .eq('status', 'active')
      .single();

    if (error || !apiKeyData) {
      return reply.code(401).send({ msg: 'Invalid API key' });
    }

    // Check if the API key has expired
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return reply.code(401).send({ msg: 'API key has expired' });
    }

    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({
        last_used_at: new Date().toISOString(),
      })
      .eq('id', apiKeyData.id);

    return reply.send({
      valid: true,
      scopes: apiKeyData.scopes,
      companyId: apiKeyData.company_id,
    });
  } catch (err) {
    request.log.error('Error in verifyApiKey:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

export { getAllApiKeys, getApiKeyById, createApiKey, updateApiKey, deleteApiKey, verifyApiKey };

export default {
  getAllApiKeys,
  getApiKeyById,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  verifyApiKey,
};
