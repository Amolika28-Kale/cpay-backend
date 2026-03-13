const User = require("../models/User");
const { generateOtp, sendOtpEmail, verifyOtp } = require("../../services/emailService");
const bcrypt = require("bcryptjs");

// OTP store (temporary - use Redis in production)
const otpStore = new Map();

// ==================== STEP 1: FIND ACCOUNT BY EMAIL ====================
exports.findAccount = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "No account found with this email" 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (10 minutes)
    otpStore.set(email, {
      otp,
      userId: user.userId,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    // Auto cleanup after 10 minutes
    setTimeout(() => {
      if (otpStore.has(email) && otpStore.get(email).otp === otp) {
        otpStore.delete(email);
      }
    }, 10 * 60 * 1000);

    // Send OTP email
    await sendOtpEmail({
      email,
      otp,
      type: 'find-account'
    });

    res.json({
      success: true,
      message: "OTP sent to your email",
      email: user.email
    });

  } catch (err) {
    // console.error("Find Account Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again." 
    });
  }
};

// ==================== STEP 2: VERIFY OTP AND GET USER ID ====================
exports.verifyOtpAndGetUserId = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and OTP are required" 
      });
    }

    // Verify OTP
    const stored = otpStore.get(email);
    
    if (!stored || stored.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP" 
      });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: "OTP has expired" 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Clear OTP
    otpStore.delete(email);

    // Send User ID via email
    await sendOtpEmail({
      email,
      otp: user.userId,  // Send actual User ID
      type: 'user-id-recovery'
    });

    res.json({
      success: true,
      message: "User ID has been sent to your email",
      email: user.email
    });

  } catch (err) {
    // console.error("Verify OTP Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again." 
    });
  }
};

// ==================== STEP 3: REQUEST PIN RESET ====================
exports.requestPinReset = async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID and email are required" 
      });
    }

    // Find user
    const user = await User.findOne({ 
      userId: userId.toUpperCase(),
      email: email.toLowerCase() 
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Account not found with this User ID and email combination" 
      });
    }

    // Generate OTP for PIN reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with user ID
    const pinResetKey = `pin-reset-${email}`;
    otpStore.set(pinResetKey, {
      otp,
      userId: user._id,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    // Send OTP email
    await sendOtpEmail({
      email,
      otp,
      type: 'pin-reset'
    });

    res.json({
      success: true,
      message: "PIN reset OTP sent to your email"
    });

  } catch (err) {
    // console.error("PIN Reset Request Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again." 
    });
  }
};

// ==================== STEP 4: RESET PIN ====================
exports.resetPin = async (req, res) => {
  try {
    const { email, otp, newPin } = req.body;

    if (!email || !otp || !newPin) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, OTP, and new PIN are required" 
      });
    }

    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      return res.status(400).json({ 
        success: false, 
        message: "PIN must be 6 digits" 
      });
    }

    // Verify OTP
    const pinResetKey = `pin-reset-${email}`;
    const stored = otpStore.get(pinResetKey);
    
    if (!stored || stored.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP" 
      });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(pinResetKey);
      return res.status(400).json({ 
        success: false, 
        message: "OTP has expired" 
      });
    }

    // Find and update user
    const user = await User.findById(stored.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Update PIN (will be hashed by pre-save hook)
    user.pin = newPin;
    await user.save();

    // Clear OTP
    otpStore.delete(pinResetKey);

    res.json({
      success: true,
      message: "PIN reset successfully. You can now login with your new PIN."
    });

  } catch (err) {
    // console.error("Reset PIN Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again." 
    });
  }
};