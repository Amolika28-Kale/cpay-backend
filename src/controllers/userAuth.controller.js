const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Wallet = require("../models/Wallet");

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    let { name, email, password, referralCode } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    email = email.trim().toLowerCase();

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    let referredUser = null;

    if (referralCode) {
      referredUser = await User.findOne({ referralCode: referralCode.trim() });
      if (!referredUser)
        return res.status(400).json({ message: "Invalid referral code" });
    }

    const user = await User.create({
      name,
      email,
      password,
      referredBy: referredUser ? referredUser._id : null,
    });

    /* ================= CREATE DEFAULT WALLETS ================= */
    const walletTypes = ["USDT", "INR", "CASHBACK"];

    for (let type of walletTypes) {
      await Wallet.create({
        user: user._id,
        type,
        balance: 0,
      });
    }

    /* ================= OPTIONAL REFERRAL BONUS ================= */
    if (referredUser) {
      const referralWallet = await Wallet.findOne({
        user: referredUser._id,
        type: "CASHBACK",
      });

      if (referralWallet) {
        referralWallet.balance += 10; // 🎁 Flat 10 INR bonus
        await referralWallet.save();
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      role: user.role,
    };

    res.status(201).json({
      token,
      user: safeUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "Account not found" });

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        role: user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
