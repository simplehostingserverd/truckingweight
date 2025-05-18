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
 * Authentication middleware
 * Verifies Paseto token and sets user data in request object
 */

import { Request, Response, NextFunction } from 'express';
// Import the Paseto service
import * as pasetoService from '../services/pasetoService.js';

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
  } catch (_err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;
