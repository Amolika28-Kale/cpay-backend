const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["USDT", "INR", "CASHBACK"],
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

walletSchema.index({ user: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Wallet", walletSchema);
