const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Wallet = require("../models/Wallet");

/* ================= REGISTER ================= */
/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    let { mobile, email, password, referralCode } = req.body;

    if (!mobile || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    // Mobile number validation
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: "Please enter a valid 10-digit mobile number" });
    }

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    email = email.trim().toLowerCase();
    mobile = mobile.trim();

    // Check if user exists with email or mobile
    const exists = await User.findOne({ 
      $or: [
        { email: email },
        { mobile: mobile }
      ]
    });
    
    if (exists) {
      if (exists.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      }
      if (exists.mobile === mobile) {
        return res.status(400).json({ message: "Mobile number already registered" });
      }
    }

    let referredUser = null;

    if (referralCode) {
      referredUser = await User.findOne({ referralCode: referralCode.trim() });
      if (!referredUser)
        return res.status(400).json({ message: "Invalid referral code" });
    }

    // Generate a unique ID for user (you can use mobile number as username)
    const username = `user_${mobile}`;

    const user = await User.create({
      mobile,
      email,
      password,
      name: username, // Auto-generated username from mobile
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

    /* ================= SIGNUP REFERRAL BONUS ================= */
    if (referredUser) {
      const referralWallet = await Wallet.findOne({
        user: referredUser._id,
        type: "CASHBACK",
      });

      if (referralWallet) {
        referralWallet.balance += 5; // 🎁 ₹5 Signup Bonus
        await referralWallet.save();
      }

      // increase totalReferrals count
      referredUser.totalReferrals += 1;
      referredUser.referralEarnings += 5;
      await referredUser.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
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


/* ================= GET REFERRAL STATS ================= */
// controllers/userAuth.controller.js
exports.getReferralStats = async (req, res) => {
  try {
    // req.user.id is correct since you signed it as 'id' in login
    const user = await User.findById(req.user.id); 
    if (!user) return res.status(404).json({ message: "User not found" });

    const cashbackWallet = await Wallet.findOne({ user: user._id, type: "CASHBACK" });

    res.json({
      referralCode: user.referralCode,
      totalReferrals: user.totalReferrals || 0,
      referralEarnings: user.referralEarnings || 0,
      cashbackBalance: cashbackWallet?.balance || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
