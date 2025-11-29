const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessOwner',
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: ['STAMP_GIVEN', 'REWARD_REDEEMED', 'CARD_UPDATED', 'PROFILE_UPDATED', 'SUBSCRIPTION_UPDATED']
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index for efficient querying of recent activities for a business
activityLogSchema.index({ businessId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
