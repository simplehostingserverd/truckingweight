const supabase = require('../../config/supabase');
const { redisService } = require('../../services/redis');

/**
 * Get sync status
 */
async function getSyncStatus(request, reply) {
  try {
    // Check Redis connection
    const redisStatus = redisService.isReady() ? 'connected' : 'disconnected';

    // Get sync queue status
    const { count, error } = await supabase
      .from('sync_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      request.log.error('Error checking sync queue:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Get last successful sync
    const { data: lastSync, error: lastSyncError } = await supabase
      .from('sync_queue')
      .select('created_at')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastSyncError && lastSyncError.code !== 'PGRST116') {
      request.log.error('Error checking last sync:', lastSyncError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send({
      status: 'ok',
      message: 'Sync service is running',
      pendingItems: count || 0,
      lastSuccessfulSync: lastSync?.created_at || null,
      redisStatus,
    });
  } catch (err) {
    request.log.error('Error in getSyncStatus:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Sync data
 */
async function syncData(request, reply) {
  try {
    const { table, action, data, companyId } = request.body;

    if (!table || !action || !data || !companyId) {
      return reply.code(400).send({
        msg: 'Missing required fields. Required: table, action, data, companyId',
      });
    }

    // Validate action
    const validActions = ['create', 'update', 'delete'];
    if (!validActions.includes(action)) {
      return reply.code(400).send({
        msg: 'Invalid action. Must be one of: create, update, delete',
      });
    }

    // Generate a unique ID for the sync item
    const syncId = `${table}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Add to sync queue
    const { error } = await supabase
      .from('sync_queue')
      .insert([
        {
          id: syncId,
          company_id: companyId,
          table_name: table,
          action,
          data,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      request.log.error('Error adding to sync queue:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Trigger sync process (in a real implementation, this would be handled by a background worker)
    // For now, we'll just mark it as completed
    const { error: updateError } = await supabase
      .from('sync_queue')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', syncId);

    if (updateError) {
      request.log.error('Error updating sync status:', updateError);
      // We don't return an error here since the item was added to the queue successfully
    }

    return reply.code(201).send({
      msg: 'Data queued for synchronization',
      syncId,
      status: 'pending',
    });
  } catch (err) {
    request.log.error('Error in syncData:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Get sync history
 */
async function getSyncHistory(request, reply) {
  try {
    const { limit = 50, offset = 0, status } = request.query;

    // Build query
    let query = supabase
      .from('sync_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      request.log.error('Error fetching sync history:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('sync_queue')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      request.log.error('Error counting sync items:', countError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    return reply.send({
      data,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (err) {
    request.log.error('Error in getSyncHistory:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

module.exports = {
  getSyncStatus,
  syncData,
  getSyncHistory,
};
