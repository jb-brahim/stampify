const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { scanQR } = require('../controllers/scanController');
const { scanRateLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validation');

// Validation for scan endpoint
const scanValidation = [
  body('deviceId')
    .notEmpty()
    .withMessage('Device ID is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Device ID must be between 1 and 200 characters')
];

// Public endpoint - no auth required
router.post('/:qrToken', scanRateLimiter, scanValidation, validate, scanQR);

module.exports = router;

