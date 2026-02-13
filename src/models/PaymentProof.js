const mongoose = require("mongoose");

const paymentProofSchema = new mongoose.Schema({
  scanner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scanner",
    required: true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  screenshot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  }
}, { timestamps: true });

module.exports = mongoose.model("PaymentProof", paymentProofSchema);
