const express = require('express');
const router = express.Router();
const {
    requestRedemption,
    getPendingRedemptions,
    approveRedemption,
    rejectRedemption
} = require('../controllers/redemptionController');
const authenticateToken = require('../middleware/auth');

// Public route (Customer)
router.post('/request', requestRedemption);

// Protected routes (Business Owner)
router.get('/pending', authenticateToken, getPendingRedemptions);
router.post('/approve', authenticateToken, approveRedemption);
router.post('/reject', authenticateToken, rejectRedemption);

module.exports = router;
