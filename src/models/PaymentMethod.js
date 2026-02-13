const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ["UPI", "BANK", "USDT-TRC20", "USDT-BEP20"],
    required: true
  },
  details: {
    type: Object,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
