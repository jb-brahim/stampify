const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { scanQR } = require('../controllers/scanController');
const { scanRateLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validation');

// Validation for scan endpoint
const scanValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
];

// Public endpoint - no auth required
router.post('/:qrToken', scanRateLimiter, scanValidation, validate, scanQR);

module.exports = router;

