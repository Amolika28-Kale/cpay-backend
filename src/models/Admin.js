const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  adminId: { 
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
    default: 'admin' 
  }
}, { timestamps: true });

// Hash PIN before saving
adminSchema.pre('save', async function (next) {
  if (this.isModified('pin')) {
    this.pin = await bcrypt.hash(this.pin, 10);
  }
  next();
});

module.exports = mongoose.model('Admin', adminSchema);