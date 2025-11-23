const BusinessOwner = require('../models/BusinessOwner');
const Customer = require('../models/Customer');
const { v4: uuidv4 } = require('uuid');

/**
 * Handle customer scanning QR code
 * Creates customer if first scan, increments stamp count
 */
const scanQR = async (req, res) => {
  try {
    const { qrToken } = req.params;
    const { deviceId } = req.body;

    // Validate deviceId is provided
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }

    // Find business owner by QR token
    const businessOwner = await BusinessOwner.findOne({ qrToken });
    if (!businessOwner) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code token'
      });
    }

    // Check if business subscription is active
    if (businessOwner.subscriptionStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This business subscription is currently suspended. Please contact the business owner.'
      });
    }

    // Find or create customer
    let customer = await Customer.findOne({
      businessId: businessOwner._id,
      deviceId: deviceId
    });

    const now = new Date();
    const RATE_LIMIT_SECONDS = 10;

    if (!customer) {
      // First scan - create new customer
      customer = new Customer({
        businessId: businessOwner._id,
        deviceId: deviceId,
        stamps: 1,
        lastStampTime: now
      });
      await customer.save();

      return res.json({
        success: true,
        message: 'Welcome! Your first stamp has been added.',
        data: {
          customerId: customer._id,
          stamps: customer.stamps,
          totalStamps: businessOwner.stampCard.totalStamps,
          rewardAchieved: false,
          progress: (customer.stamps / businessOwner.stampCard.totalStamps) * 100
        }
      });
    }

    // Existing customer - check rate limit
    if (customer.lastStampTime) {
      const timeSinceLastStamp = (now - customer.lastStampTime) / 1000; // seconds
      
      if (timeSinceLastStamp < RATE_LIMIT_SECONDS) {
        const remainingSeconds = Math.ceil(RATE_LIMIT_SECONDS - timeSinceLastStamp);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} more second(s) before scanning again.`,
          waitTime: remainingSeconds
        });
      }
    }

    // Check if card is already full
    if (customer.stamps >= businessOwner.stampCard.totalStamps) {
      return res.json({
        success: true,
        message: 'Your card is already full! Reward achieved.',
        data: {
          customerId: customer._id,
          stamps: customer.stamps,
          totalStamps: businessOwner.stampCard.totalStamps,
          rewardAchieved: customer.rewardAchieved,
          rewardText: businessOwner.stampCard.rewardText,
          progress: 100
        }
      });
    }

    // Increment stamp
    customer.stamps += 1;
    customer.lastStampTime = now;

    // Check if card is now full
    if (customer.stamps >= businessOwner.stampCard.totalStamps) {
      customer.rewardAchieved = true;
      await customer.save();

      return res.json({
        success: true,
        message: `Congratulations! You've earned: ${businessOwner.stampCard.rewardText}`,
        data: {
          customerId: customer._id,
          stamps: customer.stamps,
          totalStamps: businessOwner.stampCard.totalStamps,
          rewardAchieved: true,
          rewardText: businessOwner.stampCard.rewardText,
          progress: 100
        }
      });
    }

    await customer.save();

    res.json({
      success: true,
      message: 'Stamp added successfully!',
      data: {
        customerId: customer._id,
        stamps: customer.stamps,
        totalStamps: businessOwner.stampCard.totalStamps,
        rewardAchieved: false,
        progress: (customer.stamps / businessOwner.stampCard.totalStamps) * 100
      }
    });
  } catch (error) {
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate scan detected. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error processing scan',
      error: error.message
    });
  }
};

module.exports = {
  scanQR
};

