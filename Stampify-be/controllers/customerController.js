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



/**
 * Register a new customer and add first stamp
 */
const registerCustomer = async (req, res) => {
  try {
    console.log('Register Body:', req.body);
    const { businessId, name, email, phone } = req.body;

    if (!businessId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Business ID, Name, and Email are required'
      });
    }

    // Verify business exists
    const businessOwner = await BusinessOwner.findById(businessId);
    if (!businessOwner) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if customer already exists
    let customer = await Customer.findOne({
      businessId,
      email: email.toLowerCase().trim()
    });
    if (customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer already registered with this email'
      });
    }

    // Create new customer
    customer = new Customer({
      businessId,
      name,
      email: email.toLowerCase().trim(),
      phone,
      stamps: 1,
      lastStampTime: new Date()
    });

    await customer.save();

    res.json({
      success: true,
      message: 'Registration successful! First stamp added.',
      data: {
        customerId: customer._id,
        stamps: customer.stamps,
        totalStamps: businessOwner.stampCard.totalStamps,
        rewardAchieved: false,
        progress: (customer.stamps / businessOwner.stampCard.totalStamps) * 100,
        business: {
          id: businessOwner._id,
          name: businessOwner.businessName,
          logo: businessOwner.logo,
          rewardText: businessOwner.stampCard.rewardText
        }
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering customer',
      error: error.message
    });
  }
};

module.exports = {
  getCustomerCard,
  registerCustomer
};

