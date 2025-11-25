const express = require('express');
const router = express.Router();
const { getCustomerCard, registerCustomer } = require('../controllers/customerController');

// Public endpoint - no auth required (customers don't log in)
router.post('/register', registerCustomer);
router.get('/:customerId', getCustomerCard);

module.exports = router;

