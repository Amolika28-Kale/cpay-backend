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
  "CONVERSION",
  "SCANNER_PAY",
  "CASHBACK",
  "CASHBACK_TRANSFER",
  "WITHDRAW"
],
      required: true,
    },
    fromWallet: {
      type: String,
      enum: ["USDT", "INR", "CASHBACK"],
    },
    toWallet: {
      type: String,
      enum: ["USDT", "INR", "CASHBACK"],
    },
    amount: Number,
    rateUsed: Number,
    meta: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
