const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema(
  {
    usdtToInr: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rate", rateSchema);
