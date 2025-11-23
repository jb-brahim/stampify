const Customer = require('../models/Customer');
const BusinessOwner = require('../models/BusinessOwner');

/**
 * Get customer card information
 */
const getCustomerCard = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId).populate('businessId', 'businessName stampCard');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const businessOwner = customer.businessId;
    if (!businessOwner) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const progress = (customer.stamps / businessOwner.stampCard.totalStamps) * 100;

    res.json({
      success: true,
      data: {
        customer: {
          customerId: customer._id,
          stamps: customer.stamps,
          rewardAchieved: customer.rewardAchieved
        },
        business: {
          businessName: businessOwner.businessName,
          totalStamps: businessOwner.stampCard.totalStamps,
          rewardText: businessOwner.stampCard.rewardText
        },
        progress: Math.min(progress, 100),
        stampsRemaining: Math.max(0, businessOwner.stampCard.totalStamps - customer.stamps)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer card',
      error: error.message
    });
  }
};

module.exports = {
  getCustomerCard
};

