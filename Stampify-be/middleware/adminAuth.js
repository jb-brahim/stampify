const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

/**
 * Admin authentication middleware
 * Validates JWT token and checks if user has admin role
 */
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No authorization header provided. Please include: Authorization: Bearer <token>' 
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided. Format: Authorization: Bearer <token>' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    if (!decoded.role || decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin role required. This token does not have admin privileges. Please login using /api/admin/login endpoint.' 
      });
    }

    // Verify admin user still exists
    const admin = await AdminUser.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. Admin user not found in database.' 
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. Token format is incorrect or JWT_SECRET mismatch.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Admin tokens expire after 24 hours. Please login again.' 
      });
    }

    console.error('Admin auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error.', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = adminAuth;

