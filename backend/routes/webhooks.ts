import express from 'express';
import {
  getWebhookSubscriptions,
  getWebhookSubscription,
  createWebhookSubscription,
  updateWebhookSubscription,
  deleteWebhookSubscription,
  regenerateWebhookSecret,
} from '../controllers/webhooks';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Webhook subscription routes
router.get('/', getWebhookSubscriptions);
router.get('/:id', getWebhookSubscription);
router.post('/', createWebhookSubscription);
router.put('/:id', updateWebhookSubscription);
router.delete('/:id', deleteWebhookSubscription);
router.post('/:id/regenerate-secret', regenerateWebhookSecret);

export default router;
