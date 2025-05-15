import express from 'express';
const router = express.Router();
import { check } from 'express-validator';

// Import controllers
import authController from '../controllers/auth.js';

// Import middleware
import auth from '../middleware/auth.js';

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('companyId', 'Company ID is required').not().isEmpty(),
  ],
  authController.register
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  authController.login
);

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, authController.getUser);

export default router;
