const Customer = require('../models/Customer');
const BusinessOwner = require('../models/BusinessOwner');

/**
 * Request a reward redemption (Customer side)
 */
const requestRedemption = async (req, res) => {
    try {
        const { customerId, deviceId } = req.body;

        if (!customerId || !deviceId) {
            return res.status(400).json({
                success: false,
                message: 'Customer ID and Device ID are required'
            });
        }

        const customer = await Customer.findOne({ _id: customerId, deviceId });
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found or device mismatch'
            });
        }

        // Get business to check total stamps required
        const business = await BusinessOwner.findById(customer.businessId);
        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        // Check if eligible
        if (customer.stamps < business.stampCard.totalStamps) {
            return res.status(400).json({
                success: false,
                message: 'Not enough stamps to redeem reward'
            });
        }

        // Check if already has a pending request
        const hasPending = customer.redemptionRequests.some(r => r.status === 'pending');
        if (hasPending) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending redemption request'
            });
        }

        // Add request
        customer.redemptionRequests.push({
            status: 'pending',
            requestedAt: new Date()
        });

        await customer.save();

        res.json({
            success: true,
            message: 'Redemption requested! Waiting for business approval.',
            data: customer
        });

    } catch (error) {
        console.error('Redemption Request Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error requesting redemption',
            error: error.message
        });
    }
};

/**
 * Get pending redemptions (Business side)
 */
const getPendingRedemptions = async (req, res) => {
    try {
        const businessId = req.user.id; // From auth middleware

        // Find customers with pending requests for this business
        const customers = await Customer.find({
            businessId,
            'redemptionRequests.status': 'pending'
        });

        // Extract relevant info
        const pendingRedemptions = customers.flatMap(customer =>
            customer.redemptionRequests
                .filter(r => r.status === 'pending')
                .map(r => ({
                    redemptionId: r._id,
                    customerId: customer._id,
                    requestedAt: r.requestedAt,
                    stamps: customer.stamps,
                    deviceId: customer.deviceId // Maybe show partial ID?
                }))
        );

        res.json({
            success: true,
            data: pendingRedemptions
        });

    } catch (error) {
        console.error('Get Pending Redemptions Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching redemptions',
            error: error.message
        });
    }
};

/**
 * Approve redemption (Business side)
 */
const approveRedemption = async (req, res) => {
    try {
        const { customerId, redemptionId } = req.body;
        const businessId = req.user.id;

        const customer = await Customer.findOne({ _id: customerId, businessId });
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const request = customer.redemptionRequests.id(redemptionId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Redemption request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request is not pending'
            });
        }

        // Get business settings to know how many stamps to deduct (usually all, or set amount)
        // For now, we assume it resets to 0 or deducts totalStamps.
        // Let's deduct totalStamps to allow carry-over if they have extra?
        // Or just reset to 0. Most simple cards reset.
        // Let's fetch business to be safe.
        const business = await BusinessOwner.findById(businessId);
        const cost = business.stampCard.totalStamps;

        if (customer.stamps < cost) {
            return res.status(400).json({
                success: false,
                message: 'Customer no longer has enough stamps'
            });
        }

        // Approve
        request.status = 'approved';
        request.redeemedAt = new Date();

        // Deduct stamps
        customer.stamps = Math.max(0, customer.stamps - cost);
        customer.rewardAchieved = false; // Reset flag

        await customer.save();

        res.json({
            success: true,
            message: 'Redemption approved!',
            data: {
                stamps: customer.stamps,
                redemption: request
            }
        });

    } catch (error) {
        console.error('Approve Redemption Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving redemption',
            error: error.message
        });
    }
};

/**
 * Reject redemption (Business side)
 */
const rejectRedemption = async (req, res) => {
    try {
        const { customerId, redemptionId } = req.body;
        const businessId = req.user.id;

        const customer = await Customer.findOne({ _id: customerId, businessId });
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const request = customer.redemptionRequests.id(redemptionId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Redemption request not found'
            });
        }

        request.status = 'rejected';
        await customer.save();

        res.json({
            success: true,
            message: 'Redemption rejected'
        });

    } catch (error) {
        console.error('Reject Redemption Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting redemption',
            error: error.message
        });
    }
};

module.exports = {
    requestRedemption,
    getPendingRedemptions,
    approveRedemption,
    rejectRedemption
};
