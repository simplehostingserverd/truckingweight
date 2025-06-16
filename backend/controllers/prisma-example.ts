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

/**
 * Example controller using Prisma with the dedicated role
 * This demonstrates how to use Prisma with the dedicated role for database operations
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/prisma';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    companyId?: number;
    isAdmin?: boolean;
  };
}

/**
 * @desc    Get all vehicles for the company using Prisma
 * @route   GET /api/vehicles
 * @access  Private
 */
export const getAllVehicles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // The company context is automatically set by the middleware
    // Prisma will use the RLS policies to filter by company_id
    const vehicles = await prisma.vehicles.findMany({
      orderBy: {
        created_at: 'desc',
      },
      include: {
        companies: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json(vehicles);
  } catch (err) {
    console.error('Error fetching vehicles:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get a vehicle by ID using Prisma
 * @route   GET /api/vehicles/:id
 * @access  Private
 */
export const getVehicleById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicles.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        companies: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Additional security check (in case RLS doesn't catch it)
    if (vehicle.company_id !== req.user?.companyId && !req.user?.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access this vehicle' });
    }

    res.json(vehicle);
  } catch (err) {
    console.error('Error fetching vehicle:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Create a new vehicle using Prisma
 * @route   POST /api/vehicles
 * @access  Private
 */
export const createVehicle = async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      make,
      model,
      year,
      vin,
      license_plate,
      status,
      max_weight,
      empty_weight,
      max_gross_weight,
      height,
      width,
      length,
      telematics_id,
      eld_integration,
      axle_configuration_id,
    } = req.body;

    // Create new vehicle with Prisma
    const newVehicle = await prisma.vehicles.create({
      data: {
        make,
        model,
        year: parseInt(year),
        vin,
        license_plate,
        status: status || 'Active',
        max_weight,
        empty_weight: parseInt(empty_weight) || null,
        max_gross_weight: parseInt(max_gross_weight) || null,
        height: parseInt(height) || null,
        width: parseInt(width) || null,
        length: parseInt(length) || null,
        telematics_id,
        eld_integration: eld_integration || false,
        axle_configuration_id: axle_configuration_id ? parseInt(axle_configuration_id) : null,
        company_id: req.user?.companyId || null,
        created_at: new Date(),
      },
    });

    res.status(201).json(newVehicle);
  } catch (err) {
    console.error('Error creating vehicle:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
