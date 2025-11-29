const express = require('express');
const router = express.Router();
const { getCustomers, getActivityLogs, getAnalytics } = require('../controllers/businessController');
const authenticateToken = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.get('/customers', getCustomers);
router.get('/activity', getActivityLogs);
router.get('/analytics', getAnalytics);
router.post('/customers/:customerId/remind', require('../controllers/businessController').sendCustomerReminder);

module.exports = router;
