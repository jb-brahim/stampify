const BusinessOwner = require('../models/BusinessOwner');
const ActivityLog = require('../models/ActivityLog');

/**
 * Get current business owner's stamp card settings
 */
const getMyCard = async (req, res) => {
  try {
    const businessOwner = await BusinessOwner.findById(req.user._id).select('-password');

    if (!businessOwner) {
      return res.status(404).json({
        success: false,
        message: 'Business owner not found'
      });
    }

    res.json({
      success: true,
      data: {
        stampCard: businessOwner.stampCard,
        qrToken: businessOwner.qrToken,
        businessName: businessOwner.businessName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stamp card',
      error: error.message
    });
  }
};

/**
 * Update business owner's stamp card settings
 */
const updateCard = async (req, res) => {
  try {
    const { totalStamps, rewardText } = req.body;

    const updateData = {};
    if (totalStamps !== undefined) {
      if (totalStamps < 1) {
        return res.status(400).json({
          success: false,
          message: 'Total stamps must be at least 1'
        });
      }
      updateData['stampCard.totalStamps'] = totalStamps;
    }

    if (rewardText !== undefined) {
      updateData['stampCard.rewardText'] = rewardText.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const businessOwner = await BusinessOwner.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!businessOwner) {
      return res.status(404).json({
        success: false,
        message: 'Business owner not found'
      });
    }

    // Log activity
    try {
      await ActivityLog.create({
        businessId: businessOwner._id,
        action: 'CARD_UPDATED',
        details: {
          totalStamps,
          rewardText
        }
      });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    res.json({
      success: true,
      message: 'Stamp card updated successfully',
      data: {
        stampCard: businessOwner.stampCard
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating stamp card',
      error: error.message
    });
  }
};

/**
 * Get business owner's statistics
 */
const getMyStats = async (req, res) => {
  try {
    const businessId = req.user._id;
    const Customer = require('../models/Customer');

    // Get all customers for this business
    const customers = await Customer.find({ businessId });

    // Calculate stats
    const totalCustomers = customers.length;
    const totalStampsGiven = customers.reduce((sum, customer) => sum + customer.stamps, 0);
    const totalRewardsRedeemed = customers.filter(c => c.rewardAchieved).length;

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalStampsGiven,
        totalRewardsRedeemed,
        recentActivity: [] // TODO: Implement recent activity tracking
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
};

module.exports = {
  getMyCard,
  updateCard,
  getMyStats
};
