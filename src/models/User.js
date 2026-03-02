// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Make sure this is bcryptjs

const userSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  
  pin: { 
    type: String, 
    required: true 
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  totalReferrals: { type: Number, default: 0 },
  
  referralTree: {
    level1: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level2: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level3: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level4: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level5: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  
  referralEarnings: {
    level1: { type: Number, default: 0 },
    level2: { type: Number, default: 0 },
    level3: { type: Number, default: 0 },
    level4: { type: Number, default: 0 },
    level5: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },

  walletActivated: { type: Boolean, default: false },
  activationDate: { type: Date, default: null },
 dailyAcceptLimit: { type: Number, default: 1000 }, // ₹ मध्ये
    todayAcceptedTotal: { type: Number, default: 0 }, // Amount wise
  todayAcceptedCount: { type: Number, default: 0 }, // Count wise

}, { timestamps: true });

// ✅ FIXED: Hash PIN before saving
userSchema.pre('save', async function (next) {
  // Only hash if the pin is modified (and it's not already hashed)
  if (this.isModified('pin')) {
    console.log("Hashing PIN for user:", this.userId);
    try {
      const salt = await bcrypt.genSalt(10);
      this.pin = await bcrypt.hash(this.pin, salt);
      console.log("PIN hashed successfully");
    } catch (error) {
      console.error("Error hashing PIN:", error);
      return next(error);
    }
  }
  next();
});

// Generate referral code
userSchema.pre('save', async function (next) {
  if (this.referralCode) return next();
  
  let code;
  let exists;
  
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    exists = await mongoose.models.User.findOne({ referralCode: code });
  } while (exists);
  
  this.referralCode = code;
  next();
});

// Method to add to referral tree
userSchema.statics.addToReferralTree = async function(userId, referrerId, currentLevel = 1) {
  if (currentLevel > 5 || !referrerId) return;
  
  const User = this;
  const updateField = `referralTree.level${currentLevel}`;
  
  await User.findByIdAndUpdate(
    referrerId,
    { $addToSet: { [updateField]: userId } }
  );
  
  const referrer = await User.findById(referrerId);
  if (referrer && referrer.referredBy) {
    await User.addToReferralTree(userId, referrer.referredBy, currentLevel + 1);
  }
};

module.exports = mongoose.model('User', userSchema);