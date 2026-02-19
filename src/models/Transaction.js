const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  type: {
    type: String,
    enum: [
      "DEPOSIT",
      "WITHDRAW",
      "REQUEST_CREATED",
      "REQUEST_ACCEPTED",
      "PAYMENT_SUBMITTED",
      "REQUEST_COMPLETED",
      "DEBIT",
      "CREDIT",
      "CASHBACK",
      "SELF_PAY",
      "CASHBACK_TRANSFER",
      "CONVERSION", // ADD THIS
      "USDT_CREDIT", // Optional: for USDT deposits
      "INR_CREDIT" // Optional: for INR credits
    ],
    required: true,
  },

  fromWallet: {
    type: String,
    enum: ["INR", "CASHBACK", "USDT", null], // ADD "USDT" HERE
    default: null
  },

  toWallet: {
    type: String,
    enum: ["INR", "CASHBACK", "USDT", null], // ADD "USDT" HERE
    default: null
  },

  amount: {
    type: Number,
    required: true,
  },

  relatedScanner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scanner",
    default: null
  },

  meta: {
    type: Object,
    default: {}
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);