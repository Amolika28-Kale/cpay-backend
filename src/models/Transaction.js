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
        "SCANNER_PAY",
        "SCANNER_CREDIT",
        "SCANNER_CASHBACK",
        "SELF_PAYMENT",
        "CASHBACK_TRANSFER"
      ],
      required: true,
    },
    fromWallet: String,
    toWallet: String,
    amount: {
      type: Number,
      required: true,
    },
    meta: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
