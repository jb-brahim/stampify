const BusinessOwner = require('../models/BusinessOwner');
const Customer = require('../models/Customer');
const ActivityLog = require('../models/ActivityLog');

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

module.exports = {
    getCustomers,
    getActivityLogs
};
