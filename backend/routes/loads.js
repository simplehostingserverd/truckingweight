const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import controllers
const loadController = require('../controllers/loads');

// Import middleware
const auth = require('../middleware/auth');

// @route   GET api/loads
// @desc    Get all loads for the company
// @access  Private
router.get('/', auth, loadController.getAllLoads);

// @route   GET api/loads/:id
// @desc    Get load by ID
// @access  Private
router.get('/:id', auth, loadController.getLoadById);

// @route   POST api/loads
// @desc    Create a new load
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('description', 'Description is required').not().isEmpty(),
      check('origin', 'Origin is required').not().isEmpty(),
      check('destination', 'Destination is required').not().isEmpty(),
      check('weight', 'Weight is required').not().isEmpty(),
      check('vehicle', 'Vehicle is required').not().isEmpty(),
    ],
  ],
  loadController.createLoad
);

// @route   PUT api/loads/:id
// @desc    Update a load
// @access  Private
router.put('/:id', auth, loadController.updateLoad);

// @route   DELETE api/loads/:id
// @desc    Delete a load
// @access  Private
router.delete('/:id', auth, loadController.deleteLoad);

module.exports = router;
