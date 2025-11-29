const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const businessOwnerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password required only if not using Google
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  qrToken: {
    type: String,
    unique: true,
    default: () => uuidv4()
  },
  stampCard: {
    totalStamps: {
      type: Number,
      default: 10,
      min: [1, 'Total stamps must be at least 1']
    },
    rewardText: {
      type: String,
      default: 'Free Reward',
      trim: true
    }
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
businessOwnerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
businessOwnerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('BusinessOwner', businessOwnerSchema);

