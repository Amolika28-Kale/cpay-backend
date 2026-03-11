// const mongoose = require("mongoose");

// const depositSchema = new mongoose.Schema(
// {
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },

//   paymentMethod: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "PaymentMethod",
//     required: true
//   },

//   amount: {
//     type: Number,
//     required: true,
//     min: 0.0001
//   },

//   txHash: {
//     type: String,
//     required: true,
//     unique: true
//   },

//   paymentScreenshot: {
//     type: String,
//     default: null
//   },

//   status: {
//     type: String,
//     enum: ["pending", "approved", "rejected"],
//     default: "pending"
//   },

//   rejectReason: {
//     type: String,
//     default: null
//   }

// }, { timestamps: true });

// module.exports = mongoose.model("Deposit", depositSchema);




const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaymentMethod",
    required: true
  },

  amount: {
    type: Number,
    required: true,
    min: 0.0001
  },

  txHash: {
    type: String,
    required: true,
    unique: true
  },

  paymentScreenshot: {
    type: String,
    default: null
  },

  // ✅ Multiple screenshots support
  paymentScreenshots: [{
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }],

  // ✅ Screenshot change history
  screenshotHistory: [{
    oldScreenshot: String,
    newScreenshot: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: String
  }],

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  rejectReason: {
    type: String,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Deposit", depositSchema);
