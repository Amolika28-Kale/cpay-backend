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
status: {
  type: String,
  enum: ["ACTIVE", "PENDING_CONFIRMATION", "PAID", "EXPIRED"],
  default: "ACTIVE",
},
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Scanner", scannerSchema);
