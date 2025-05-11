import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Validation schemas
const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string().min(1).max(50)).min(1),
  expires_at: z.string().datetime().optional(),
});

const updateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(z.string().min(1).max(50)).min(1).optional(),
  is_active: z.boolean().optional(),
  expires_at: z.string().datetime().optional(),
});

/**
 * Get all API keys for a company
 */
export const getApiKeys = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is admin to determine if they can see all API keys
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { is_admin: true },
    });

    const where = user?.is_admin ? {} : { company_id: companyId };

    const apiKeys = await prisma.api_keys.findMany({
      where,
      select: {
        id: true,
        name: true,
        expires_at: true,
        last_used_at: true,
        is_active: true,
        permissions: true,
        created_at: true,
        updated_at: true,
        companies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json(apiKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a specific API key by ID
 */
export const getApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { is_admin: true },
    });

    const apiKey = await prisma.api_keys.findUnique({
      where: { id },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    // Check if user has access to this API key
    if (!user?.is_admin && apiKey.company_id !== companyId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Remove actual key before returning
    const { key, ...safeApiKey } = apiKey;

    return res.status(200).json(safeApiKey);
  } catch (error) {
    console.error('Error fetching API key:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new API key
 */
export const createApiKey = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId || !companyId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validationResult = createApiKeySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    const { name, permissions, expires_at } = validationResult.data;

    // Generate a secure API key
    const apiKeyValue = `sm_${crypto.randomBytes(32).toString('hex')}`;

    const apiKey = await prisma.api_keys.create({
      data: {
        id: uuidv4(),
        name,
        key: apiKeyValue,
        permissions,
        expires_at: expires_at ? new Date(expires_at) : null,
        is_active: true,
        company_id: companyId,
        created_by: userId,
      },
    });

    // Return the API key (only shown once)
    return res.status(201).json({
      ...apiKey,
      message: 'Store this API key securely. It will not be shown again.',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update an existing API key
 */
export const updateApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validationResult = updateApiKeySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    // Check if API key exists and user has access
    const existingApiKey = await prisma.api_keys.findUnique({
      where: { id },
    });

    if (!existingApiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    // Check if user is admin or owns the API key
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { is_admin: true },
    });

    if (!user?.is_admin && existingApiKey.company_id !== companyId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, permissions, is_active, expires_at } = validationResult.data;

    const apiKey = await prisma.api_keys.update({
      where: { id },
      data: {
        name,
        permissions,
        is_active,
        expires_at: expires_at ? new Date(expires_at) : undefined,
        updated_at: new Date(),
      },
    });

    // Remove actual key before returning
    const { key, ...safeApiKey } = apiKey;

    return res.status(200).json(safeApiKey);
  } catch (error) {
    console.error('Error updating API key:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete an API key
 */
export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if API key exists and user has access
    const existingApiKey = await prisma.api_keys.findUnique({
      where: { id },
    });

    if (!existingApiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    // Check if user is admin or owns the API key
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { is_admin: true },
    });

    if (!user?.is_admin && existingApiKey.company_id !== companyId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Delete the API key
    await prisma.api_keys.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting API key:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
