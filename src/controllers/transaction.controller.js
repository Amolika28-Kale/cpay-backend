// controllers/transaction.controller.js
const Transaction = require("../models/Transaction");
const User = require("../models/User");

exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ NEW: Get Today's Team Statistics
exports.getTodayTeamStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // console.log("📊 Fetching today's stats for user:", userId);
    // console.log("📅 Date range:", today, "to", tomorrow);

    // 1️⃣ Get today's commission (TEAM_CASHBACK transactions for current user)
    const todayTransactions = await Transaction.find({
      user: userId,
      type: "TEAM_CASHBACK",
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayEarnings = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    // console.log("💰 Today's earnings:", todayEarnings);

    // 2️⃣ Get all team members from referral tree (all 21 levels)
    const user = await User.findById(userId);
    const allTeamMembers = [];
    
    if (user && user.referralTree) {
      for (let level = 1; level <= 21; level++) {
        const levelUsers = user.referralTree?.[`level${level}`] || [];
        allTeamMembers.push(...levelUsers);
      }
    }

    // console.log("👥 Total team members:", allTeamMembers.length);

    // 3️⃣ Get today's team cashback (all cashback transactions from team members)
    let todayTeamCashback = 0;
    let todayActiveMembers = [];

    if (allTeamMembers.length > 0) {
      // Get all cashback transactions from team members today
      const teamCashbackTx = await Transaction.find({
        user: { $in: allTeamMembers },
        type: { $in: ["CASHBACK", "CREATOR_CASHBACK", "ACCEPTOR_CASHBACK"] },
        createdAt: { $gte: today, $lt: tomorrow }
      });

      todayTeamCashback = teamCashbackTx.reduce((sum, tx) => sum + tx.amount, 0);
      
      // Get unique active members
      todayActiveMembers = [...new Set(teamCashbackTx.map(tx => tx.user.toString()))];
    }

    // console.log("📈 Today's team cashback:", todayTeamCashback);
    // console.log("👤 Today's active members:", todayActiveMembers.length);

    res.json({
      success: true,
      teamBusiness: todayTeamCashback,
      yourCommission: todayEarnings,
      teamMembers: todayActiveMembers.length,
      activeMembers: todayActiveMembers,
      date: today
    });

  } catch (err) {
    console.error("❌ Error getting today's team stats:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};