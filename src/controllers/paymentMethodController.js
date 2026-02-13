const PaymentMethod = require("../models/PaymentMethod");


// ================= USER GET ACTIVE METHODS =================
exports.getActivePaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find({ active: true });
    res.json(methods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= ADMIN TOGGLE METHOD =================
exports.togglePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    const method = await PaymentMethod.findById(id);
    if (!method)
      return res.status(404).json({ message: "Method not found" });

    method.active = !method.active;
    await method.save();

    res.json({
      message: "Payment method updated",
      method
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getAllPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find();
    res.json(methods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
