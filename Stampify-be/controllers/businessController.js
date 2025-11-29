const BusinessOwner = require('../models/BusinessOwner');
const Customer = require('../models/Customer');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');

/**
 * Get all customers for the authenticated business
 */
const getCustomers = async (req, res) => {
    try {
        const businessId = req.user.id;

        const customers = await Customer.find({ businessId })
            .select('name email phone stamps lastStampTime rewardAchieved createdAt')
            .sort({ lastStampTime: -1 });

        res.json({
            success: true,
            data: customers
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
 * Get activity logs for the authenticated business
 */
const getActivityLogs = async (req, res) => {
    try {
        const businessId = req.user.id;
        const limit = parseInt(req.query.limit) || 50;

        const logs = await ActivityLog.find({ businessId })
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching activity logs',
            error: error.message
        });
    }
};

/**
 * Get analytics data for dashboard
 */
const getAnalytics = async (req, res) => {
    try {
        const businessId = req.user.id;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 1. Key Metrics (Last 30 Days)
        const totalStamps = await ActivityLog.countDocuments({
            businessId,
            action: 'STAMP_GIVEN',
            createdAt: { $gte: thirtyDaysAgo }
        });

        const newCustomers = await Customer.countDocuments({
            businessId,
            createdAt: { $gte: thirtyDaysAgo }
        });

        const rewardsRedeemed = await ActivityLog.countDocuments({
            businessId,
            action: 'REWARD_REDEEMED',
            createdAt: { $gte: thirtyDaysAgo }
        });

        // 2. Activity Over Time (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activityData = await ActivityLog.aggregate([
            {
                $match: {
                    businessId: new mongoose.Types.ObjectId(businessId),
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    stamps: {
                        $sum: { $cond: [{ $eq: ["$action", "STAMP_GIVEN"] }, 1, 0] }
                    },
                    rewards: {
                        $sum: { $cond: [{ $eq: ["$action", "REWARD_REDEEMED"] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 3. Peak Hours (All Time)
        const peakHoursData = await ActivityLog.aggregate([
            {
                $match: {
                    businessId: new mongoose.Types.ObjectId(businessId),
                    action: 'STAMP_GIVEN'
                }
            },
            {
                $group: {
                    _id: { $hour: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                metrics: {
                    totalStamps,
                    newCustomers,
                    rewardsRedeemed
                },
                activity: activityData,
                peakHours: peakHoursData
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};

const { sendReminderEmail } = require('../services/emailService');

/**
 * Send a reminder email to a customer
 */
const sendCustomerReminder = async (req, res) => {
    try {
        const businessId = req.user.id;
        const { customerId } = req.params;

        // 1. Find customer and verify ownership
        const customer = await Customer.findOne({ _id: customerId, businessId });
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // 2. Check if customer has email
        if (!customer.email) {
            return res.status(400).json({
                success: false,
                message: 'Customer does not have an email address'
            });
        }

        // 3. Rate Limit Check (1 reminder per 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const lastReminder = await ActivityLog.findOne({
            businessId,
            action: 'REMINDER_SENT',
            'details.customerId': customer._id,
            createdAt: { $gte: sevenDaysAgo }
        });

        if (lastReminder) {
            return res.status(429).json({
                success: false,
                message: 'Reminder already sent recently. Please wait 7 days between reminders.'
            });
        }

        // 4. Send Email
        const business = await BusinessOwner.findById(businessId);
        const emailResult = await sendReminderEmail(
            customer.email,
            customer.name,
            business.businessName
        );

        if (!emailResult.success) {
            throw new Error(emailResult.error);
        }

        // 5. Log Activity
        await ActivityLog.create({
            businessId,
            action: 'REMINDER_SENT',
            details: {
                customerId: customer._id,
                customerName: customer.name || 'Unknown',
                email: customer.email
            }
        });

        res.json({
            success: true,
            message: 'Reminder email sent successfully'
        });

    } catch (error) {
        console.error('Reminder Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending reminder',
            error: error.message
        });
    }
};

module.exports = {
    getCustomers,
    getActivityLogs,
    getAnalytics,
    sendCustomerReminder
};
