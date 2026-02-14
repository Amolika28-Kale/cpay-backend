const mongoose = require("mongoose");

const scannerSchema = new mongoose.Schema(
{
  /* ================= REQUEST CREATOR (User A) ================= */
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  /* ================= AMOUNT ================= */
  amount: {
    type: Number,
    required: true
  },

  /* ================= QR IMAGE ================= */
  image: {
    type: String,
    required: true
  },

  /* ================= UPI LINK (PhonePe / GPay) ================= */
  upiLink: {
    type: String,
    default: null
  },

  /* ================= PAYMENT SCREENSHOT ================= */
  paymentScreenshot: {
    type: String,
    default: null
  },

  /* ================= STATUS FLOW =================
     ACTIVE → ACCEPTED → PAYMENT_SUBMITTED → COMPLETED → EXPIRED
  ================================================= */
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

  /* ================= ACCEPTED BY (User B) ================= */
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  acceptedAt: Date,
  paymentSubmittedAt: Date,
  completedAt: Date,

  /* ================= AUTO EXPIRE 24 HOURS ================= */
  expiresAt: {
    type: Date,
    default: () =>
      new Date(Date.now() + 24 * 60 * 60 * 1000)
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Scanner", scannerSchema);
