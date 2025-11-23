const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const customerSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessOwner',
    required: [true, 'Business ID is required'],
    index: true
  },
  deviceId: {
    type: String,
    required: [true, 'Device ID is required'],
    default: () => uuidv4()
  },
  stamps: {
    type: Number,
    default: 0,
    min: [0, 'Stamps cannot be negative']
  },
  rewardAchieved: {
    type: Boolean,
    default: false
  },
  lastStampTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure one customer per business per device
customerSchema.index({ businessId: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);

