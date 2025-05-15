import express from 'express';
const router = express.Router();
import { check } from 'express-validator';

// Import controllers
import vehicleController from '../controllers/vehicles.js';

// Import middleware
import auth from '../middleware/auth.js';

// @route   GET api/vehicles
// @desc    Get all vehicles for the company
// @access  Private
router.get('/', auth, vehicleController.getAllVehicles);

// @route   GET api/vehicles/:id
// @desc    Get vehicle by ID
// @access  Private
router.get('/:id', auth, vehicleController.getVehicleById);

// @route   POST api/vehicles
// @desc    Create a new vehicle
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('type', 'Type is required').not().isEmpty(),
      check('license_plate', 'License plate is required').not().isEmpty(),
    ],
  ],
  vehicleController.createVehicle
);

// @route   PUT api/vehicles/:id
// @desc    Update a vehicle
// @access  Private
router.put('/:id', auth, vehicleController.updateVehicle);

// @route   DELETE api/vehicles/:id
// @desc    Delete a vehicle
// @access  Private
router.delete('/:id', auth, vehicleController.deleteVehicle);

export default router;
