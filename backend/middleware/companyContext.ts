/**
 * Middleware to set company context for Prisma queries
 * This middleware extracts the company ID from the authenticated user
 * and sets it in the global context for Prisma to use with RLS policies
 */

import { Request, Response, NextFunction } from 'express';
import { setCompanyContext } from '../config/prisma';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    companyId?: number;
    isAdmin?: boolean;
  };
}

/**
 * Sets the company context for Prisma queries based on the authenticated user
 */
export const setCompanyContextMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // If user is authenticated, set the company context
  if (req.user && req.user.companyId) {
    setCompanyContext(req.user.companyId);
  } else {
    // Clear the company context if no user or no company ID
    setCompanyContext(undefined);
  }
  
  next();
};

export default setCompanyContextMiddleware;
