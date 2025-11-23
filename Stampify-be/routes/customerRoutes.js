const express = require('express');
const router = express.Router();
const { getCustomerCard } = require('../controllers/customerController');

// Public endpoint - no auth required (customers don't log in)
router.get('/:customerId', getCustomerCard);

module.exports = router;

