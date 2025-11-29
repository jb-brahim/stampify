const express = require('express');
const router = express.Router();
const { getCustomers, getActivityLogs } = require('../controllers/businessController');
const authenticateToken = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.get('/customers', getCustomers);
router.get('/activity', getActivityLogs);

module.exports = router;
