// models/Transaction.js
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
      "CONVERSION",
      "USDT_CREDIT",
      "INR_CREDIT",
      "TEAM_CASHBACK", // ✅ हे असायला हवे
      "WALLET_ACTIVATION" // ✅ हे असायला हवे
    ],
    required: true,
  },

  fromWallet: {
    type: String,
    enum: ["INR", "CASHBACK", "USDT", "SECURITY_HOLD", null], // "SECURITY_HOLD" जोडा
    default: null
  },

  toWallet: {
    type: String,
    enum: ["INR", "CASHBACK", "USDT", "SECURITY_HOLD", null], // "SECURITY_HOLD" जोडा
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