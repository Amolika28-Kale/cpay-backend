const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Rate = require('../models/Rate');

// ================= ADMIN LOGIN =================
exports.login = async (req, res) => {
  try {
    let { adminId, pin } = req.body;

    console.log("Admin login attempt:", { adminId, pin });

    if (!adminId || !pin) {
      return res.status(400).json({ message: "Admin ID and PIN are required" });
    }

    adminId = adminId.trim().toUpperCase();

    const admin = await Admin.findOne({ adminId });
    if (!admin) {
      return res.status(404).json({ message: "Admin ID not found" });
    }

    const match = await bcrypt.compare(pin, admin.pin);
    if (!match) {
      return res.status(400).json({ message: "Invalid PIN" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: admin._id,
        adminId: admin.adminId,
        role: admin.role
      }
    });

  } catch (err) {
    console.error("Admin login error:", err);
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

// ================= SEED ADMIN =================
exports.seedAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ adminId: 'ADMIN001' });
    
    if (!existingAdmin) {
      await Admin.create({
        adminId: 'ADMIN001',
        pin: '123456'
      });
      console.log('✅ Admin seeded: ADMIN001 / 123456');
    } else {
      console.log('Admin already exists');
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  }
};