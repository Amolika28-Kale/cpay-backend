// controllers/adminStats.controller.js
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Scanner = require('../models/Scanner');
const Wallet = require('../models/Wallet');

// Get complete system statistics
exports.getSystemStats = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalScanners = await Scanner.countDocuments();
    const activeScanners = await Scanner.countDocuments({ status: "ACTIVE" });
    const completedScanners = await Scanner.countDocuments({ status: "COMPLETED" });

    // Total volume
    const transactionVolume = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Users with their details
    const users = await User.find()
      .select('-pin')
      .populate('referredBy', 'userId email')
      .lean();

    // Get all transactions for each user
    const transactions = await Transaction.find()
      .populate('user', 'userId email')
      .sort({ createdAt: -1 });

    // Get all scanners
    const scanners = await Scanner.find()
      .populate('user', 'userId email')
      .populate('acceptedBy', 'userId email')
      .lean();

    // Group scanners by user
    const userScanners = {};
    scanners.forEach(scanner => {
      const userId = scanner.user?._id?.toString();
      if (!userId) return;
      
      if (!userScanners[userId]) {
        userScanners[userId] = {
          created: [],
          accepted: []
        };
      }
      
      if (scanner.user?._id?.toString() === userId) {
        userScanners[userId].created.push(scanner);
      }
      if (scanner.acceptedBy?._id?.toString() === userId) {
        userScanners[userId].accepted.push(scanner);
      }
    });

    // Get wallets for all users
    const wallets = await Wallet.find().lean();
    const userWallets = {};
    wallets.forEach(wallet => {
      const userId = wallet.user?.toString();
      if (!userId) return;
      
      if (!userWallets[userId]) {
        userWallets[userId] = {};
      }
      userWallets[userId][wallet.type] = wallet.balance;
    });

    // Prepare detailed user list
    const detailedUsers = users.map(user => {
      const userId = user._id.toString();
      const userCreatedScanners = userScanners[userId]?.created || [];
      const userAcceptedScanners = userScanners[userId]?.accepted || [];
      
      // Calculate team members (all levels)
      let teamCount = 0;
      for (let i = 1; i <= 21; i++) {
        teamCount += user.referralTree?.[`level${i}`]?.length || 0;
      }

      return {
        _id: user._id,
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        
        // Wallet balances
        wallets: {
          USDT: userWallets[userId]?.USDT || 0,
          INR: userWallets[userId]?.INR || 0,
          CASHBACK: userWallets[userId]?.CASHBACK || 0
        },
        
        // Scanner stats
        scanners: {
          created: userCreatedScanners.length,
          createdTotalAmount: userCreatedScanners.reduce((sum, s) => sum + (s.amount || 0), 0),
          accepted: userAcceptedScanners.length,
          acceptedTotalAmount: userAcceptedScanners.reduce((sum, s) => sum + (s.amount || 0), 0)
        },
        
        // Team stats
        team: {
          total: teamCount,
          levels: {
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
          }
        },
        
        // Earnings
        earnings: {
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
        }
      };
    });

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .populate('user', 'userId email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTransactions,
        totalScanners,
        activeScanners,
        completedScanners,
        transactionVolume: transactionVolume[0]?.total || 0
      },
      users: detailedUsers,
      transactions: recentTransactions,
      scanners
    });

  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: err.message 
    });
  }
};

// Get single user details with all stats
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-pin')
      .populate('referredBy', 'userId email')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's transactions
    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 });

    // Get user's scanners (created)
    const createdScanners = await Scanner.find({ user: userId })
      .populate('acceptedBy', 'userId email');

    // Get user's accepted scanners
    const acceptedScanners = await Scanner.find({ acceptedBy: userId })
      .populate('user', 'userId email');

    // Get user's wallets
    const wallets = await Wallet.find({ user: userId });

    // Calculate team members
    let teamCount = 0;
    const teamMembers = [];
    for (let level = 1; level <= 21; level++) {
      const levelUsers = user.referralTree?.[`level${level}`] || [];
      teamCount += levelUsers.length;
      
      if (levelUsers.length > 0) {
        const members = await User.find(
          { _id: { $in: levelUsers } },
          'userId email referralEarnings wallets'
        ).lean();
        
        teamMembers.push({
          level,
          count: levelUsers.length,
          members: members.map(m => ({
            userId: m.userId,
            email: m.email,
            earnings: m.referralEarnings?.total || 0
          }))
        });
      }
    }

    res.json({
      success: true,
      user: {
        ...user,
        wallets: wallets.reduce((acc, w) => ({ ...acc, [w.type]: w.balance }), {}),
        transactions,
        scanners: {
          created: createdScanners,
          accepted: acceptedScanners
        },
        team: {
          total: teamCount,
          levels: teamMembers
        },
        earnings: user.referralEarnings
      }
    });

  } catch (err) {
    console.error("User details error:", err);
    res.status(500).json({ message: "Server error" });
  }
};