const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signup, login, updateProfile, googleAuth } = require('../controllers/authController');
const validate = require('../middleware/validation');
const authenticateToken = require('../middleware/auth');

// Validation rules
const signupValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters')
];

router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.put('/profile', authenticateToken, updateProfileValidation, validate, updateProfile);

// Google OAuth
router.post('/google', googleAuth);

module.exports = router;
