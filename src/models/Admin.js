// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const adminSchema = new mongoose.Schema({
//   adminId: { 
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
//     default: 'admin' 
//   }
// }, { timestamps: true });

// // Hash PIN before saving
// adminSchema.pre('save', async function (next) {
//   if (this.isModified('pin')) {
//     this.pin = await bcrypt.hash(this.pin, 10);
//   }
//   next();
// });

// module.exports = mongoose.model('Admin', adminSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  adminId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    match: [/^\d{6}$/, 'Admin ID must be exactly 6 digits'] // 6-digit validation
  },
  pin: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'superadmin'],
    default: 'admin' 
  },
  name: { 
    type: String,
    default: 'Admin'
  },
  email: {
    type: String,
    sparse: true
  },
  permissions: [{
    type: String,
    enum: ['all', 'deposits', 'withdrawals', 'users', 'scanners', 'rates']
  }],
  lastLogin: Date
}, { timestamps: true });

// Hash PIN before saving
adminSchema.pre('save', async function (next) {
  if (this.isModified('pin')) {
    this.pin = await bcrypt.hash(this.pin, 10);
  }
  next();
});

// Compare PIN method
adminSchema.methods.comparePin = async function(candidatePin) {
  return await bcrypt.compare(candidatePin, this.pin);
};

module.exports = mongoose.model('Admin', adminSchema);