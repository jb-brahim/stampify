const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const BusinessOwner = require('../models/BusinessOwner');
const Customer = require('../models/Customer');

/**
 * Admin login
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user
    const admin = await AdminUser.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token with admin role (24 hour expiration)
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during admin login',
      error: error.message
    });
  }
};

/**
 * Get all business owners with customer counts
 */
const getAllBusinesses = async (req, res) => {
  try {
    // Find all business owners
    const businesses = await BusinessOwner.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    // If no businesses found, return empty array
    if (!businesses || businesses.length === 0) {
      return res.json({
        success: true,
        message: 'No business owners found',
        data: {
          businesses: [],
          total: 0
        }
      });
    }

    // Get customer counts for each business
    const businessesWithCounts = await Promise.all(
      businesses.map(async (business) => {
        const customerCount = await Customer.countDocuments({
          businessId: business._id
        });

        return {
          id: business._id,
          email: business.email,
          businessName: business.businessName,
          qrToken: business.qrToken,
          stampCard: business.stampCard,
          subscriptionStatus: business.subscriptionStatus || 'active',
          subscriptionExpiry: business.subscriptionExpiry || null,
          customerCount,
          createdAt: business.createdAt,
          updatedAt: business.updatedAt
        };
      })
    );

    res.json({
      success: true,
      message: 'Business owners retrieved successfully',
      data: {
        businesses: businessesWithCounts,
        total: businessesWithCounts.length
      }
    });
  } catch (error) {
    console.error('Error in getAllBusinesses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching business owners',
      error: error.message
    });
  }
};

/**
 * Get customers for a specific business owner
 */
const getBusinessCustomers = async (req, res) => {
  try {
    const { businessId } = req.params;

    // Verify business owner exists
    const businessOwner = await BusinessOwner.findById(businessId);
    if (!businessOwner) {
      return res.status(404).json({
        success: false,
        message: 'Business owner not found'
      });
    }

    // Get all customers for this business
    const customers = await Customer.find({ businessId })
      .populate('businessId', 'businessName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Customers retrieved successfully',
      data: {
        business: {
          id: businessOwner._id,
          businessName: businessOwner.businessName,
          email: businessOwner.email
        },
        customers: customers.map(customer => ({
          id: customer._id,
          deviceId: customer.deviceId,
          stamps: customer.stamps,
          rewardAchieved: customer.rewardAchieved,
          lastStampTime: customer.lastStampTime,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt
        })),
        total: customers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

/**
 * Get all customers platform-wide
 */
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate('businessId', 'businessName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'All customers retrieved successfully',
      data: {
        customers: customers.map(customer => ({
          id: customer._id,
          deviceId: customer.deviceId,
          stamps: customer.stamps,
          rewardAchieved: customer.rewardAchieved,
          lastStampTime: customer.lastStampTime,
          businessName: customer.businessId?.businessName || 'Unknown',
          businessEmail: customer.businessId?.email || 'Unknown',
          createdAt: customer.createdAt
        })),
        total: customers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

/**
 * Update business owner subscription status
 */
const updateSubscription = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { subscriptionStatus, subscriptionExpiry } = req.body;

    // Validate subscription status
    if (subscriptionStatus && !['active', 'suspended'].includes(subscriptionStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription status. Must be "active" or "suspended"'
      });
    }

    // Find business owner
    const businessOwner = await BusinessOwner.findById(businessId);
    if (!businessOwner) {
      return res.status(404).json({
        success: false,
        message: 'Business owner not found'
      });
    }

    // Update subscription fields
    const updateData = {};
    if (subscriptionStatus) {
      updateData.subscriptionStatus = subscriptionStatus;
    }
    if (subscriptionExpiry !== undefined) {
      updateData.subscriptionExpiry = subscriptionExpiry ? new Date(subscriptionExpiry) : null;
    }

    const updatedBusiness = await BusinessOwner.findByIdAndUpdate(
      businessId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: `Subscription ${subscriptionStatus === 'suspended' ? 'suspended' : 'updated'} successfully`,
      data: {
        business: {
          id: updatedBusiness._id,
          email: updatedBusiness.email,
          businessName: updatedBusiness.businessName,
          subscriptionStatus: updatedBusiness.subscriptionStatus,
          subscriptionExpiry: updatedBusiness.subscriptionExpiry
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating subscription',
      error: error.message
    });
  }
};

/**
 * Get admin dashboard statistics
 */
const getStats = async (req, res) => {
  try {
    // Get total businesses
    const totalBusinesses = await BusinessOwner.countDocuments();

    // Get total customers
    const totalCustomers = await Customer.countDocuments();

    // Get active vs suspended businesses
    const activeBusinesses = await BusinessOwner.countDocuments({
      subscriptionStatus: 'active'
    });
    const suspendedBusinesses = await BusinessOwner.countDocuments({
      subscriptionStatus: 'suspended'
    });

    // Get total stamps given (sum of all customer stamps)
    const stampStats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalStampsGiven: { $sum: '$stamps' },
          customersWithRewards: {
            $sum: { $cond: ['$rewardAchieved', 1, 0] }
          }
        }
      }
    ]);

    const stats = stampStats[0] || {
      totalStampsGiven: 0,
      customersWithRewards: 0
    };

    // Get businesses by customer count
    const businessActivity = await Customer.aggregate([
      {
        $group: {
          _id: '$businessId',
          customerCount: { $sum: 1 },
          totalStamps: { $sum: '$stamps' }
        }
      },
      {
        $lookup: {
          from: 'businessowners',
          localField: '_id',
          foreignField: '_id',
          as: 'business'
        }
      },
      {
        $unwind: '$business'
      },
      {
        $project: {
          businessName: '$business.businessName',
          customerCount: 1,
          totalStamps: 1
        }
      },
      {
        $sort: { totalStamps: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        overview: {
          totalBusinesses,
          totalCustomers,
          activeBusinesses,
          suspendedBusinesses
        },
        stampActivity: {
          totalStampsGiven: stats.totalStampsGiven,
          customersWithRewards: stats.customersWithRewards,
          averageStampsPerCustomer: totalCustomers > 0
            ? (stats.totalStampsGiven / totalCustomers).toFixed(2)
            : 0
        },
        topBusinesses: businessActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = {
  adminLogin,
  getAllBusinesses,
  getBusinessCustomers,
  getAllCustomers,
  updateSubscription,
  getStats
};
