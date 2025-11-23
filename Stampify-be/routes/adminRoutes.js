const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  adminLogin,
  getAllBusinesses,
  getBusinessCustomers,
  getAllCustomers,
  updateSubscription,
  getStats
} = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const validate = require('../middleware/validation');

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const subscriptionValidation = [
  body('subscriptionStatus')
    .optional()
    .isIn(['active', 'suspended'])
    .withMessage('Subscription status must be "active" or "suspended"'),
  body('subscriptionExpiry')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .withMessage('Invalid date format for subscription expiry')
];

// Public route - Admin login
router.post('/login', loginValidation, validate, adminLogin);

// Protected routes - Require admin authentication
router.get('/businesses', adminAuth, getAllBusinesses);
router.get('/businesses/:businessId/customers', adminAuth, getBusinessCustomers);
router.get('/customers', adminAuth, getAllCustomers);
router.patch('/businesses/:businessId/subscription', adminAuth, subscriptionValidation, validate, updateSubscription);
router.get('/stats', adminAuth, getStats);

module.exports = router;

