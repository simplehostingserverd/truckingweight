/**
 * LPR Cameras Controller
 * Handles CRUD operations for License Plate Recognition cameras
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY
);

/**
 * Get all LPR cameras
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function getAllLPRCameras(request, reply) {
  try {
    const { limit = 50, offset = 0, vendor, is_active, city_id } = request.query;
    const isAdmin = request.user.isAdmin;

    // Build query
    let query = supabase.from('lpr_cameras').select('*', { count: 'exact' });

    // Apply filters
    if (vendor) {
      query = query.eq('vendor', vendor);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active);
    }

    if (city_id) {
      query = query.eq('city_id', city_id);
    }

    // If not admin, restrict to company's cameras
    if (!isAdmin && !request.user.userType === 'city') {
      // For regular users, only show cameras without city_id (company cameras)
      query = query.is('city_id', null);
    } else if (request.user.userType === 'city') {
      // For city users, only show their city's cameras
      query = query.eq('city_id', request.user.cityId);
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    // Execute query
    const { data: cameras, count, error } = await query;

    if (error) {
      request.log.error('Error fetching LPR cameras:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    // Mask sensitive data for non-admin users
    const formattedCameras = cameras.map(camera => {
      // Clone the camera object
      const formattedCamera = { ...camera };

      // If not admin, mask sensitive fields
      if (!isAdmin) {
        formattedCamera.username = formattedCamera.username ? '********' : null;
        formattedCamera.password = formattedCamera.password ? '********' : null;
        formattedCamera.api_key = formattedCamera.api_key ? '********' : null;
      }

      return formattedCamera;
    });

    return reply.code(200).send({ cameras: formattedCameras, count });
  } catch (err) {
    request.log.error('Server error in getAllLPRCameras:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Get LPR camera by ID
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function getLPRCameraById(request, reply) {
  try {
    const cameraId = request.params.id;
    const isAdmin = request.user.isAdmin;

    // Get camera from database
    const { data: camera, error } = await supabase
      .from('lpr_cameras')
      .select('*')
      .eq('id', cameraId)
      .single();

    if (error) {
      request.log.error('Error fetching LPR camera:', error);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!camera) {
      return reply.code(404).send({ msg: 'Camera not found' });
    }

    // Check permissions
    if (!isAdmin && request.user.userType !== 'city') {
      // Regular users can only access cameras without city_id
      if (camera.city_id) {
        return reply.code(403).send({ msg: 'Not authorized to access this camera' });
      }
    } else if (request.user.userType === 'city') {
      // City users can only access their city's cameras
      if (camera.city_id !== request.user.cityId) {
        return reply.code(403).send({ msg: 'Not authorized to access this camera' });
      }
    }

    // Mask sensitive data for non-admin users
    if (!isAdmin) {
      camera.username = camera.username ? '********' : null;
      camera.password = camera.password ? '********' : null;
      camera.api_key = camera.api_key ? '********' : null;
    }

    return reply.code(200).send({ camera });
  } catch (err) {
    request.log.error('Server error in getLPRCameraById:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Create a new LPR camera
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function createLPRCamera(request, reply) {
  try {
    const {
      name,
      vendor,
      ip_address,
      port,
      username,
      password,
      api_key,
      api_endpoint,
      is_active = true,
      location,
      notes,
      city_id,
    } = request.body;

    // Check permissions for city_id
    if (city_id && request.user.userType === 'city') {
      // City users can only create cameras for their own city
      if (city_id !== request.user.cityId) {
        return reply.code(403).send({ msg: 'Not authorized to create cameras for other cities' });
      }
    }

    // Create camera record
    const { data: newCamera, error } = await supabase
      .from('lpr_cameras')
      .insert([
        {
          name,
          vendor,
          ip_address,
          port,
          username,
          password,
          api_key,
          api_endpoint,
          is_active,
          location,
          notes,
          city_id,
        },
      ])
      .select()
      .single();

    if (error) {
      request.log.error('Error creating LPR camera:', error);
      return reply.code(500).send({ msg: 'Error creating camera' });
    }

    // Mask sensitive data for response
    const responseCamera = { ...newCamera };
    if (!request.user.isAdmin) {
      responseCamera.username = responseCamera.username ? '********' : null;
      responseCamera.password = responseCamera.password ? '********' : null;
      responseCamera.api_key = responseCamera.api_key ? '********' : null;
    }

    return reply.code(201).send({
      camera: responseCamera,
      msg: 'Camera created successfully',
    });
  } catch (err) {
    request.log.error('Server error in createLPRCamera:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Update an LPR camera
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function updateLPRCamera(request, reply) {
  try {
    const cameraId = request.params.id;
    const isAdmin = request.user.isAdmin;

    // Check if camera exists
    const { data: existingCamera, error: checkError } = await supabase
      .from('lpr_cameras')
      .select('*')
      .eq('id', cameraId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing camera:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingCamera) {
      return reply.code(404).send({ msg: 'Camera not found' });
    }

    // Check permissions
    if (!isAdmin && request.user.userType !== 'city') {
      // Regular users can only update cameras without city_id
      if (existingCamera.city_id) {
        return reply.code(403).send({ msg: 'Not authorized to update this camera' });
      }
    } else if (request.user.userType === 'city') {
      // City users can only update their city's cameras
      if (existingCamera.city_id !== request.user.cityId) {
        return reply.code(403).send({ msg: 'Not authorized to update this camera' });
      }
    }

    // Prepare update data
    const updateData = {};
    const fields = [
      'name',
      'vendor',
      'ip_address',
      'port',
      'username',
      'password',
      'api_key',
      'api_endpoint',
      'is_active',
      'location',
      'notes',
      'city_id',
    ];

    fields.forEach(field => {
      if (request.body[field] !== undefined) {
        updateData[field] = request.body[field];
      }
    });

    // Check city_id permissions
    if (updateData.city_id && request.user.userType === 'city') {
      // City users can only set their own city_id
      if (updateData.city_id !== request.user.cityId) {
        return reply.code(403).send({ msg: 'Not authorized to assign cameras to other cities' });
      }
    }

    updateData.updated_at = new Date().toISOString();

    // Update camera record
    const { data: updatedCamera, error: updateError } = await supabase
      .from('lpr_cameras')
      .update(updateData)
      .eq('id', cameraId)
      .select()
      .single();

    if (updateError) {
      request.log.error('Error updating LPR camera:', updateError);
      return reply.code(500).send({ msg: 'Error updating camera' });
    }

    // Mask sensitive data for response
    const responseCamera = { ...updatedCamera };
    if (!request.user.isAdmin) {
      responseCamera.username = responseCamera.username ? '********' : null;
      responseCamera.password = responseCamera.password ? '********' : null;
      responseCamera.api_key = responseCamera.api_key ? '********' : null;
    }

    return reply.code(200).send({
      camera: responseCamera,
      msg: 'Camera updated successfully',
    });
  } catch (err) {
    request.log.error('Server error in updateLPRCamera:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

/**
 * Delete an LPR camera
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function deleteLPRCamera(request, reply) {
  try {
    const cameraId = request.params.id;
    const isAdmin = request.user.isAdmin;

    // Check if camera exists
    const { data: existingCamera, error: checkError } = await supabase
      .from('lpr_cameras')
      .select('*')
      .eq('id', cameraId)
      .single();

    if (checkError) {
      request.log.error('Error checking for existing camera:', checkError);
      return reply.code(500).send({ msg: 'Server error' });
    }

    if (!existingCamera) {
      return reply.code(404).send({ msg: 'Camera not found' });
    }

    // Check permissions
    if (!isAdmin && request.user.userType !== 'city') {
      // Regular users can only delete cameras without city_id
      if (existingCamera.city_id) {
        return reply.code(403).send({ msg: 'Not authorized to delete this camera' });
      }
    } else if (request.user.userType === 'city') {
      // City users can only delete their city's cameras
      if (existingCamera.city_id !== request.user.cityId) {
        return reply.code(403).send({ msg: 'Not authorized to delete this camera' });
      }
    }

    // Delete camera from database
    const { error: deleteError } = await supabase.from('lpr_cameras').delete().eq('id', cameraId);

    if (deleteError) {
      request.log.error('Error deleting LPR camera:', deleteError);
      return reply.code(500).send({ msg: 'Error deleting camera' });
    }

    return reply.code(200).send({ msg: 'Camera deleted successfully' });
  } catch (err) {
    request.log.error('Server error in deleteLPRCamera:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

export { getAllLPRCameras, getLPRCameraById, createLPRCamera, updateLPRCamera, deleteLPRCamera };

export default {
  getAllLPRCameras,
  getLPRCameraById,
  createLPRCamera,
  updateLPRCamera,
  deleteLPRCamera,
};
