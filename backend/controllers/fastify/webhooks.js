const supabase = require('../../config/supabase');
const crypto = require('crypto');

/**
 * Get all webhooks for the company
 */
async function getAllWebhooks(request, reply) {
  try {
    // Get webhooks for the company
    const { data: webhooks, error } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('company_id', request.user.companyId)
      .order('created_at', { ascending: false });

    if (error) {
      request.log.error('Error fetching webhooks:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(webhooks);
  } catch (err) {
    request.log.error('Error in getAllWebhooks:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Get webhook by ID
 */
async function getWebhookById(request, reply) {
  try {
    // Get webhook by ID
    const { data: webhook, error } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (error) {
      request.log.error('Error fetching webhook:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!webhook) {
      return reply.code(404).send({ msg: 'Webhook not found' });
    }

    return reply.send(webhook);
  } catch (err) {
    request.log.error('Error in getWebhookById:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Create a new webhook
 */
async function createWebhook(request, reply) {
  try {
    const { name, url, events, description, headers } = request.body;

    // Validate events
    const validEvents = ['weight.created', 'weight.updated', 'load.created', 'load.updated', 'vehicle.created', 'vehicle.updated', 'driver.created', 'driver.updated'];
    const invalidEvents = events.filter(event => !validEvents.includes(event));
    
    if (invalidEvents.length > 0) {
      return reply.code(400).send({ 
        msg: `Invalid events: ${invalidEvents.join(', ')}. Valid events are: ${validEvents.join(', ')}` 
      });
    }

    // Generate a secret token for webhook verification
    const secretToken = crypto.randomBytes(32).toString('hex');

    // Create new webhook
    const { data: webhook, error } = await supabase
      .from('webhook_subscriptions')
      .insert([
        {
          name,
          url,
          events: events,
          description,
          headers: headers || {},
          secret_token: secretToken,
          company_id: request.user.companyId,
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      request.log.error('Error creating webhook:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.code(201).send(webhook);
  } catch (err) {
    request.log.error('Error in createWebhook:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Update a webhook
 */
async function updateWebhook(request, reply) {
  try {
    const { name, url, events, description, headers, status } = request.body;

    // Check if webhook exists and belongs to the company
    const { data: existingWebhook, error: checkError } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing webhook:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingWebhook) {
      return reply.code(404).send({ msg: 'Webhook not found' });
    }

    // Validate events if provided
    if (events) {
      const validEvents = ['weight.created', 'weight.updated', 'load.created', 'load.updated', 'vehicle.created', 'vehicle.updated', 'driver.created', 'driver.updated'];
      const invalidEvents = events.filter(event => !validEvents.includes(event));
      
      if (invalidEvents.length > 0) {
        return reply.code(400).send({ 
          msg: `Invalid events: ${invalidEvents.join(', ')}. Valid events are: ${validEvents.join(', ')}` 
        });
      }
    }

    // Update webhook
    const { data: updatedWebhook, error } = await supabase
      .from('webhook_subscriptions')
      .update({
        name: name || existingWebhook.name,
        url: url || existingWebhook.url,
        events: events || existingWebhook.events,
        description: description !== undefined ? description : existingWebhook.description,
        headers: headers || existingWebhook.headers,
        status: status || existingWebhook.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .select()
      .single();

    if (error) {
      request.log.error('Error updating webhook:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send(updatedWebhook);
  } catch (err) {
    request.log.error('Error in updateWebhook:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Delete a webhook
 */
async function deleteWebhook(request, reply) {
  try {
    // Check if webhook exists and belongs to the company
    const { data: existingWebhook, error: checkError } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing webhook:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingWebhook) {
      return reply.code(404).send({ msg: 'Webhook not found' });
    }

    // Delete webhook
    const { error } = await supabase
      .from('webhook_subscriptions')
      .delete()
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId);

    if (error) {
      request.log.error('Error deleting webhook:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send({ msg: 'Webhook removed' });
  } catch (err) {
    request.log.error('Error in deleteWebhook:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Process webhook callback
 */
async function processWebhookCallback(request, reply) {
  try {
    const { token } = request.params;
    
    // Find webhook by token
    const { data: webhook, error } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('secret_token', token)
      .single();
    
    if (error || !webhook) {
      request.log.error('Invalid webhook token:', token);
      return reply.code(404).send({ msg: 'Not found' });
    }
    
    // In a real implementation, this would process the webhook data
    // For now, just log the request and return success
    request.log.info(`Webhook callback received for ${webhook.name}`);
    
    return reply.send({ msg: 'Webhook received' });
  } catch (err) {
    request.log.error('Error in processWebhookCallback:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Test a webhook
 */
async function testWebhook(request, reply) {
  try {
    // Get webhook by ID
    const { data: webhook, error } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('id', request.params.id)
      .eq('company_id', request.user.companyId)
      .single();

    if (error) {
      request.log.error('Error fetching webhook:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!webhook) {
      return reply.code(404).send({ msg: 'Webhook not found' });
    }
    
    // In a real implementation, this would send a test request to the webhook URL
    // For now, just return success
    return reply.send({ 
      msg: 'Test webhook sent successfully',
      webhook: {
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
      }
    });
  } catch (err) {
    request.log.error('Error in testWebhook:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

module.exports = {
  getAllWebhooks,
  getWebhookById,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  processWebhookCallback,
  testWebhook,
};
