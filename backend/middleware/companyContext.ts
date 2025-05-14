/**
 * Middleware to set company context for Prisma queries
 * This middleware extracts the company ID from the authenticated user
 * and sets it in the global context for Prisma to use with RLS policies
 */

import { Request, Response, NextFunction } from 'express'
import { setCompanyContext } from '../config/prisma'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    companyId?: number
    isAdmin?: boolean
  }
}

/**
 * Sets the company context for Prisma queries based on the authenticated user
 */
export const setCompanyContextMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // If user is authenticated
  if (req.user) {
    // Check if user is admin
    const isAdmin = req.user.isAdmin === true

    // Set company context with admin flag
    if (req.user.companyId) {
      setCompanyContext(req.user.companyId, isAdmin)
    } else if (isAdmin) {
      // Admin without company ID can still see all data
      setCompanyContext(undefined, true)
    } else {
      // Clear the context if not admin and no company ID
      setCompanyContext(undefined, false)
    }
  } else {
    // Clear the company context if no user
    setCompanyContext(undefined, false)
  }

  next()
}

export default setCompanyContextMiddleware
