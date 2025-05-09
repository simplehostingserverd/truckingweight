import express from 'express';
import { 
  getIntegrationConnections,
  getIntegrationConnection,
  createIntegrationConnection,
  updateIntegrationConnection,
  deleteIntegrationConnection
} from '../controllers/integrations';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Integration connections routes
router.get('/', getIntegrationConnections);
router.get('/:id', getIntegrationConnection);
router.post('/', createIntegrationConnection);
router.put('/:id', updateIntegrationConnection);
router.delete('/:id', deleteIntegrationConnection);

export default router;
