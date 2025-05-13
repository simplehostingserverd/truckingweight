/**
 * Authentication middleware
 * Verifies Paseto token and sets user data in request object
 */

import { Request, Response, NextFunction } from 'express';
// Import the Paseto service (using require since it's a CommonJS module)
const pasetoService = require('../services/pasetoService');

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    companyId?: number;
    isAdmin?: boolean;
  };
}

interface PasetoPayload {
  user: {
    id: string;
    companyId?: number;
    isAdmin?: boolean;
  };
}

/**
 * Authentication middleware
 * Verifies Paseto token and sets user data in request object
 */
const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify Paseto token
    const decoded = (await pasetoService.decryptToken(token)) as PasetoPayload;

    if (!decoded) {
      return res.status(401).json({ message: 'Token is not valid or expired' });
    }

    // Set user data in request
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;
