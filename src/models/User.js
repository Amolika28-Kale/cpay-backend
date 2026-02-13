const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },

email: { 
  type: String, 
  required: true, 
  unique: true,
  lowercase: true,
  trim: true
},


  password: { 
    type: String, 
    required: true 
  },

role: {
  type: String,
  enum: ["user"],
  default: "user"
},


  referralCode: {
    type: String,
    unique: true
  },

  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }

}, { timestamps: true });


// 🔐 Password Hash
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // 🔥 Generate unique referral code
  if (!this.referralCode) {
    let code;
    let exists;

    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      exists = await mongoose.models.User.findOne({ referralCode: code });
    } while (exists);

    this.referralCode = code;
  }

  next();
});

module.exports = mongoose.model('User', userSchema);
