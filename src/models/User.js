// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   userId: { 
//     type: String, 
//     required: true, 
//     unique: true,
//     trim: true
//   },
  
//   pin: { 
//     type: String, 
//     required: true 
//   },

//   role: {
//     type: String,
//     enum: ["user", "admin"],
//     default: "user"
//   },

//     firstDepositCompleted: { type: Boolean, default: false },
//   firstAcceptCompleted: { type: Boolean, default: false },

//   referralCode: { type: String, unique: true },
//   referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  
//   // 21-Level Referral Tree with Leg structure
//   referralTree: {
//     // Level 1-3 (Leg 1)
//     level1: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level2: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level3: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
//     // Level 4-6 (Leg 2)
//     level4: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level5: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level6: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
//     // Level 7-9 (Leg 3)
//     level7: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level8: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level9: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
//     // Level 10-12 (Leg 4)
//     level10: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level11: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level12: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
//     // Level 13-15 (Leg 5)
//     level13: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level14: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level15: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
//     // Level 16-18 (Leg 6)
//     level16: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level17: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level18: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
//     // Level 19-21 (Leg 7)
//     level19: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level20: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     level21: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
//   },
  
//   // ✅ FIXED: Commission Rates per level - type सह
//   referralRates: {
//     level1: { type: Number, default: 0.30 },
//     level2: { type: Number, default: 0.15 },
//     level3: { type: Number, default: 0.10 },
//     level4: { type: Number, default: 0.05 },
//     level5: { type: Number, default: 0.30 },
//     level6: { type: Number, default: 0.03 },
//     level7: { type: Number, default: 0.04 },
//     level8: { type: Number, default: 0.03 },
//     level9: { type: Number, default: 0.03 },
//     level10: { type: Number, default: 0.30 },
//     level11: { type: Number, default: 0.03 },
//     level12: { type: Number, default: 0.03 },
//     level13: { type: Number, default: 0.03 },
//     level14: { type: Number, default: 0.03 },
//     level15: { type: Number, default: 0.03 },
//     level16: { type: Number, default: 0.05 },
//     level17: { type: Number, default: 0.10 },
//     level18: { type: Number, default: 0.15 },
//     level19: { type: Number, default: 0.30 },
//     level20: { type: Number, default: 0.30 },
//     level21: { type: Number, default: 0.63 }
//   },
  
//   // Earnings by level
//   referralEarnings: {
//     level1: { type: Number, default: 0 },
//     level2: { type: Number, default: 0 },
//     level3: { type: Number, default: 0 },
//     level4: { type: Number, default: 0 },
//     level5: { type: Number, default: 0 },
//     level6: { type: Number, default: 0 },
//     level7: { type: Number, default: 0 },
//     level8: { type: Number, default: 0 },
//     level9: { type: Number, default: 0 },
//     level10: { type: Number, default: 0 },
//     level11: { type: Number, default: 0 },
//     level12: { type: Number, default: 0 },
//     level13: { type: Number, default: 0 },
//     level14: { type: Number, default: 0 },
//     level15: { type: Number, default: 0 },
//     level16: { type: Number, default: 0 },
//     level17: { type: Number, default: 0 },
//     level18: { type: Number, default: 0 },
//     level19: { type: Number, default: 0 },
//     level20: { type: Number, default: 0 },
//     level21: { type: Number, default: 0 },
//     total: { type: Number, default: 0 }
//   },

//   // Team Cashback Summary
//   teamCashback: {
//     level1: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level2: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level3: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level4: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level5: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level6: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level7: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level8: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level9: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level10: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level11: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level12: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level13: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level14: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level15: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level16: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level17: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level18: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level19: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level20: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
//     level21: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
//   },

//   // Leg unlocking status (7 legs for 21 levels)
//   legsUnlocked: {
//     leg1: { type: Boolean, default: true },  // Levels 1-3
//     leg2: { type: Boolean, default: false }, // Levels 4-6
//     leg3: { type: Boolean, default: false }, // Levels 7-9
//     leg4: { type: Boolean, default: false }, // Levels 10-12
//     leg5: { type: Boolean, default: false }, // Levels 13-15
//     leg6: { type: Boolean, default: false }, // Levels 16-18
//     leg7: { type: Boolean, default: false }  // Levels 19-21
//   },

//   walletActivated: { type: Boolean, default: false },
//   activationDate: { type: Date, default: null },
//   dailyAcceptLimit: { type: Number, default: 1000 },
//   todayAcceptedTotal: { type: Number, default: 0 },
//   todayAcceptedCount: { type: Number, default: 0 }

// }, { timestamps: true });

// // Hash PIN before saving
// userSchema.pre('save', async function (next) {
//   if (this.isModified('pin')) {
//     try {
//       const salt = await bcrypt.genSalt(10);
//       this.pin = await bcrypt.hash(this.pin, salt);
//     } catch (error) {
//       return next(error);
//     }
//   }
//   next();
// });

// // Generate referral code
// userSchema.pre('save', async function (next) {
//   if (this.referralCode) return next();
  
//   let code;
//   let exists;
  
//   do {
//     code = Math.random().toString(36).substring(2, 8).toUpperCase();
//     exists = await mongoose.models.User.findOne({ referralCode: code });
//   } while (exists);
  
//   this.referralCode = code;
//   next();
// });

// // Method to check if a leg is unlocked
// userSchema.methods.isLegUnlocked = function(level) {
//   if (level <= 3) return true; // Leg 1 always unlocked
  
//   const legMap = {
//     4: 'leg2', 5: 'leg2', 6: 'leg2',
//     7: 'leg3', 8: 'leg3', 9: 'leg3',
//     10: 'leg4', 11: 'leg4', 12: 'leg4',
//     13: 'leg5', 14: 'leg5', 15: 'leg5',
//     16: 'leg6', 17: 'leg6', 18: 'leg6',
//     19: 'leg7', 20: 'leg7', 21: 'leg7'
//   };
  
//   const leg = legMap[level];
//   return this.legsUnlocked && this.legsUnlocked[leg];
// };

// // Method to unlock next leg
// userSchema.methods.unlockNextLeg = async function() {
//   if (!this.legsUnlocked.leg2 && this.referralTree.level3?.length > 0) {
//     this.legsUnlocked.leg2 = true;
//   }
//   if (!this.legsUnlocked.leg3 && this.referralTree.level6?.length > 0) {
//     this.legsUnlocked.leg3 = true;
//   }
//   if (!this.legsUnlocked.leg4 && this.referralTree.level9?.length > 0) {
//     this.legsUnlocked.leg4 = true;
//   }
//   if (!this.legsUnlocked.leg5 && this.referralTree.level12?.length > 0) {
//     this.legsUnlocked.leg5 = true;
//   }
//   if (!this.legsUnlocked.leg6 && this.referralTree.level15?.length > 0) {
//     this.legsUnlocked.leg6 = true;
//   }
//   if (!this.legsUnlocked.leg7 && this.referralTree.level18?.length > 0) {
//     this.legsUnlocked.leg7 = true;
//   }
//   await this.save();
// };

// // Add to referral tree with leg unlocking logic
// userSchema.statics.addToReferralTree = async function(userId, referrerId, currentLevel = 1) {
//   if (currentLevel > 21 || !referrerId) return;
  
//   const User = this;
//   const referrer = await User.findById(referrerId);
  
//   if (!referrer) return;
  
//   // Check if this level's leg is unlocked
//   if (!referrer.isLegUnlocked(currentLevel)) {
//     // console.log(`Level ${currentLevel} leg not unlocked for user ${referrerId}`);
//     return;
//   }
  
//   const updateField = `referralTree.level${currentLevel}`;
  
//   await User.findByIdAndUpdate(
//     referrerId,
//     { $addToSet: { [updateField]: userId } }
//   );
  
//   // Update team cashback stats
//   await User.findByIdAndUpdate(
//     referrerId,
//     { 
//       $inc: { 
//         [`teamCashback.level${currentLevel}.count`]: 1
//       } 
//     }
//   );
  
//   // Check if we need to unlock next leg
//   if (currentLevel === 3 || currentLevel === 6 || currentLevel === 9 || 
//       currentLevel === 12 || currentLevel === 15 || currentLevel === 18) {
//     await referrer.unlockNextLeg();
//   }
  
//   // Recursively add to next level
//   if (referrer.referredBy) {
//     await User.addToReferralTree(userId, referrer.referredBy, currentLevel + 1);
//   }
// };

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },

  email: {                    // ✅ Email field add केला
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
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

  firstDepositCompleted: { type: Boolean, default: false },
  firstAcceptCompleted: { type: Boolean, default: false },

  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  
  // 21-Level Referral Tree with Leg structure
  referralTree: {
    level1: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level2: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level3: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level4: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level5: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level6: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level7: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level8: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level9: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level10: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level11: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level12: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level13: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level14: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level15: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level16: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level17: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level18: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level19: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level20: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level21: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  
  referralRates: {
    level1: { type: Number, default: 0.30 },
    level2: { type: Number, default: 0.15 },
    level3: { type: Number, default: 0.10 },
    level4: { type: Number, default: 0.05 },
    level5: { type: Number, default: 0.30 },
    level6: { type: Number, default: 0.03 },
    level7: { type: Number, default: 0.04 },
    level8: { type: Number, default: 0.03 },
    level9: { type: Number, default: 0.03 },
    level10: { type: Number, default: 0.30 },
    level11: { type: Number, default: 0.03 },
    level12: { type: Number, default: 0.03 },
    level13: { type: Number, default: 0.03 },
    level14: { type: Number, default: 0.03 },
    level15: { type: Number, default: 0.03 },
    level16: { type: Number, default: 0.05 },
    level17: { type: Number, default: 0.10 },
    level18: { type: Number, default: 0.15 },
    level19: { type: Number, default: 0.30 },
    level20: { type: Number, default: 0.30 },
    level21: { type: Number, default: 0.63 }
  },
  
  referralEarnings: {
    level1: { type: Number, default: 0 },
    level2: { type: Number, default: 0 },
    level3: { type: Number, default: 0 },
    level4: { type: Number, default: 0 },
    level5: { type: Number, default: 0 },
    level6: { type: Number, default: 0 },
    level7: { type: Number, default: 0 },
    level8: { type: Number, default: 0 },
    level9: { type: Number, default: 0 },
    level10: { type: Number, default: 0 },
    level11: { type: Number, default: 0 },
    level12: { type: Number, default: 0 },
    level13: { type: Number, default: 0 },
    level14: { type: Number, default: 0 },
    level15: { type: Number, default: 0 },
    level16: { type: Number, default: 0 },
    level17: { type: Number, default: 0 },
    level18: { type: Number, default: 0 },
    level19: { type: Number, default: 0 },
    level20: { type: Number, default: 0 },
    level21: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },

  teamCashback: {
    level1: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level2: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level3: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level4: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level5: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level6: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level7: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level8: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level9: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level10: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level11: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level12: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level13: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level14: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level15: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level16: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level17: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level18: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level19: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level20: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    level21: { total: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
  },

  legsUnlocked: {
    leg1: { type: Boolean, default: true },
    leg2: { type: Boolean, default: false },
    leg3: { type: Boolean, default: false },
    leg4: { type: Boolean, default: false },
    leg5: { type: Boolean, default: false },
    leg6: { type: Boolean, default: false },
    leg7: { type: Boolean, default: false }
  },

  // ✅ Wallet Activation Fields
  walletActivated: { type: Boolean, default: false },
  activationDate: { type: Date, default: null },
  activationExpiryDate: { type: Date, default: null },
  dailyAcceptLimit: { type: Number, default: 1000 },
  
  // ✅ 7-Day Limit Fields
  sevenDayTotalAccepted: { type: Number, default: 0 },
  sevenDayResetDate: { type: Date, default: null },
  activationHistory: [{
    date: { type: Date, default: Date.now },
    limit: Number,
    amount: Number,
    expiryDate: Date,
    status: { type: String, enum: ['ACTIVE', 'EXPIRED'], default: 'ACTIVE' }
  }],
  
// models/User.js - Add this to existing schema

autoRequest: {
  // First request tracking
  firstRequestCreated: { type: Boolean, default: false },
  firstRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "Scanner", default: null },
  firstRequestAmount: { type: Number, default: 0 },
  firstRequestCreatedAt: { type: Date, default: null },
  firstRequestExpiresAt: { type: Date, default: null },
  firstRequestCompleted: { type: Boolean, default: false },
  firstRequestCompletedAt: { type: Date, default: null },
  
  // Second request tracking (30 minutes later)
  secondRequestCreated: { type: Boolean, default: false },
  secondRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "Scanner", default: null },
  secondRequestAmount: { type: Number, default: 0 },
  secondRequestCreatedAt: { type: Date, default: null },
  secondRequestExpiresAt: { type: Date, default: null },
  secondRequestCompleted: { type: Boolean, default: false },
  secondRequestCompletedAt: { type: Date, default: null },
  
  // Schedule tracking
  nextRequestScheduledAt: { type: Date, default: null },
  autoRequestCompleted: { type: Boolean, default: false },
  
  // Stats
  totalAutoRequests: { type: Number, default: 0 },
  autoRequestsAccepted: { type: Number, default: 0 },
  currentRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "Scanner", default: null }
}

}, { timestamps: true });

// Hash PIN before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('pin')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.pin = await bcrypt.hash(this.pin, salt);
    } catch (error) {
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

// ✅ Method to check if activation is expired (7 days)
userSchema.methods.isActivationExpired = function() {
  if (!this.activationExpiryDate) return true;
  return new Date() > this.activationExpiryDate;
};

// ✅ Method to get remaining days
userSchema.methods.getRemainingDays = function() {
  if (!this.activationExpiryDate) return 0;
  const diffTime = this.activationExpiryDate - new Date();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

// ✅ Method to reset 7-day totals if needed
userSchema.methods.checkAndResetSevenDay = function() {
  if (this.sevenDayResetDate && new Date() > this.sevenDayResetDate) {
    this.sevenDayTotalAccepted = 0;
    const newResetDate = new Date();
    newResetDate.setDate(newResetDate.getDate() + 7);
    this.sevenDayResetDate = newResetDate;
    return true;
  }
  return false;
};

// Method to check if a leg is unlocked
userSchema.methods.isLegUnlocked = function(level) {
  if (level <= 3) return true;
  
  const legMap = {
    4: 'leg2', 5: 'leg2', 6: 'leg2',
    7: 'leg3', 8: 'leg3', 9: 'leg3',
    10: 'leg4', 11: 'leg4', 12: 'leg4',
    13: 'leg5', 14: 'leg5', 15: 'leg5',
    16: 'leg6', 17: 'leg6', 18: 'leg6',
    19: 'leg7', 20: 'leg7', 21: 'leg7'
  };
  
  const leg = legMap[level];
  return this.legsUnlocked && this.legsUnlocked[leg];
};

// Method to unlock next leg
userSchema.methods.unlockNextLeg = async function() {
  if (!this.legsUnlocked.leg2 && this.referralTree.level3?.length > 0) {
    this.legsUnlocked.leg2 = true;
  }
  if (!this.legsUnlocked.leg3 && this.referralTree.level6?.length > 0) {
    this.legsUnlocked.leg3 = true;
  }
  if (!this.legsUnlocked.leg4 && this.referralTree.level9?.length > 0) {
    this.legsUnlocked.leg4 = true;
  }
  if (!this.legsUnlocked.leg5 && this.referralTree.level12?.length > 0) {
    this.legsUnlocked.leg5 = true;
  }
  if (!this.legsUnlocked.leg6 && this.referralTree.level15?.length > 0) {
    this.legsUnlocked.leg6 = true;
  }
  if (!this.legsUnlocked.leg7 && this.referralTree.level18?.length > 0) {
    this.legsUnlocked.leg7 = true;
  }
  await this.save();
};

// Add to referral tree with leg unlocking logic
userSchema.statics.addToReferralTree = async function(userId, referrerId, currentLevel = 1) {
  if (currentLevel > 21 || !referrerId) return;
  
  const User = this;
  const referrer = await User.findById(referrerId);
  
  if (!referrer) return;
  
  if (!referrer.isLegUnlocked(currentLevel)) {
    return;
  }
  
  const updateField = `referralTree.level${currentLevel}`;
  
  await User.findByIdAndUpdate(
    referrerId,
    { $addToSet: { [updateField]: userId } }
  );
  
  await User.findByIdAndUpdate(
    referrerId,
    { 
      $inc: { 
        [`teamCashback.level${currentLevel}.count`]: 1
      } 
    }
  );
  
  if (currentLevel === 3 || currentLevel === 6 || currentLevel === 9 || 
      currentLevel === 12 || currentLevel === 15 || currentLevel === 18) {
    await referrer.unlockNextLeg();
  }
  
  if (referrer.referredBy) {
    await User.addToReferralTree(userId, referrer.referredBy, currentLevel + 1);
  }
};

module.exports = mongoose.model('User', userSchema);