const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getMyCard, updateCard, getMyStats } = require('../controllers/stampCardController');
const authenticateToken = require('../middleware/auth');
const validate = require('../middleware/validation');

// Validation rules for update
const updateValidation = [
  body('totalStamps')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total stamps must be a positive integer'),
  body('rewardText')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Reward text must be between 1 and 200 characters')
];

router.get('/my', authenticateToken, getMyCard);
router.get('/stats', authenticateToken, getMyStats);
router.put('/update', authenticateToken, updateValidation, validate, updateCard);

module.exports = router;

