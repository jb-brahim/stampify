const express = require('express');
const router = express.Router();
const { getMyQR } = require('../controllers/qrController');
const authenticateToken = require('../middleware/auth');

router.get('/my', authenticateToken, getMyQR);

module.exports = router;

