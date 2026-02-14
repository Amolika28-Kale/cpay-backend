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

      /* ===== SCANNER FLOW ===== */
      "REQUEST_CREATED",
      "REQUEST_ACCEPTED",
      "PAYMENT_SUBMITTED",
      "REQUEST_COMPLETED",

      /* ===== WALLET MOVEMENT ===== */
      "DEBIT",
      "CREDIT",
      "CASHBACK",

      /* ===== SELF PAY ===== */
      "SELF_PAY",

      "CASHBACK_TRANSFER"
    ],
    required: true,
  },

  fromWallet: {
    type: String,
    enum: ["INR", "CASHBACK"],
    default: null
  },

  toWallet: {
    type: String,
    enum: ["INR", "CASHBACK"],
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
