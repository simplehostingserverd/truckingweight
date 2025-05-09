import express from 'express';
import { 
  getApiKeys,
  getApiKey,
  createApiKey,
  updateApiKey,
  deleteApiKey
} from '../controllers/apiKeys';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// API key routes
router.get('/', getApiKeys);
router.get('/:id', getApiKey);
router.post('/', createApiKey);
router.put('/:id', updateApiKey);
router.delete('/:id', deleteApiKey);

export default router;
