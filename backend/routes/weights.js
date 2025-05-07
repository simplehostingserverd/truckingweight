const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import controllers
const weightController = require('../controllers/weights');

// Import middleware
const auth = require('../middleware/auth');

// @route   GET api/weights
// @desc    Get all weights for the company
// @access  Private
router.get('/', auth, weightController.getAllWeights);

// @route   GET api/weights/:id
// @desc    Get weight by ID
// @access  Private
router.get('/:id', auth, weightController.getWeightById);

// @route   POST api/weights
// @desc    Create a new weight entry
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('vehicle', 'Vehicle is required').not().isEmpty(),
      check('weight', 'Weight is required').not().isEmpty(),
      check('date', 'Date is required').not().isEmpty(),
      check('driver', 'Driver is required').not().isEmpty(),
    ],
  ],
  weightController.createWeight
);

// @route   PUT api/weights/:id
// @desc    Update a weight entry
// @access  Private
router.put('/:id', auth, weightController.updateWeight);

// @route   DELETE api/weights/:id
// @desc    Delete a weight entry
// @access  Private
router.delete('/:id', auth, weightController.deleteWeight);

module.exports = router;
