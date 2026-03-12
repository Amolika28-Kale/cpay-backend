// // // controllers/userAuth.controller.js
// // const User = require("../models/User");
// // const Otp = require("../models/Otp");
// // const bcrypt = require("bcryptjs");
// // const jwt = require("jsonwebtoken");
// // const Wallet = require("../models/Wallet");
// // const { generateOtp, sendOtpEmail } = require("../../services/emailService");

// // /* ================= SEND OTP ================= */
// // exports.sendOtp = async (req, res) => {
// //   try {
// //     let { email, type = 'register' } = req.body; // const -> let

// //     if (!email) {
// //       return res.status(400).json({ message: "Email is required" });
// //     }

// //     email = email.trim().toLowerCase(); // आता हे चालेल

// //     // Check if email exists based on type
// //     if (type === 'register') {
// //       const existingUser = await User.findOne({ email });
// //       if (existingUser) {
// //         return res.status(400).json({ message: "Email already registered" });
// //       }
// //     } else if (type === 'forgot-password') {
// //       const user = await User.findOne({ email });
// //       if (!user) {
// //         return res.status(404).json({ message: "No account found with this email" });
// //       }
// //     }

// //     // Delete any existing OTPs for this email
// //     await Otp.deleteMany({ email, type });

// //     // Generate OTP
// //     const otp = generateOtp();
    
// //     // Save OTP to database
// //     await Otp.create({
// //       email,
// //       otp,
// //       type,
// //       expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
// //     });

// //     // Send OTP via Brevo API
// //     await sendOtpEmail({ email, otp, type });

// //     res.json({ 
// //       message: `OTP sent successfully to your email`,
// //       expiresIn: "10 minutes"
// //     });

// //   } catch (err) {
// //     console.error("Send OTP Error:", err);
    
// //     if (err.response?.data) {
// //       return res.status(500).json({ 
// //         message: "Email service error: " + (err.response.data.message || "Unknown error")
// //       });
// //     }
    
// //     res.status(500).json({ message: "Failed to send OTP. Please try again." });
// //   }
// // };

// // /* ================= VERIFY OTP ================= */
// // /* ================= VERIFY OTP ================= */
// // exports.verifyOtp = async (req, res) => {
// //   try {
// //     let { email, otp, type = 'register' } = req.body;

// //     console.log("Verify OTP Request:", { email, otp, type });

// //     if (!email || !otp) {
// //       return res.status(400).json({ message: "Email and OTP are required" });
// //     }

// //     email = email.trim().toLowerCase();

// //     // Find latest OTP for this email and type
// //     const otpRecord = await Otp.findOne({ 
// //       email, 
// //       otp,
// //       type
// //     }).sort({ createdAt: -1 });

// //     console.log("OTP Record found:", otpRecord);

// //     if (!otpRecord) {
// //       return res.status(400).json({ message: "Invalid OTP" });
// //     }

// //     // Check if expired
// //     if (otpRecord.expiresAt < new Date()) {
// //       console.log("OTP expired at:", otpRecord.expiresAt);
// //       await Otp.deleteMany({ email, type });
// //       return res.status(400).json({ message: "OTP expired. Please request new OTP" });
// //     }

// //     // ⚠️ IMPORTANT: OTP डिलीट करू नका! फक्त verified=true रिटर्न करा
// //     // await Otp.deleteMany({ email, type });  // ही लाइन कमेंट करा किंवा डिलीट करा

// //     res.json({ 
// //       message: "OTP verified successfully",
// //       verified: true 
// //     });

// //   } catch (err) {
// //     console.error("Verify OTP Error:", err);
// //     res.status(500).json({ message: "Failed to verify OTP" });
// //   }
// // };

// // /* ================= REGISTER ================= */
// // exports.register = async (req, res) => {
// //   try {
// //     let { mobile, email, password, referralCode, otpVerified } = req.body;

// //     if (!mobile || !email || !password)
// //       return res.status(400).json({ message: "All fields required" });

// //     // Check if OTP verified
// //     if (!otpVerified) {
// //       return res.status(400).json({ message: "Please verify your email first" });
// //     }

// //     // Mobile number validation
// //     if (!/^\d{10}$/.test(mobile)) {
// //       return res.status(400).json({ message: "Please enter a valid 10-digit mobile number" });
// //     }

// //     if (password.length < 6)
// //       return res.status(400).json({ message: "Password must be at least 6 characters" });

// //     email = email.trim().toLowerCase();
// //     mobile = mobile.trim();

// //     // Check if user exists with email or mobile
// //     const exists = await User.findOne({ 
// //       $or: [
// //         { email: email },
// //         { mobile: mobile }
// //       ]
// //     });
    
// //     if (exists) {
// //       if (exists.email === email) {
// //         return res.status(400).json({ message: "Email already registered" });
// //       }
// //       if (exists.mobile === mobile) {
// //         return res.status(400).json({ message: "Mobile number already registered" });
// //       }
// //     }

// //     let referredUser = null;

// //     if (referralCode) {
// //       referredUser = await User.findOne({ referralCode: referralCode.trim() });
// //       if (!referredUser)
// //         return res.status(400).json({ message: "Invalid referral code" });
// //     }

// //     // Generate a unique username
// //     const username = `user_${mobile}`;

// //     const user = await User.create({
// //       mobile,
// //       email,
// //       password,
// //       name: username,
// //       referredBy: referredUser ? referredUser._id : null,
// //     });

// //     /* ================= CREATE DEFAULT WALLETS ================= */
// //     const walletTypes = ["USDT", "INR", "CASHBACK"];

// //     for (let type of walletTypes) {
// //       await Wallet.create({
// //         user: user._id,
// //         type,
// //         balance: 0,
// //       });
// //     }

// //     /* ================= SIGNUP REFERRAL BONUS ================= */
// //     if (referredUser) {
// //       const referralWallet = await Wallet.findOne({
// //         user: referredUser._id,
// //         type: "CASHBACK",
// //       });

// //       if (referralWallet) {
// //         referralWallet.balance += 5; // 🎁 ₹5 Signup Bonus
// //         await referralWallet.save();
// //       }

// //       referredUser.totalReferrals += 1;
// //       referredUser.referralEarnings += 5;
// //       await referredUser.save();
// //     }

// //     const token = jwt.sign(
// //       { id: user._id, role: user.role },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "7d" }
// //     );

// //     const safeUser = {
// //       _id: user._id,
// //       name: user.name,
// //       mobile: user.mobile,
// //       email: user.email,
// //       referralCode: user.referralCode,
// //       role: user.role,
// //     };

// //     res.status(201).json({
// //       token,
// //       user: safeUser,
// //     });
// //   } catch (err) {
// //     console.error("Register Error:", err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // /* ================= LOGIN ================= */
// // exports.login = async (req, res) => {
// //   try {
// //     let { email, password } = req.body;

// //     if (!email || !password)
// //       return res.status(400).json({ message: "All fields required" });

// //     email = email.trim().toLowerCase();

// //     const user = await User.findOne({ email });

// //     if (!user)
// //       return res.status(404).json({ message: "Account not found" });

// //     const match = await bcrypt.compare(password, user.password);

// //     if (!match)
// //       return res.status(400).json({ message: "Invalid credentials" });

// //     const token = jwt.sign(
// //       { id: user._id, role: user.role },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "7d" }
// //     );

// //     res.json({
// //       token,
// //       user: {
// //         _id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         referralCode: user.referralCode,
// //         role: user.role,
// //       },
// //     });

// //   } catch (err) {
// //     console.error("Login Error:", err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // /* ================= FORGOT PASSWORD ================= */
// // exports.forgotPassword = async (req, res) => {
// //   try {
// //     let { email } = req.body;

// //     if (!email) {
// //       return res.status(400).json({ message: "Email is required" });
// //     }

// //     email = email.trim().toLowerCase();
// //     console.log("1. Forgot password for email:", email);

// //     // Check if user exists
// //     const user = await User.findOne({ email });
// //     if (!user) {
// //       return res.status(404).json({ message: "No account found with this email" });
// //     }
// //     console.log("2. User found:", user._id);

// //     // Delete any existing OTPs for this email
// //     await Otp.deleteMany({ email, type: 'forgot-password' });
// //     console.log("3. Deleted existing OTPs");

// //     // Generate OTP
// //     const otp = generateOtp();
// //     console.log("4. Generated OTP:", otp);
    
// //     // Save OTP to database
// //     const newOtp = await Otp.create({
// //       email,
// //       otp,
// //       type: 'forgot-password',
// //       expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
// //     });
// //     console.log("5. OTP saved to database:", newOtp);

// //     // Send OTP via Brevo API - with error handling
// //     try {
// //       await sendOtpEmail({ email, otp, type: 'forgot-password' });
// //       console.log("6. OTP email sent successfully");
// //     } catch (emailError) {
// //       console.error("Email sending failed but OTP saved:", emailError);
// //       // Continue anyway - OTP is saved in DB
// //     }

// //     res.json({ 
// //       message: "Password reset OTP sent to your email",
// //       expiresIn: "10 minutes"
// //     });

// //   } catch (err) {
// //     console.error("Forgot Password Error:", err);
// //     res.status(500).json({ message: "Failed to process request. Please try again." });
// //   }
// // };

// // /* ================= RESET PASSWORD ================= */
// // exports.resetPassword = async (req, res) => {
// //   try {
// //     let { email, otp, newPassword } = req.body;
    
// //     console.log("Reset Password Request:", { 
// //       email, 
// //       otp, 
// //       newPassword: newPassword ? "****" : "missing" 
// //     });

// //     if (!email || !otp || !newPassword) {
// //       return res.status(400).json({ message: "All fields required" });
// //     }

// //     if (newPassword.length < 6) {
// //       return res.status(400).json({ message: "Password must be at least 6 characters" });
// //     }

// //     email = email.trim().toLowerCase();

// //     // OTP शोधा (type सह)
// //     console.log("Searching for OTP with:", { email, otp, type: 'forgot-password' });
    
// //     const otpRecord = await Otp.findOne({ 
// //       email, 
// //       otp,
// //       type: 'forgot-password'  // type जोडा
// //     }).sort({ createdAt: -1 });

// //     console.log("OTP Record found:", otpRecord);

// //     if (!otpRecord) {
// //       // Debug: सर्व OTPs दाखवा
// //       const allOtps = await Otp.find({ email }).sort({ createdAt: -1 });
// //       console.log("All OTPs in DB for this email:", allOtps.map(o => ({ 
// //         otp: o.otp, 
// //         type: o.type, 
// //         expiresAt: o.expiresAt 
// //       })));
// //       return res.status(400).json({ message: "Invalid OTP" });
// //     }

// //     // Check if expired
// //     if (otpRecord.expiresAt < new Date()) {
// //       console.log("OTP expired at:", otpRecord.expiresAt);
// //       await Otp.deleteMany({ email, type: 'forgot-password' });
// //       return res.status(400).json({ message: "OTP expired. Please request new OTP" });
// //     }

// //     // Find user
// //     const user = await User.findOne({ email });
// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     // Update password
// //     user.password = newPassword;
// //     await user.save();
// //     console.log("Password updated for user:", user._id);

// //     // आता OTP डिलीट करा (यशस्वीरित्या password reset झाल्यावर)
// //     await Otp.deleteMany({ email, type: 'forgot-password' });
// //     console.log("OTP deleted");

// //     res.json({ 
// //       message: "Password reset successfully. You can now login with new password."
// //     });

// //   } catch (err) {
// //     console.error("Reset Password Error:", err);
// //     res.status(500).json({ message: "Failed to reset password" });
// //   }
// // };

// // /* ================= GET REFERRAL STATS ================= */
// // exports.getReferralStats = async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user.id); 
// //     if (!user) return res.status(404).json({ message: "User not found" });

// //     const cashbackWallet = await Wallet.findOne({ user: user._id, type: "CASHBACK" });

// //     res.json({
// //       referralCode: user.referralCode,
// //       totalReferrals: user.totalReferrals || 0,
// //       referralEarnings: user.referralEarnings || 0,
// //       cashbackBalance: cashbackWallet?.balance || 0
// //     });
// //   } catch (err) {
// //     console.error("Referral Stats Error:", err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };


// // controllers/userAuth.controller.js
// const User = require("../models/User");
// const Wallet = require("../models/Wallet");
// const Transaction = require("../models/Transaction");
// const jwt = require("jsonwebtoken");
// const ReferralService = require("../../services/referralService");
// const bcryptjs = require("bcryptjs");

// // controllers/userAuth.controller.js - Register function
// exports.register = async (req, res) => {
//   try {
//     let { userId, pin, referralCode } = req.body;

//     if (!userId || !pin) {
//       return res.status(400).json({ message: "User ID and PIN are required" });
//     }

//     // User ID validation
//     if (!/^[a-zA-Z0-9]{4,20}$/.test(userId)) {
//       return res.status(400).json({ message: "User ID must be 4-20 alphanumeric characters" });
//     }

//     if (pin.length !== 6 || !/^\d+$/.test(pin)) {
//       return res.status(400).json({ message: "PIN must be 6 digits" });
//     }

//     userId = userId.trim().toUpperCase();

//     // Check if user exists
//     const exists = await User.findOne({ userId });
//     if (exists) {
//       return res.status(400).json({ message: "User ID already taken" });
//     }

//     let referredUser = null;

//     if (referralCode) {
//       referredUser = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
//       if (!referredUser) {
//         return res.status(400).json({ message: "Invalid referral code" });
//       }
//     }

//     // Create user - the pre-save hook will hash the PIN
//     const user = new User({
//       userId,
//       pin, // This will be hashed by the pre-save hook
//       referredBy: referredUser ? referredUser._id : null,
//     });

//     await user.save(); // This triggers the pre-save hook

//     // console.log("User created with hashed PIN:", user.pin); // This should show a hash, not plain text

//     // Create default wallets
//     const walletTypes = ["USDT", "INR", "CASHBACK"];
//     for (let type of walletTypes) {
//       await Wallet.create({ user: user._id, type, balance: 0 });
//     }

//     // Add to referral tree if referred
//     if (referredUser) {
//       await User.addToReferralTree(user._id, referredUser._id, 1);
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     const safeUser = {
//       _id: user._id,
//       userId: user.userId,
//       referralCode: user.referralCode,
//       role: user.role,
//     };

//     res.status(201).json({ token, user: safeUser });

//   } catch (err) {
//     // console.error("Register Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ================= LOGIN ================= */
// // controllers/userAuth.controller.js - Login function with debug

// // exports.login = async (req, res) => {
// //   try {
// //     let { userId, pin } = req.body;

// //     console.log("Login attempt:", { userId, pin }); // Debug log

// //     if (!userId || !pin) {
// //       return res.status(400).json({ message: "User ID and PIN are required" });
// //     }

// //     userId = userId.trim().toUpperCase();

// //     const user = await User.findOne({ userId });
// //     console.log("User found:", user ? "Yes" : "No"); // Debug log
    
// //     if (!user) {
// //       return res.status(404).json({ message: "User ID not found" });
// //     }

// //     console.log("Stored hashed PIN:", user.pin); // Debug log
// //     console.log("PIN from request:", pin); // Debug log

// //     const match = await bcryptjs.compare(pin, user.pin);
// //     console.log("PIN match:", match); // Debug log

// //     if (!match) {
// //       return res.status(400).json({ message: "Invalid PIN" });
// //     }

// //     const token = jwt.sign(
// //       { id: user._id, role: user.role },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "7d" }
// //     );

// //     res.json({
// //       token,
// //       user: {
// //         _id: user._id,
// //         userId: user.userId,
// //         referralCode: user.referralCode,
// //         role: user.role,
// //       },
// //     });

// //   } catch (err) {
// //     console.error("Login Error:", err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };


// /* ================= LOGIN ================= */
// exports.login = async (req, res) => {
//   try {
//     let { userId, pin } = req.body;

//     // console.log("🔐 Login attempt:", { userId, pin: pin ? "******" : null });

//     // Validation
//     if (!userId || !pin) {
//       // console.log("❌ Missing credentials");
//       return res.status(400).json({ 
//         message: "User ID and PIN are required" 
//       });
//     }

//     // Clean userId - remove spaces and convert to uppercase
//     userId = userId.toString().trim().toUpperCase();
    
//     // Validate 6-digit format
//     if (!/^\d{6}$/.test(userId)) {
//       // console.log("❌ Invalid format:", userId);
//       return res.status(400).json({ 
//         message: "User ID must be 6 digits" 
//       });
//     }

//     // console.log("🔍 Searching for user:", userId);
//     const user = await User.findOne({ userId });
    
//     if (!user) {
//       // console.log("❌ User not found:", userId);
//       return res.status(404).json({ 
//         message: "User ID not found" 
//       });
//     }

//     // console.log("✅ User found, comparing PIN...");
//     const match = await bcryptjs.compare(pin, user.pin);
    
//     if (!match) {
//       // console.log("❌ PIN mismatch");
//       return res.status(400).json({ 
//         message: "Invalid PIN" 
//       });
//     }

//     // console.log("✅ PIN matched, generating token...");
//     const token = jwt.sign(
//       { id: user._id, role: user.role, userId: user.userId },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     const safeUser = {
//       _id: user._id,
//       userId: user.userId,
//       referralCode: user.referralCode,
//       role: user.role,
//     };

//     // console.log("✅ Login successful for:", userId);
//     res.json({
//       success: true,
//       token,
//       user: safeUser
//     });

//   } catch (err) {
//     // console.error("❌ Login Error:", err);
//     res.status(500).json({ 
//       message: err.message || "Server error" 
//     });
//   }
// };


// /* ================= GET REFERRAL STATS ================= */
// exports.getReferralStats = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id); 
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const cashbackWallet = await Wallet.findOne({ user: user._id, type: "CASHBACK" });

//     // ✅ Get all downline counts for 21 levels
//     const referralTree = {
//       level1: user.referralTree?.level1?.length || 0,
//       level2: user.referralTree?.level2?.length || 0,
//       level3: user.referralTree?.level3?.length || 0,
//       level4: user.referralTree?.level4?.length || 0,
//       level5: user.referralTree?.level5?.length || 0,
//       level6: user.referralTree?.level6?.length || 0,
//       level7: user.referralTree?.level7?.length || 0,
//       level8: user.referralTree?.level8?.length || 0,
//       level9: user.referralTree?.level9?.length || 0,
//       level10: user.referralTree?.level10?.length || 0,
//       level11: user.referralTree?.level11?.length || 0,
//       level12: user.referralTree?.level12?.length || 0,
//       level13: user.referralTree?.level13?.length || 0,
//       level14: user.referralTree?.level14?.length || 0,
//       level15: user.referralTree?.level15?.length || 0,
//       level16: user.referralTree?.level16?.length || 0,
//       level17: user.referralTree?.level17?.length || 0,
//       level18: user.referralTree?.level18?.length || 0,
//       level19: user.referralTree?.level19?.length || 0,
//       level20: user.referralTree?.level20?.length || 0,
//       level21: user.referralTree?.level21?.length || 0
//     };

//     // ✅ Earnings by level for 21 levels
//     const earningsByLevel = {
//       level1: user.referralEarnings?.level1 || 0,
//       level2: user.referralEarnings?.level2 || 0,
//       level3: user.referralEarnings?.level3 || 0,
//       level4: user.referralEarnings?.level4 || 0,
//       level5: user.referralEarnings?.level5 || 0,
//       level6: user.referralEarnings?.level6 || 0,
//       level7: user.referralEarnings?.level7 || 0,
//       level8: user.referralEarnings?.level8 || 0,
//       level9: user.referralEarnings?.level9 || 0,
//       level10: user.referralEarnings?.level10 || 0,
//       level11: user.referralEarnings?.level11 || 0,
//       level12: user.referralEarnings?.level12 || 0,
//       level13: user.referralEarnings?.level13 || 0,
//       level14: user.referralEarnings?.level14 || 0,
//       level15: user.referralEarnings?.level15 || 0,
//       level16: user.referralEarnings?.level16 || 0,
//       level17: user.referralEarnings?.level17 || 0,
//       level18: user.referralEarnings?.level18 || 0,
//       level19: user.referralEarnings?.level19 || 0,
//       level20: user.referralEarnings?.level20 || 0,
//       level21: user.referralEarnings?.level21 || 0,
//       total: user.referralEarnings?.total || 0
//     };

//     res.json({
//       referralCode: user.referralCode,
//       totalReferrals: Object.values(referralTree).reduce((a, b) => a + b, 0),
//       referralEarnings: user.referralEarnings || { total: 0 },
//       cashbackBalance: cashbackWallet?.balance || 0,
//       referralTree,
//       earningsByLevel
//     });

//   } catch (err) {
//     // console.error("Referral Stats Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


// controllers/auth.controller.js

const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction"); // ✅ Transaction model import करा
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const bcryptjs = require("bcryptjs");

exports.register = async (req, res) => {
  const session = await mongoose.startSession(); // ✅ Transaction साठी session
  session.startTransaction();

  try {
    let { userId, pin, email, referralCode } = req.body;

    // ✅ 1. Check all required fields including referralCode
    if (!userId || !pin || !email || !referralCode) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: "User ID, PIN, Email and Referral Code are required" 
      });
    }

    // ✅ 2. User ID validation (6 digits)
    if (!/^\d{6}$/.test(userId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: "User ID must be 6 digits" 
      });
    }

    // ✅ 3. Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: "Please enter a valid email" 
      });
    }

    // ✅ 4. PIN validation (6 digits)
    if (!/^\d{6}$/.test(pin)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: "PIN must be 6 digits" 
      });
    }

    userId = userId.trim();
    email = email.toLowerCase().trim();
    
    // ✅ 5. Validate referral code
    const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() }).session(session);
    
    if (!referrer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: "Invalid referral code. Please check and try again." 
      });
    }

    // ✅ 6. Check if user exists
    const exists = await User.findOne({ 
      $or: [{ userId }, { email }] 
    }).session(session);
    
    if (exists) {
      await session.abortTransaction();
      session.endSession();
      if (exists.userId === userId) {
        return res.status(400).json({ 
          success: false,
          message: "User ID already taken" 
        });
      }
      if (exists.email === email) {
        return res.status(400).json({ 
          success: false,
          message: "Email already registered" 
        });
      }
    }

    // ✅ 7. Create user
    const user = new User({
      userId,
      email,
      pin,
      referredBy: referrer._id,
      autoRequest: {
        firstRequestCreated: false,
        secondRequestCreated: false,
        autoRequestCompleted: false,
        firstRequestAmount: 1000,
        secondRequestAmount: 1000
      }
    });

    await user.save({ session });

    // ✅ 8. Create default wallets with BONUS
    const BONUS_USDT = 1; // $1 USDT बोनस
    const CONVERSION_RATE = 95; // 1 USDT = ₹95
    
    // USDT Wallet with $1 bonus
    const usdtWallet = new Wallet({
      user: user._id,
      type: "USDT",
      balance: BONUS_USDT // ✅ $1 बोनस
    });
    await usdtWallet.save({ session });

    // INR Wallet with ₹95 (from conversion)
    const inrWallet = new Wallet({
      user: user._id,
      type: "INR",
      balance: BONUS_USDT * CONVERSION_RATE // ✅ ₹95 बोनस
    });
    await inrWallet.save({ session });

    // Cashback Wallet with ₹0
    const cashbackWallet = new Wallet({
      user: user._id,
      type: "CASHBACK",
      balance: 0
    });
    await cashbackWallet.save({ session });

    // ✅ 9. Create TRANSACTION records for the bonus
    const transactions = [
      {
        user: user._id,
        type: "DEPOSIT",
        fromWallet: null,
        toWallet: "USDT",
        amount: BONUS_USDT,
        meta: {
          currency: "USDT",
          symbol: "$",
          type: "WELCOME_BONUS",
          description: "Welcome bonus for new user"
        }
      },
      {
        user: user._id,
        type: "CONVERSION",
        fromWallet: "USDT",
        toWallet: "INR",
        amount: BONUS_USDT * CONVERSION_RATE,
        meta: {
          rate: CONVERSION_RATE,
          originalAmount: BONUS_USDT,
          originalCurrency: "USDT",
          symbol: "₹",
          type: "BONUS_CONVERSION",
          description: "Welcome bonus converted to INR"
        }
      },
      {
        user: user._id,
        type: "CREDIT",
        fromWallet: "SYSTEM",
        toWallet: "INR",
        amount: BONUS_USDT * CONVERSION_RATE,
        meta: {
          type: "WELCOME_BONUS",
          description: "₹95 welcome bonus credited"
        }
      }
    ];

    await Transaction.insertMany(transactions, { session });

    // ✅ 10. Add to referral tree
    await User.addToReferralTree(user._id, referrer._id, 1, session);

    // ✅ 11. Create FIRST AUTO REQUEST for new user
    const AutoRequestService = require("../../services/autoRequestService");
    let autoRequest = null;
    try {
      autoRequest = await AutoRequestService.createFirstAutoRequestForUser(user._id, 1000, session);
      console.log(`✅ First auto request created for new user: ${user.userId}`);
    } catch (autoRequestError) {
      console.error("❌ Failed to create auto request for new user:", autoRequestError);
    }

    // ✅ 12. Commit transaction
    await session.commitTransaction();
    session.endSession();

    // ✅ 13. Generate token
    const token = jwt.sign(
      { id: user._id, userId: user.userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ 14. Return user data with bonus info
    const safeUser = {
      _id: user._id,
      userId: user.userId,
      email: user.email,
      referralCode: user.referralCode,
      role: user.role,
      wallets: {
        USDT: BONUS_USDT,
        INR: BONUS_USDT * CONVERSION_RATE,
        CASHBACK: 0
      }
    };

    res.status(201).json({ 
      success: true,
      token, 
      user: safeUser,
      bonus: {
        usdt: BONUS_USDT,
        inr: BONUS_USDT * CONVERSION_RATE,
        message: `Welcome! You received $${BONUS_USDT} USDT (₹${BONUS_USDT * CONVERSION_RATE}) as signup bonus!`
      },
      autoRequest: autoRequest ? {
        id: autoRequest._id,
        amount: autoRequest.amount,
        expiresAt: autoRequest.expiresAt,
        type: "FIRST_WELCOME_BONUS"
      } : null
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Register Error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// controllers/userAuth.controller.js - Register function

// exports.register = async (req, res) => {
//   try {
//     let { userId, pin, referralCode } = req.body;

//     if (!userId || !pin) {
//       return res.status(400).json({ message: "User ID and PIN are required" });
//     }

//     // User ID validation
//     if (!/^[a-zA-Z0-9]{4,20}$/.test(userId)) {
//       return res.status(400).json({ message: "User ID must be 4-20 alphanumeric characters" });
//     }

//     if (pin.length !== 6 || !/^\d+$/.test(pin)) {
//       return res.status(400).json({ message: "PIN must be 6 digits" });
//     }

//     userId = userId.trim().toUpperCase();

//     // Check if user exists
//     const exists = await User.findOne({ userId });
//     if (exists) {
//       return res.status(400).json({ message: "User ID already taken" });
//     }

//     let referredUser = null;

//     if (referralCode) {
//       referredUser = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
//       if (!referredUser) {
//         return res.status(400).json({ message: "Invalid referral code" });
//       }
//     }

//     // ✅ Create user with auto request tracking
//     const user = new User({
//       userId,
//       pin,
//       referredBy: referredUser ? referredUser._id : null,
//       autoRequest: {
//         firstRequestCreated: false,
//         secondRequestCreated: false,
//         autoRequestCompleted: false,
//         firstRequestAmount: 1000,
//         secondRequestAmount: 1000
//       }
//     });

//     await user.save();

//     // Create default wallets
//     const walletTypes = ["USDT", "INR", "CASHBACK"];
//     for (let type of walletTypes) {
//       await Wallet.create({ user: user._id, type, balance: 0 });
//     }

//     // Add to referral tree if referred
//     if (referredUser) {
//       await User.addToReferralTree(user._id, referredUser._id, 1);
//     }

//     // ✅ Create FIRST AUTO REQUEST for new user (only once)
//     const AutoRequestService = require("../../services/autoRequestService");
//     let autoRequest = null;
//     try {
//       autoRequest = await AutoRequestService.createFirstAutoRequestForUser(user._id, 1000);
//       console.log(`✅ First auto request created for new user: ${user.userId}`);
//     } catch (autoRequestError) {
//       console.error("❌ Failed to create auto request for new user:", autoRequestError);
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     const safeUser = {
//       _id: user._id,
//       userId: user.userId,
//       referralCode: user.referralCode,
//       role: user.role
//     };

//     res.status(201).json({ 
//       token, 
//       user: safeUser,
//       autoRequest: autoRequest ? {
//         id: autoRequest._id,
//         amount: autoRequest.amount,
//         expiresAt: autoRequest.expiresAt,
//         type: "FIRST_WELCOME_BONUS"
//       } : null
//     });

//   } catch (err) {
//     console.error("Register Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// controllers/userAuth.controller.js

// exports.register = async (req, res) => {
//   try {
//     let { userId, pin, email, referralCode } = req.body;  // ✅ email add केला

//     if (!userId || !pin || !email) {                       // ✅ email required
//       return res.status(400).json({ 
//         success: false,
//         message: "User ID, PIN and Email are required" 
//       });
//     }

//     // User ID validation (6 digits)
//     if (!/^\d{6}$/.test(userId)) {
//       return res.status(400).json({ 
//         success: false,
//         message: "User ID must be 6 digits" 
//       });
//     }

//     // Email validation
//     const emailRegex = /^\S+@\S+\.\S+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Please enter a valid email" 
//       });
//     }

//     if (pin.length !== 6 || !/^\d+$/.test(pin)) {
//       return res.status(400).json({ 
//         success: false,
//         message: "PIN must be 6 digits" 
//       });
//     }

//     userId = userId.trim().toUpperCase();
//     email = email.toLowerCase().trim();

//     // Check if user exists by userId OR email
//     const exists = await User.findOne({ 
//       $or: [{ userId }, { email }] 
//     });
    
//     if (exists) {
//       if (exists.userId === userId) {
//         return res.status(400).json({ 
//           success: false,
//           message: "User ID already taken" 
//         });
//       }
//       if (exists.email === email) {
//         return res.status(400).json({ 
//           success: false,
//           message: "Email already registered" 
//         });
//       }
//     }

//     let referredUser = null;

//     if (referralCode) {
//       referredUser = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
//       if (!referredUser) {
//         return res.status(400).json({ 
//           success: false,
//           message: "Invalid referral code" 
//         });
//       }
//     }

//     // ✅ Create user with email
//     const user = new User({
//       userId,
//       email,                    // ✅ email save करतोय
//       pin,
//       referredBy: referredUser ? referredUser._id : null,
//       autoRequest: {
//         firstRequestCreated: false,
//         secondRequestCreated: false,
//         autoRequestCompleted: false,
//         firstRequestAmount: 1000,
//         secondRequestAmount: 1000
//       }
//     });

//     await user.save();

//     // Create default wallets
//     const walletTypes = ["USDT", "INR", "CASHBACK"];
//     for (let type of walletTypes) {
//       await Wallet.create({ user: user._id, type, balance: 0 });
//     }

//     // Add to referral tree if referred
//     if (referredUser) {
//       await User.addToReferralTree(user._id, referredUser._id, 1);
//     }

//     // ✅ Send welcome email with User ID (optional - त्रास नको असल्यास हा भाग काढू शकता)
//     try {
//       const { sendOtpEmail } = require("../../services/emailService");
//       await sendOtpEmail({
//         email: user.email,
//         otp: userId,  // User ID as OTP for welcome email
//         type: 'welcome'
//       });
//       console.log(`✅ Welcome email sent to ${user.email}`);
//     } catch (emailErr) {
//       console.log("Welcome email failed:", emailErr.message);
//     }

//     // ✅ Create FIRST AUTO REQUEST for new user (only once)
//     const AutoRequestService = require("../../services/autoRequestService");
//     let autoRequest = null;
//     try {
//       autoRequest = await AutoRequestService.createFirstAutoRequestForUser(user._id, 1000);
//       console.log(`✅ First auto request created for new user: ${user.userId}`);
//     } catch (autoRequestError) {
//       console.error("❌ Failed to create auto request for new user:", autoRequestError);
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     const safeUser = {
//       _id: user._id,
//       userId: user.userId,
//       email: user.email,        // ✅ email return करतोय
//       referralCode: user.referralCode,
//       role: user.role
//     };

//     res.status(201).json({ 
//       success: true,
//       token, 
//       user: safeUser,
//       autoRequest: autoRequest ? {
//         id: autoRequest._id,
//         amount: autoRequest.amount,
//         expiresAt: autoRequest.expiresAt,
//         type: "FIRST_WELCOME_BONUS"
//       } : null
//     });

//   } catch (err) {
//     console.error("Register Error:", err);
//     res.status(500).json({ 
//       success: false,
//       message: err.message 
//     });
//   }
// };


// /* ================= LOGIN ================= */
// exports.login = async (req, res) => {
//   try {
//     let { userId, pin } = req.body;

//     if (!userId || !pin) {
//       return res.status(400).json({ 
//         message: "User ID and PIN are required" 
//       });
//     }

//     userId = userId.toString().trim().toUpperCase();
    
//     if (!/^\d{6}$/.test(userId)) {
//       return res.status(400).json({ 
//         message: "User ID must be 6 digits" 
//       });
//     }

//     const user = await User.findOne({ userId });
    
//     if (!user) {
//       return res.status(404).json({ 
//         message: "User ID not found" 
//       });
//     }

//     const match = await bcryptjs.compare(pin, user.pin);
    
//     if (!match) {
//       return res.status(400).json({ 
//         message: "Invalid PIN" 
//       });
//     }

//     // ✅ Check if user has active auto request
//     let activeAutoRequest = null;
//     if (user.autoRequest?.enabled && user.autoRequest?.currentRequestId) {
//       const Scanner = require("../models/Scanner");
//       activeAutoRequest = await Scanner.findOne({
//         _id: user.autoRequest.currentRequestId,
//         status: "ACTIVE"
//       });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role, userId: user.userId },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     const safeUser = {
//       _id: user._id,
//       userId: user.userId,
//       referralCode: user.referralCode,
//       role: user.role,
//       autoRequest: {
//         enabled: user.autoRequest?.enabled || false,
//         amount: user.autoRequest?.autoRequestAmount || 1000,
//         hasActiveRequest: !!activeAutoRequest
//       }
//     };

//     res.json({
//       success: true,
//       token,
//       user: safeUser
//     });

//   } catch (err) {
//     console.error("Login Error:", err);
//     res.status(500).json({ 
//       message: err.message || "Server error" 
//     });
//   }
// };

exports.login = async (req, res) => {
  try {
    let { userId, pin } = req.body;

    if (!userId || !pin) {
      return res.status(400).json({ 
        success: false,
        message: "User ID and PIN are required" 
      });
    }

    userId = userId.toString().trim().toUpperCase();
    
    if (!/^\d{6}$/.test(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "User ID must be 6 digits" 
      });
    }

    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User ID not found" 
      });
    }

    const match = await bcryptjs.compare(pin, user.pin);
    
    if (!match) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid PIN" 
      });
    }

    // ✅ Check if user has active auto request
    let activeAutoRequest = null;
    if (user.autoRequest?.enabled && user.autoRequest?.currentRequestId) {
      const Scanner = require("../models/Scanner");
      activeAutoRequest = await Scanner.findOne({
        _id: user.autoRequest.currentRequestId,
        status: "ACTIVE"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      _id: user._id,
      userId: user.userId,
      email: user.email,                 // ✅ email return करतोय
      referralCode: user.referralCode,
      role: user.role,
      autoRequest: {
        enabled: user.autoRequest?.enabled || false,
        amount: user.autoRequest?.autoRequestAmount || 1000,
        hasActiveRequest: !!activeAutoRequest
      }
    };

    res.json({
      success: true,
      token,
      user: safeUser
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message || "Server error" 
    });
  }
};
/* ================= GET REFERRAL STATS ================= */
exports.getReferralStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); 
    if (!user) return res.status(404).json({ message: "User not found" });

    const cashbackWallet = await Wallet.findOne({ user: user._id, type: "CASHBACK" });

    // ✅ Get all downline counts for 21 levels
    const referralTree = {
      level1: user.referralTree?.level1?.length || 0,
      level2: user.referralTree?.level2?.length || 0,
      level3: user.referralTree?.level3?.length || 0,
      level4: user.referralTree?.level4?.length || 0,
      level5: user.referralTree?.level5?.length || 0,
      level6: user.referralTree?.level6?.length || 0,
      level7: user.referralTree?.level7?.length || 0,
      level8: user.referralTree?.level8?.length || 0,
      level9: user.referralTree?.level9?.length || 0,
      level10: user.referralTree?.level10?.length || 0,
      level11: user.referralTree?.level11?.length || 0,
      level12: user.referralTree?.level12?.length || 0,
      level13: user.referralTree?.level13?.length || 0,
      level14: user.referralTree?.level14?.length || 0,
      level15: user.referralTree?.level15?.length || 0,
      level16: user.referralTree?.level16?.length || 0,
      level17: user.referralTree?.level17?.length || 0,
      level18: user.referralTree?.level18?.length || 0,
      level19: user.referralTree?.level19?.length || 0,
      level20: user.referralTree?.level20?.length || 0,
      level21: user.referralTree?.level21?.length || 0
    };

    // ✅ Earnings by level for 21 levels
    const earningsByLevel = {
      level1: user.referralEarnings?.level1 || 0,
      level2: user.referralEarnings?.level2 || 0,
      level3: user.referralEarnings?.level3 || 0,
      level4: user.referralEarnings?.level4 || 0,
      level5: user.referralEarnings?.level5 || 0,
      level6: user.referralEarnings?.level6 || 0,
      level7: user.referralEarnings?.level7 || 0,
      level8: user.referralEarnings?.level8 || 0,
      level9: user.referralEarnings?.level9 || 0,
      level10: user.referralEarnings?.level10 || 0,
      level11: user.referralEarnings?.level11 || 0,
      level12: user.referralEarnings?.level12 || 0,
      level13: user.referralEarnings?.level13 || 0,
      level14: user.referralEarnings?.level14 || 0,
      level15: user.referralEarnings?.level15 || 0,
      level16: user.referralEarnings?.level16 || 0,
      level17: user.referralEarnings?.level17 || 0,
      level18: user.referralEarnings?.level18 || 0,
      level19: user.referralEarnings?.level19 || 0,
      level20: user.referralEarnings?.level20 || 0,
      level21: user.referralEarnings?.level21 || 0,
      total: user.referralEarnings?.total || 0
    };

    res.json({
      referralCode: user.referralCode,
      totalReferrals: Object.values(referralTree).reduce((a, b) => a + b, 0),
      referralEarnings: user.referralEarnings || { total: 0 },
      cashbackBalance: cashbackWallet?.balance || 0,
      referralTree,
      earningsByLevel
    });

  } catch (err) {
    console.error("Referral Stats Error:", err);
    res.status(500).json({ message: err.message });
  }
};