/**
 * Authentication middleware
 * Verifies JWT token and sets user data in request object
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    companyId?: number;
    isAdmin?: boolean;
  };
}

interface JwtPayload {
  user: {
    id: string;
    companyId?: number;
    isAdmin?: boolean;
  };
}

/**
 * Authentication middleware
 * Verifies JWT token and sets user data in request object
 */
const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as JwtPayload;

    // Set user data in request
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;
