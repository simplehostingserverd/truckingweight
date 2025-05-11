import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createConnectionSchema = z.object({
  integration_type: z.string().min(1).max(50),
  provider: z.string().min(1).max(50),
  credentials: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  is_active: z.boolean().optional().default(true),
});

const updateConnectionSchema = z.object({
  integration_type: z.string().min(1).max(50).optional(),
  provider: z.string().min(1).max(50).optional(),
  credentials: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
});

/**
 * Get all integration connections for a company
 */
export const getIntegrationConnections = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is admin to determine if they can see all connections
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { is_admin: true },
    });

    const where = user?.is_admin ? {} : { company_id: companyId };

    const connections = await prisma.integration_connections.findMany({
      where,
      select: {
        id: true,
        integration_type: true,
        provider: true,
        settings: true,
        is_active: true,
        last_sync_at: true,
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

    return res.status(200).json(connections);
  } catch (error) {
    console.error('Error fetching integration connections:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a specific integration connection by ID
 */
export const getIntegrationConnection = async (req: Request, res: Response) => {
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

    const connection = await prisma.integration_connections.findUnique({
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

    if (!connection) {
      return res.status(404).json({ message: 'Integration connection not found' });
    }

    // Check if user has access to this connection
    if (!user?.is_admin && connection.company_id !== companyId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Remove sensitive credentials before returning
    const { credentials, ...safeConnection } = connection;

    return res.status(200).json(safeConnection);
  } catch (error) {
    console.error('Error fetching integration connection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new integration connection
 */
export const createIntegrationConnection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId || !companyId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validationResult = createConnectionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    const { integration_type, provider, credentials, settings, is_active } = validationResult.data;

    const connection = await prisma.integration_connections.create({
      data: {
        id: uuidv4(),
        integration_type,
        provider,
        credentials,
        settings,
        is_active,
        company_id: companyId,
        created_by: userId,
      },
    });

    // Log the creation
    await prisma.integration_logs.create({
      data: {
        id: uuidv4(),
        integration_connection_id: connection.id,
        event_type: 'create',
        status: 'success',
        message: `Integration connection created for ${provider}`,
        details: { integration_type, provider },
      },
    });

    // Remove sensitive credentials before returning
    const { credentials: _, ...safeConnection } = connection;

    return res.status(201).json(safeConnection);
  } catch (error) {
    console.error('Error creating integration connection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update an existing integration connection
 */
export const updateIntegrationConnection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validationResult = updateConnectionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    // Check if connection exists and user has access
    const existingConnection = await prisma.integration_connections.findUnique({
      where: { id },
    });

    if (!existingConnection) {
      return res.status(404).json({ message: 'Integration connection not found' });
    }

    // Check if user is admin or owns the connection
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { is_admin: true },
    });

    if (!user?.is_admin && existingConnection.company_id !== companyId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { integration_type, provider, credentials, settings, is_active } = validationResult.data;

    const connection = await prisma.integration_connections.update({
      where: { id },
      data: {
        integration_type,
        provider,
        credentials,
        settings,
        is_active,
        updated_at: new Date(),
      },
    });

    // Log the update
    await prisma.integration_logs.create({
      data: {
        id: uuidv4(),
        integration_connection_id: connection.id,
        event_type: 'update',
        status: 'success',
        message: `Integration connection updated for ${connection.provider}`,
        details: { integration_type, provider },
      },
    });

    // Remove sensitive credentials before returning
    const { credentials: _, ...safeConnection } = connection;

    return res.status(200).json(safeConnection);
  } catch (error) {
    console.error('Error updating integration connection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete an integration connection
 */
export const deleteIntegrationConnection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if connection exists and user has access
    const existingConnection = await prisma.integration_connections.findUnique({
      where: { id },
    });

    if (!existingConnection) {
      return res.status(404).json({ message: 'Integration connection not found' });
    }

    // Check if user is admin or owns the connection
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { is_admin: true },
    });

    if (!user?.is_admin && existingConnection.company_id !== companyId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Delete the connection
    await prisma.integration_connections.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting integration connection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
