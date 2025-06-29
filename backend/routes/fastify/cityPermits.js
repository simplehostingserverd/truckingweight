/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

/**
 * City Permits Routes
 * Handles permit creation, retrieval, and management
 */

import { createClient } from '@supabase/supabase-js';
import { cityAuthMiddleware, cityRoleMiddleware } from '../../middleware/fastify/cityAuth.js';
import { generatePermitNumber } from '../../utils/generators.js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// City permits route schemas
const createPermitSchema = {
  body: {
    type: 'object',
    required: ['companyName', 'vehicleInfo', 'permitType', 'startDate', 'endDate', 'feeAmount'],
    properties: {
      companyName: { type: 'string', minLength: 1 },
      contactName: { type: 'string' },
      contactEmail: { type: 'string', format: 'email' },
      contactPhone: { type: 'string' },
      vehicleInfo: { type: 'string', minLength: 1 },
      permitType: { type: 'string', enum: ['overweight', 'oversize', 'both'] },
      maxWeight: { type: 'number' },
      dimensions: {
        type: 'object',
        properties: {
          length: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' },
        },
      },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      feeAmount: { type: 'number', minimum: 0 },
      paymentStatus: { type: 'string', enum: ['Pending', 'Paid', 'Refunded'] },
      status: { type: 'string', enum: ['Active', 'Expired', 'Revoked'] },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        permit: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            permitNumber: { type: 'string' },
            companyName: { type: 'string' },
            permitType: { type: 'string' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            status: { type: 'string' },
          },
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

const getPermitsSchema = {
  querystring: {
    type: 'object',
    properties: {
      status: { type: 'string' },
      permitType: { type: 'string' },
      limit: { type: 'number' },
      offset: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        permits: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              permitNumber: { type: 'string' },
              companyName: { type: 'string' },
              vehicleInfo: { type: 'string' },
              permitType: { type: 'string' },
              maxWeight: { type: 'number' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              feeAmount: { type: 'number' },
              paymentStatus: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
      },
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

const getPermitByIdSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'number' },
    },
    required: ['id'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        permit: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            permitNumber: { type: 'string' },
            companyName: { type: 'string' },
            contactName: { type: 'string' },
            contactEmail: { type: 'string' },
            contactPhone: { type: 'string' },
            vehicleInfo: { type: 'string' },
            permitType: { type: 'string' },
            maxWeight: { type: 'number' },
            dimensions: { type: 'object' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            feeAmount: { type: 'number' },
            paymentStatus: { type: 'string' },
            status: { type: 'string' },
            approvedBy: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
      },
    },
    404: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

const updatePermitSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'number' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      companyName: { type: 'string' },
      contactName: { type: 'string' },
      contactEmail: { type: 'string', format: 'email' },
      contactPhone: { type: 'string' },
      vehicleInfo: { type: 'string' },
      permitType: { type: 'string', enum: ['overweight', 'oversize', 'both'] },
      maxWeight: { type: 'number' },
      dimensions: { type: 'object' },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      feeAmount: { type: 'number', minimum: 0 },
      paymentStatus: { type: 'string', enum: ['Pending', 'Paid', 'Refunded'] },
      status: { type: 'string', enum: ['Active', 'Expired', 'Revoked'] },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        permit: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            permitNumber: { type: 'string' },
            status: { type: 'string' },
            paymentStatus: { type: 'string' },
          },
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    404: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

/**
 * City Permits Routes
 */
async function routes(fastify, _options) {
  // Add city auth middleware to all routes
  fastify.addHook('preHandler', cityAuthMiddleware);

  /**
   * @route   POST /api/city-permits
   * @desc    Create a new permit
   * @access  Private (City Users with admin or operator role)
   */
  fastify.post(
    '/',
    {
      preHandler: [cityRoleMiddleware(['admin', 'operator'])],
      schema: createPermitSchema,
    },
    async (request, reply) => {
      try {
        const cityId = request.user.cityId;
        const userId = request.user.id;
        const {
          companyName,
          contactName,
          contactEmail,
          contactPhone,
          vehicleInfo,
          permitType,
          maxWeight,
          dimensions,
          startDate,
          endDate,
          feeAmount,
          paymentStatus = 'Pending',
          status = 'Active',
        } = request.body;

        // Generate permit number
        const permitNumber = await generatePermitNumber(cityId);

        // Create permit
        const { data: permit, error } = await supabase
          .from('city_permits')
          .insert([
            {
              permit_number: permitNumber,
              company_name: companyName,
              contact_name: contactName,
              contact_email: contactEmail,
              contact_phone: contactPhone,
              vehicle_info: vehicleInfo,
              permit_type: permitType,
              max_weight: maxWeight,
              dimensions,
              start_date: startDate,
              end_date: endDate,
              fee_amount: feeAmount,
              payment_status: paymentStatus,
              status,
              approved_by: userId,
              city_id: cityId,
            },
          ])
          .select()
          .single();

        if (error) {
          request.log.error('Error creating permit:', error);
          return reply.code(500).send({ msg: 'Error creating permit' });
        }

        return reply.code(201).send({
          permit: {
            id: permit.id,
            permitNumber: permit.permit_number,
            companyName: permit.company_name,
            permitType: permit.permit_type,
            startDate: permit.start_date,
            endDate: permit.end_date,
            status: permit.status,
          },
        });
      } catch (err) {
        request.log.error('Server error in create permit:', err);
        return reply.code(500).send({ msg: 'Server error' });
      }
    }
  );

  /**
   * @route   GET /api/city-permits
   * @desc    Get all permits for city
   * @access  Private (City Users)
   */
  fastify.get('/', { schema: getPermitsSchema }, async (request, reply) => {
    try {
      const cityId = request.user.cityId;
      const { status, permitType, limit = 20, offset = 0 } = request.query;

      // Build query
      let query = supabase
        .from('city_permits')
        .select('*', { count: 'exact' })
        .eq('city_id', cityId);

      // Add filters
      if (status) {
        query = query.eq('status', status);
      }

      if (permitType) {
        query = query.eq('permit_type', permitType);
      }

      // Add pagination
      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

      // Execute query
      const { data: permits, error, count } = await query;

      if (error) {
        request.log.error('Error fetching permits:', error);
        return reply.code(500).send({ msg: 'Error fetching permits' });
      }

      // Format permits
      const formattedPermits = permits.map(permit => ({
        id: permit.id,
        permitNumber: permit.permit_number,
        companyName: permit.company_name,
        vehicleInfo: permit.vehicle_info,
        permitType: permit.permit_type,
        maxWeight: permit.max_weight ? parseFloat(permit.max_weight) : null,
        startDate: permit.start_date,
        endDate: permit.end_date,
        feeAmount: parseFloat(permit.fee_amount),
        paymentStatus: permit.payment_status,
        status: permit.status,
        createdAt: permit.created_at,
      }));

      return reply.code(200).send({
        permits: formattedPermits,
        total: count || 0,
      });
    } catch (err) {
      request.log.error('Server error in get permits:', err);
      return reply.code(500).send({ msg: 'Server error' });
    }
  });

  /**
   * @route   GET /api/city-permits/:id
   * @desc    Get permit by ID
   * @access  Private (City Users)
   */
  fastify.get('/:id', { schema: getPermitByIdSchema }, async (request, reply) => {
    try {
      const cityId = request.user.cityId;
      const permitId = parseInt(request.params.id);

      const { data: permit, error } = await supabase
        .from('city_permits')
        .select('*')
        .eq('id', permitId)
        .eq('city_id', cityId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return reply.code(404).send({ msg: 'Permit not found' });
        }
        request.log.error('Error fetching permit:', error);
        return reply.code(500).send({ msg: 'Error fetching permit' });
      }

      return reply.code(200).send({
        permit: {
          id: permit.id,
          permitNumber: permit.permit_number,
          companyName: permit.company_name,
          contactName: permit.contact_name,
          contactEmail: permit.contact_email,
          contactPhone: permit.contact_phone,
          vehicleInfo: permit.vehicle_info,
          permitType: permit.permit_type,
          maxWeight: permit.max_weight ? parseFloat(permit.max_weight) : null,
          dimensions: permit.dimensions,
          startDate: permit.start_date,
          endDate: permit.end_date,
          feeAmount: parseFloat(permit.fee_amount),
          paymentStatus: permit.payment_status,
          status: permit.status,
          approvedBy: permit.approved_by,
          createdAt: permit.created_at,
          updatedAt: permit.updated_at,
        },
      });
    } catch (err) {
      request.log.error('Server error in get permit by ID:', err);
      return reply.code(500).send({ msg: 'Server error' });
    }
  });

  /**
   * @route   PUT /api/city-permits/:id
   * @desc    Update permit
   * @access  Private (City Users with admin or operator role)
   */
  fastify.put(
    '/:id',
    {
      preHandler: [cityRoleMiddleware(['admin', 'operator'])],
      schema: updatePermitSchema,
    },
    async (request, reply) => {
      try {
        const cityId = request.user.cityId;
        const permitId = parseInt(request.params.id);
        const updateData = request.body;

        // Check if permit exists
        const { error: checkError } = await supabase
          .from('city_permits')
          .select('id, permit_number')
          .eq('id', permitId)
          .eq('city_id', cityId)
          .single();

        if (checkError) {
          if (checkError.code === 'PGRST116') {
            return reply.code(404).send({ msg: 'Permit not found' });
          }
          request.log.error('Error checking permit:', checkError);
          return reply.code(500).send({ msg: 'Error updating permit' });
        }

        // Prepare update data with snake_case keys
        const updateFields = {};
        if (updateData.companyName !== undefined)
          updateFields.company_name = updateData.companyName;
        if (updateData.contactName !== undefined)
          updateFields.contact_name = updateData.contactName;
        if (updateData.contactEmail !== undefined)
          updateFields.contact_email = updateData.contactEmail;
        if (updateData.contactPhone !== undefined)
          updateFields.contact_phone = updateData.contactPhone;
        if (updateData.vehicleInfo !== undefined)
          updateFields.vehicle_info = updateData.vehicleInfo;
        if (updateData.permitType !== undefined) updateFields.permit_type = updateData.permitType;
        if (updateData.maxWeight !== undefined) updateFields.max_weight = updateData.maxWeight;
        if (updateData.dimensions !== undefined) updateFields.dimensions = updateData.dimensions;
        if (updateData.startDate !== undefined) updateFields.start_date = updateData.startDate;
        if (updateData.endDate !== undefined) updateFields.end_date = updateData.endDate;
        if (updateData.feeAmount !== undefined) updateFields.fee_amount = updateData.feeAmount;
        if (updateData.paymentStatus !== undefined)
          updateFields.payment_status = updateData.paymentStatus;
        if (updateData.status !== undefined) updateFields.status = updateData.status;

        // Add updated_at timestamp
        updateFields.updated_at = new Date().toISOString();

        // Update permit
        const { data: updatedPermit, error: updateError } = await supabase
          .from('city_permits')
          .update(updateFields)
          .eq('id', permitId)
          .eq('city_id', cityId)
          .select('id, permit_number, status, payment_status')
          .single();

        if (updateError) {
          request.log.error('Error updating permit:', updateError);
          return reply.code(500).send({ msg: 'Error updating permit' });
        }

        return reply.code(200).send({
          permit: {
            id: updatedPermit.id,
            permitNumber: updatedPermit.permit_number,
            status: updatedPermit.status,
            paymentStatus: updatedPermit.payment_status,
          },
        });
      } catch (err) {
        request.log.error('Server error in update permit:', err);
        return reply.code(500).send({ msg: 'Server error' });
      }
    }
  );
}

export default routes;
