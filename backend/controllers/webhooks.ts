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

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Validation schemas
const createWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  event_types: z.array(z.string().min(1).max(50)).min(1),
  target_url: z.string().url(),
  is_active: z.boolean().optional().default(true),
});

const updateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  event_types: z.array(z.string().min(1).max(50)).min(1).optional(),
  target_url: z.string().url().optional(),
  is_active: z.boolean().optional(),
});

/**
 * Get all webhook subscriptions for a company
 */
export const getWebhookSubscriptions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is admin to determine if they can see all webhooks
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { is_admin: true },
    });

    const where = user?.is_admin ? {} : { company_id: companyId };

    const webhooks = await prisma.webhook_subscriptions.findMany({
      where,
      select: {
        id: true,
        name: true,
        event_types: true,
        target_url: true,
        is_active: true,
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

    return res.status(200).json(webhooks);
  } catch (error) {
    console.error('Error fetching webhook subscriptions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a specific webhook subscription by ID
 */
export const getWebhookSubscription = async (req: Request, res: Response) => {
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

    const webhook = await prisma.webhook_subscriptions.findUnique({
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

    if (!webhook) {
      return res.status(404).json({ message: 'Webhook subscription not found' });
    }

    // Check if user has access to this webhook
    if (!user?.is_admin && webhook.company_id !== companyId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Remove secret key before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { secret_key: _, ...safeWebhook } = webhook;

    return res.status(200).json(safeWebhook);
  } catch (error) {
    console.error('Error fetching webhook subscription:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new webhook subscription
 */
export const createWebhookSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId || !companyId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validationResult = createWebhookSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    const { name, event_types, target_url, is_active } = validationResult.data;

    // Generate a secret key for webhook signature verification
    const secretKey = crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.webhook_subscriptions.create({
      data: {
        id: uuidv4(),
        name,
        event_types,
        target_url,
        secret_key /* eslint-disable-line @typescript-eslint/no-unused-vars */: secretKey,
        is_active,
        company_id: companyId,
        created_by: userId,
      },
    });

    // Return the webhook with the secret key (only shown once)
    return res.status(201).json({
      ...webhook,
      secret_key /* eslint-disable-line @typescript-eslint/no-unused-vars */: secretKey,
      message: 'Store this secret key securely. It will not be shown again.',
    });
  } catch (error) {
    console.error('Error creating webhook subscription:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update an existing webhook subscription
 */
export const updateWebhookSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validationResult = updateWebhookSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    // Check if webhook exists and user has access
    const existingWebhook = await prisma.webhook_subscriptions.findUnique({
      where: { id },
    });

    if (!existingWebhook) {
      return res.status(404).json({ message: 'Webhook subscription not found' });
    }

    // Check if user is admin or owns the webhook
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { is_admin: true },
    });

    if (!user?.is_admin && existingWebhook.company_id !== companyId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, event_types, target_url, is_active } = validationResult.data;

    const webhook = await prisma.webhook_subscriptions.update({
      where: { id },
      data: {
        name,
        event_types,
        target_url,
        is_active,
        updated_at: new Date(),
      },
    });

    // Remove secret key before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { secret_key: _, ...safeWebhook } = webhook;

    return res.status(200).json(safeWebhook);
  } catch (error) {
    console.error('Error updating webhook subscription:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a webhook subscription
 */
export const deleteWebhookSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if webhook exists and user has access
    const existingWebhook = await prisma.webhook_subscriptions.findUnique({
      where: { id },
    });

    if (!existingWebhook) {
      return res.status(404).json({ message: 'Webhook subscription not found' });
    }

    // Check if user is admin or owns the webhook
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { is_admin: true },
    });

    if (!user?.is_admin && existingWebhook.company_id !== companyId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Delete the webhook
    await prisma.webhook_subscriptions.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting webhook subscription:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Regenerate webhook secret key
 */
export const regenerateWebhookSecret = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if webhook exists and user has access
    const existingWebhook = await prisma.webhook_subscriptions.findUnique({
      where: { id },
    });

    if (!existingWebhook) {
      return res.status(404).json({ message: 'Webhook subscription not found' });
    }

    // Check if user is admin or owns the webhook
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { is_admin: true },
    });

    if (!user?.is_admin && existingWebhook.company_id !== companyId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Generate a new secret key
    const secretKey = crypto.randomBytes(32).toString('hex');

    // Update the webhook with the new secret key
    await prisma.webhook_subscriptions.update({
      where: { id },
      data: {
        secret_key /* eslint-disable-line @typescript-eslint/no-unused-vars */: secretKey,
        updated_at: new Date(),
      },
    });

    return res.status(200).json({
      id,
      secret_key /* eslint-disable-line @typescript-eslint/no-unused-vars */: secretKey,
      message: 'Store this secret key securely. It will not be shown again.',
    });
  } catch (error) {
    console.error('Error regenerating webhook secret:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
