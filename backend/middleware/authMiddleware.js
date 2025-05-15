/**
 * Authentication Middleware
 *
 * This middleware handles authentication and authorization for API routes.
 */

import * as pasetoService from '../services/pasetoService.js';
import supabase from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Protect routes - require authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    try {
      // Verify Paseto token
      const decoded = await pasetoService.decryptToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token expired or invalid',
        });
      }

      // Get user from Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, invalid token',
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      logger.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * Admin middleware - require admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const admin = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin',
    });
  }
};

/**
 * Company middleware - require same company
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const sameCompany = (req, res, next) => {
  // Get company ID from request params or body
  const companyId = req.params.companyId || req.body.company_id;

  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: 'Company ID is required',
    });
  }

  // Check if user belongs to the company
  if (req.user && (req.user.is_admin || req.user.company_id === parseInt(companyId))) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized to access this company's data",
    });
  }
};

export default {
  protect,
  admin,
  sameCompany,
};
