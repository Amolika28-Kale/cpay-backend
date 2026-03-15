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

// Get leg unlocking status - CORRECTED
router.get('/leg-status', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const directReferralsCount = user.referralTree?.level1?.length || 0;
    const requirements = User.getLegRequirements();
    const nextLeg = user.getNextLegToUnlock();
    
    const legStatus = {
      directReferrals: directReferralsCount,
      legsUnlocked: user.legsUnlocked,
      legDetails: {
        leg1: { 
          unlocked: user.legsUnlocked.leg1, 
          levels: requirements.leg1.levels,
          requirement: `Need ${requirements.leg1.required} direct referral`,
          current: directReferralsCount,
          needed: requirements.leg1.required,
          remaining: Math.max(0, requirements.leg1.required - directReferralsCount)
        },
        leg2: { 
          unlocked: user.legsUnlocked.leg2, 
          levels: requirements.leg2.levels,
          requirement: `Need ${requirements.leg2.required} direct referrals`,
          current: directReferralsCount,
          needed: requirements.leg2.required,
          remaining: Math.max(0, requirements.leg2.required - directReferralsCount)
        },
        leg3: { 
          unlocked: user.legsUnlocked.leg3, 
          levels: requirements.leg3.levels,
          requirement: `Need ${requirements.leg3.required} direct referrals`,
          current: directReferralsCount,
          needed: requirements.leg3.required,
          remaining: Math.max(0, requirements.leg3.required - directReferralsCount)
        },
        leg4: { 
          unlocked: user.legsUnlocked.leg4, 
          levels: requirements.leg4.levels,
          requirement: `Need ${requirements.leg4.required} direct referrals`,
          current: directReferralsCount,
          needed: requirements.leg4.required,
          remaining: Math.max(0, requirements.leg4.required - directReferralsCount)
        },
        leg5: { 
          unlocked: user.legsUnlocked.leg5, 
          levels: requirements.leg5.levels,
          requirement: `Need ${requirements.leg5.required} direct referrals`,
          current: directReferralsCount,
          needed: requirements.leg5.required,
          remaining: Math.max(0, requirements.leg5.required - directReferralsCount)
        },
        leg6: { 
          unlocked: user.legsUnlocked.leg6, 
          levels: requirements.leg6.levels,
          requirement: `Need ${requirements.leg6.required} direct referrals`,
          current: directReferralsCount,
          needed: requirements.leg6.required,
          remaining: Math.max(0, requirements.leg6.required - directReferralsCount)
        },
        leg7: { 
          unlocked: user.legsUnlocked.leg7, 
          levels: requirements.leg7.levels,
          requirement: `Need ${requirements.leg7.required} direct referrals`,
          current: directReferralsCount,
          needed: requirements.leg7.required,
          remaining: Math.max(0, requirements.leg7.required - directReferralsCount)
        }
      },
      nextLegToUnlock: nextLeg,
      summary: `You have ${directReferralsCount} direct referral${directReferralsCount !== 1 ? 's' : ''}. `
    };

    if (nextLeg) {
      legStatus.summary += `Need ${nextLeg.remaining} more direct referral${nextLeg.remaining > 1 ? 's' : ''} to unlock ${nextLeg.leg} (levels ${nextLeg.levels.join('-')}).`;
    } else {
      legStatus.summary += `All legs unlocked! Great job!`;
    }

    res.json(legStatus);
  } catch (error) {
    console.error("Leg status error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get next leg requirement - CORRECTED
router.get('/next-leg-requirement', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const nextLeg = user.getNextLegToUnlock();

    res.json({
      success: true,
      data: {
        userId: user.userId,
        directReferrals: user.referralTree?.level1?.length || 0,
        legsUnlocked: user.legsUnlocked,
        nextLegToUnlock: nextLeg,
        summary: nextLeg ? 
          (nextLeg.isUnlockable ? 
            `You can unlock ${nextLeg.leg} now!` : 
            `Need ${nextLeg.remaining} more direct referral${nextLeg.remaining > 1 ? 's' : ''} to unlock ${nextLeg.leg} (levels ${nextLeg.levels.join('-')})`) :
          'All legs unlocked! Great job!'
      }
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
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