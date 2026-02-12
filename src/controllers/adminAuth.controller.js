const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Rate = require('../models/Rate');


// ================= ADMIN LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: admin
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= SET CONVERSION RATE =================
exports.setConversionRate = async (req, res) => {
  try {
    const { usdtToInr } = req.body;

    if (!usdtToInr || usdtToInr <= 0)
      return res.status(400).json({ message: "Invalid rate" });

    // deactivate old
    await Rate.updateMany({}, { isActive: false });

    const rate = await Rate.create({
      usdtToInr,
      isActive: true
    });

    res.json({
      message: "Conversion rate updated successfully",
      rate
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
