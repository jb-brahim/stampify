const jwt = require('jsonwebtoken');
const BusinessOwner = require('../models/BusinessOwner');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify business owner still exists
    const businessOwner = await BusinessOwner.findById(decoded.id).select('-password');
    
    if (!businessOwner) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. Business owner not found.' 
      });
    }

    req.user = businessOwner;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Authentication error.', 
      error: error.message 
    });
  }
};

module.exports = authenticateToken;

