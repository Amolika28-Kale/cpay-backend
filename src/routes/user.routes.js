// routes/userAuth.routes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // ✅ IMPORTANT: mongoose import करा
const { 
  register, 
  login,
  getReferralStats, 
} = require('../controllers/userAuth.controller');
const userAuth = require("../middlewares/userAuth.middleware");
const User = require('../models/User');
const Transaction = require('../models/Transaction'); // ✅ Transaction model import करा

// Auth Routes
router.post('/register', register);
router.post('/login', login);
router.get('/referral', userAuth, getReferralStats);

// Get leg unlocking status
router.get('/leg-status', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const directReferralsCount = user.referralTree?.level1?.length || 0;
    
    const legStatus = {
      directReferrals: directReferralsCount,
      legsUnlocked: user.legsUnlocked,
      legDetails: {
        leg1: { 
          unlocked: true, 
          levels: [1,2,3],
          requirement: "Always unlocked",
          current: "N/A",
          needed: 0
        },
        leg2: { 
          unlocked: user.legsUnlocked.leg2, 
          levels: [4,5,6],
          requirement: "Need at least 1 direct referral",
          current: directReferralsCount,
          needed: 1,
          remaining: Math.max(0, 1 - directReferralsCount)
        },
        leg3: { 
          unlocked: user.legsUnlocked.leg3, 
          levels: [7,8,9],
          requirement: "Need at least 2 direct referrals",
          current: directReferralsCount,
          needed: 2,
          remaining: Math.max(0, 2 - directReferralsCount)
        },
        leg4: { 
          unlocked: user.legsUnlocked.leg4, 
          levels: [10,11,12],
          requirement: "Need at least 3 direct referrals",
          current: directReferralsCount,
          needed: 3,
          remaining: Math.max(0, 3 - directReferralsCount)
        },
        leg5: { 
          unlocked: user.legsUnlocked.leg5, 
          levels: [13,14,15],
          requirement: "Need at least 4 direct referrals",
          current: directReferralsCount,
          needed: 4,
          remaining: Math.max(0, 4 - directReferralsCount)
        },
        leg6: { 
          unlocked: user.legsUnlocked.leg6, 
          levels: [16,17,18],
          requirement: "Need at least 5 direct referrals",
          current: directReferralsCount,
          needed: 5,
          remaining: Math.max(0, 5 - directReferralsCount)
        },
        leg7: { 
          unlocked: user.legsUnlocked.leg7, 
          levels: [19,20,21],
          requirement: "Need at least 6 direct referrals",
          current: directReferralsCount,
          needed: 6,
          remaining: Math.max(0, 6 - directReferralsCount)
        }
      },
      nextLegToUnlock: null,
      summary: `You have ${directReferralsCount} direct referral${directReferralsCount !== 1 ? 's' : ''}. `
    };

    const legOrder = ['leg2', 'leg3', 'leg4', 'leg5', 'leg6', 'leg7'];
    for (const leg of legOrder) {
      if (!user.legsUnlocked[leg]) {
        const needed = legStatus.legDetails[leg].needed;
        legStatus.nextLegToUnlock = {
          leg: leg,
          levels: legStatus.legDetails[leg].levels,
          required: needed,
          current: directReferralsCount,
          remaining: needed - directReferralsCount
        };
        legStatus.summary += `Need ${needed - directReferralsCount} more direct referral${needed - directReferralsCount !== 1 ? 's' : ''} to unlock ${leg} (levels ${legStatus.legDetails[leg].levels.join('-')}).`;
        break;
      }
    }

    if (!legStatus.nextLegToUnlock) {
      legStatus.summary += `All legs unlocked! Great job!`;
    }

    res.json(legStatus);
  } catch (error) {
    // console.error("Leg status error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get next leg requirement
router.get('/next-leg-requirement', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const directReferralsCount = user.referralTree?.level1?.length || 0;
    
    const legRequirements = {
      leg2: { required: 1, levels: [4,5,6] },
      leg3: { required: 2, levels: [7,8,9] },
      leg4: { required: 3, levels: [10,11,12] },
      leg5: { required: 4, levels: [13,14,15] },
      leg6: { required: 5, levels: [16,17,18] },
      leg7: { required: 6, levels: [19,20,21] }
    };

    const legOrder = ['leg2', 'leg3', 'leg4', 'leg5', 'leg6', 'leg7'];
    let nextLeg = null;
    
    for (const leg of legOrder) {
      if (!user.legsUnlocked[leg]) {
        nextLeg = {
          leg: leg,
          requiredDirectReferrals: legRequirements[leg].required,
          currentDirectReferrals: directReferralsCount,
          remainingToUnlock: Math.max(0, legRequirements[leg].required - directReferralsCount),
          levelsInThisLeg: legRequirements[leg].levels,
          isUnlockable: directReferralsCount >= legRequirements[leg].required
        };
        break;
      }
    }

    res.json({
      success: true,
      data: {
        userId: user.userId,
        directReferrals: directReferralsCount,
        legsUnlocked: user.legsUnlocked,
        nextLegToUnlock: nextLeg,
        summary: nextLeg ? 
          (nextLeg.isUnlockable ? 
            `You can unlock ${nextLeg.leg} now! Go to dashboard to activate.` : 
            `Need ${nextLeg.remainingToUnlock} more direct referral${nextLeg.remainingToUnlock > 1 ? 's' : ''} to unlock ${nextLeg.leg} (levels ${nextLeg.levelsInThisLeg.join('-')})`) :
          'All legs unlocked! Great job!'
      }
    });

  } catch (error) {
    // console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// routes/userAuth.routes.js - यामध्ये हा route दुरुस्त करा

// Get member details - FIXED VERSION
router.get('/member-details/:memberId', userAuth, async (req, res) => {
  try {
    const { memberId } = req.params;
    // console.log("🔍 Fetching member details for ID:", memberId);
    
    // Validate memberId
    if (!memberId || memberId === 'undefined' || memberId === 'null') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid member ID" 
      });
    }

    // ✅ FIX: Check if memberId is a valid ObjectId
    // MongoDB ObjectId is 24 characters hex string
    // But we also need to handle numeric userIds (like 334317)
    
    let member = null;
    
    // Try to find by _id (ObjectId) first
    if (mongoose.Types.ObjectId.isValid(memberId)) {
      member = await User.findById(memberId);
    }
    
    // If not found by _id, try to find by userId (numeric string)
    if (!member) {
      member = await User.findOne({ userId: memberId });
    }
    
    // If still not found, try to find by userId as number (if it's numeric)
    if (!member && /^\d+$/.test(memberId)) {
      member = await User.findOne({ userId: memberId });
    }
    
    if (!member) {
      return res.status(404).json({ 
        success: false, 
        message: "Member not found" 
      });
    }
    
    // Get member's details with safe defaults
    const memberDetails = {
      userId: member.userId || 'Unknown',
      totalEarnings: member.referralEarnings?.total || 0,
      teamCashback: 0,
      directReferrals: member.referralTree?.level1?.length || 0,
      totalTeam: 0,
      legsUnlocked: member.legsUnlocked || {
        leg1: true, leg2: false, leg3: false, 
        leg4: false, leg5: false, leg6: false, leg7: false
      },
      levelEarnings: member.referralEarnings || {},
      downlineCount: {},
      recentActivity: []
    };
    
    // Calculate team cashback safely
    try {
      if (member.teamCashback) {
        memberDetails.teamCashback = Object.values(member.teamCashback).reduce(
          (sum, level) => sum + (level?.total || 0), 0
        );
      }
    } catch (e) {
      // console.log("Error calculating team cashback:", e);
    }
    
    // Calculate total team safely
    try {
      if (member.referralTree) {
        memberDetails.totalTeam = Object.values(member.referralTree).reduce(
          (sum, level) => sum + (level?.length || 0), 0
        );
      }
    } catch (e) {
      // console.log("Error calculating total team:", e);
    }
    
    // Get downline counts safely
    try {
      for (let level = 1; level <= 7; level++) {
        memberDetails.downlineCount[`level${level}`] = 
          member.referralTree?.[`level${level}`]?.length || 0;
      }
    } catch (e) {
      // console.log("Error getting downline counts:", e);
    }
    
    // Get recent transactions safely
    try {
      const Transaction = mongoose.model('Transaction');
      const recentTx = await Transaction.find({ user: member._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
        
      memberDetails.recentActivity = recentTx.map(tx => ({
        date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A',
        amount: tx.amount || 0,
        type: tx.type || 'UNKNOWN'
      }));
    } catch (txError) {
      // console.log("No transactions found:", txError.message);
      memberDetails.recentActivity = [];
    }
    
    // console.log("✅ Member details fetched successfully for:", member.userId);
    
    res.json({
      success: true,
      data: memberDetails
    });
    
  } catch (error) {
    // console.error("❌ Error in getMemberDetails:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal server error" 
    });
  }
});
module.exports = router;