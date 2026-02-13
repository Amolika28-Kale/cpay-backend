const mongoose = require("mongoose");

const scannerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    paymentScreenshot: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "PENDING_CONFIRMATION", "PAID", "EXPIRED"],
      default: "ACTIVE",
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    expiresAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scanner", scannerSchema);
