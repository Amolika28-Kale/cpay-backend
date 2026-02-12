const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Wallet = require('../models/Wallet');


// Generate referral code
const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};


// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    let referredUser = null;

    if (referralCode) {
      referredUser = await User.findOne({ referralCode });
    }

    const user = await User.create({
      name,
      email,
      password,
      referralCode: generateReferralCode(),
      referredBy: referredUser ? referredUser._id : null
    });

    // Create 3 wallets
    await Wallet.create([
      { user: user._id, type: "USDT", balance: 0 },
      { user: user._id, type: "INR", balance: 0 },
      { user: user._id, type: "CASHBACK", balance: 0 }
    ]);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
