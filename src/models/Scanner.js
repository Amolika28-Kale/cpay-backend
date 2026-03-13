// const mongoose = require("mongoose");

// const scannerSchema = new mongoose.Schema(
// {
//   /* ================= REQUEST CREATOR (User A) ================= */
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },

//   /* ================= AMOUNT ================= */
//   amount: {
//     type: Number,
//     required: true
//   },

//   /* ================= QR IMAGE ================= */
//   image: {
//     type: String,
//     required: true
//   },

//   /* ================= UPI LINK (PhonePe / GPay) ================= */
//   upiLink: {
//     type: String,
//     default: null
//   },

//   /* ================= PAYMENT SCREENSHOT ================= */
//   paymentScreenshot: {
//     type: String,
//     default: null
//   },

//   /* ================= STATUS FLOW =================
//      ACTIVE → ACCEPTED → PAYMENT_SUBMITTED → COMPLETED → EXPIRED
//   ================================================= */
//   status: {
//     type: String,
//     enum: [
//       "ACTIVE",
//       "ACCEPTED",
//       "PAYMENT_SUBMITTED",
//       "COMPLETED",
//       "EXPIRED"
//     ],
//     default: "ACTIVE"
//   },

//   /* ================= ACCEPTED BY (User B) ================= */
//   acceptedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     default: null
//   },

//   acceptedAt: Date,
//   paymentSubmittedAt: Date,
//   completedAt: Date,

//   /* ================= AUTO EXPIRE 24 HOURS ================= */
//   expiresAt: {
//     type: Date,
//     default: () =>
//       new Date(Date.now() + 24 * 60 * 60 * 1000)
//   }

// },
// { timestamps: true }
// );

// module.exports = mongoose.model("Scanner", scannerSchema);


// const mongoose = require("mongoose");

// const scannerSchema = new mongoose.Schema(
// {
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     default: null // ✅ null allowed for system requests
//   },

//   amount: {
//     type: Number,
//     required: true
//   },

//   image: {
//     type: String,
//     required: true
//   },

//   upiLink: {
//     type: String,
//     default: null
//   },

//   paymentScreenshot: {
//     type: String,
//     default: null
//   },

//   status: {
//     type: String,
//     enum: [
//       "ACTIVE",
//       "ACCEPTED",
//       "PAYMENT_SUBMITTED",
//       "COMPLETED",
//       "EXPIRED"
//     ],
//     default: "ACTIVE"
//   },

//   acceptedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     default: null
//   },

//   acceptedAt: Date,
//   paymentSubmittedAt: Date,
//   completedAt: Date,

//   expiresAt: {
//     type: Date,
//     default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
//   },
  
//   isAutoRequest: {
//   type: Boolean,
//   default: false
// },

// autoRequestCycle: {
//   type: Number,
//   default: 0 // 1 for first, 2 for second
// },

// createdFor: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "User",
//   default: null
// }
// },
// { timestamps: true }
// );

// // Index for better query performance
// scannerSchema.index({ expiresAt: 1, status: 1 });
// scannerSchema.index({ isAutoRequest: 1, status: 1 });
// scannerSchema.index({ user: 1 });
// scannerSchema.index({ createdFor: 1 });

// module.exports = mongoose.model("Scanner", scannerSchema);


const mongoose = require("mongoose");

const scannerSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null // ✅ null allowed for system requests
  },

  amount: {
    type: Number,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  upiLink: {
    type: String,
    default: null
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
    enum: [
      "ACTIVE",
      "ACCEPTED",
      "PAYMENT_SUBMITTED",
      "COMPLETED",
      "EXPIRED"
    ],
    default: "ACTIVE"
  },

  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  acceptedAt: Date,
  paymentSubmittedAt: Date,
  completedAt: Date,

  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  
  isAutoRequest: {
    type: Boolean,
    default: false
  },

  autoRequestCycle: {
    type: Number,
    default: 0 // 1 for first, 2 for second
  },

  createdFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
},
{ timestamps: true }
);

// Index for better query performance
scannerSchema.index({ expiresAt: 1, status: 1 });
scannerSchema.index({ isAutoRequest: 1, status: 1 });
scannerSchema.index({ user: 1 });
scannerSchema.index({ createdFor: 1 });
scannerSchema.index({ status: 1, expiresAt: 1 }); // हा पण add करा

module.exports = mongoose.model("Scanner", scannerSchema);