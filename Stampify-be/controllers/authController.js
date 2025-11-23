const jwt = require('jsonwebtoken');
const BusinessOwner = require('../models/BusinessOwner');

/**
 * Sign up a new business owner
 */
const signup = async (req, res) => {
  try {
    const { email, password, businessName } = req.body;

    // Check if business owner already exists
    const existingOwner = await BusinessOwner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({
        success: false,
        message: 'Business owner with this email already exists'
      });
    }

    // Create new business owner
    const businessOwner = new BusinessOwner({
      email,
      password,
      businessName
    });

    await businessOwner.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: businessOwner._id, email: businessOwner.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Business owner created successfully',
      data: {
        token,
        businessOwner: {
          id: businessOwner._id,
          email: businessOwner.email,
          businessName: businessOwner.businessName,
          qrToken: businessOwner.qrToken,
          stampCard: businessOwner.stampCard
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating business owner',
      error: error.message
    });
  }
};

/**
 * Login business owner
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find business owner
    const businessOwner = await BusinessOwner.findOne({ email });
    if (!businessOwner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await businessOwner.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: businessOwner._id, email: businessOwner.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        businessOwner: {
          id: businessOwner._id,
          email: businessOwner.email,
          businessName: businessOwner.businessName,
          qrToken: businessOwner.qrToken,
          stampCard: businessOwner.stampCard
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

module.exports = {
  signup,
  login
};

