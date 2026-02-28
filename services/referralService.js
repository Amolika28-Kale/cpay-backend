// services/referralService.js

const Transaction = require("../src/models/Transaction");
const User = require("../src/models/User");
const Wallet = require("../src/models/Wallet");


const REFERRAL_RATES = {
  level1: 0.30,
  level2: 0.15,
  level3: 0.10,
  level4: 0.05,
  level5: 0.03
};

class ReferralService {
  /**
   * Process team cashback commissions
   * When someone earns cashback, uplines get percentage based on level
   */
static async processTeamCashback(userId, cashbackEarned, sourceType, sourceId = null) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.referredBy) return;

    let currentReferrerId = user.referredBy;
    let level = 1;

    while (currentReferrerId && level <= 5) {
      const referrer = await User.findById(currentReferrerId);
      if (!referrer) break;

      const rate = REFERRAL_RATES[`level${level}`];
      const commission = Number((cashbackEarned * rate).toFixed(2));

      if (commission > 0) {
        // Add to referrer's cashback wallet
        let cashbackWallet = await Wallet.findOne({
          user: referrer._id,
          type: "CASHBACK"
        });

        if (!cashbackWallet) {
          cashbackWallet = new Wallet({
            user: referrer._id,
            type: "CASHBACK",
            balance: 0
          });
        }

        cashbackWallet.balance += commission;
        await cashbackWallet.save();

        // ✅ FIXED: Update specific level in referralEarnings
        const updateQuery = {};
        updateQuery[`referralEarnings.level${level}`] = (referrer.referralEarnings[`level${level}`] || 0) + commission;
        updateQuery[`referralEarnings.total`] = (referrer.referralEarnings.total || 0) + commission;
        
        await User.findByIdAndUpdate(
          referrer._id,
          { $set: updateQuery }
        );

        // Create transaction record
        await Transaction.create({
          user: referrer._id,
          type: "TEAM_CASHBACK",
          fromWallet: null,
          toWallet: "CASHBACK",
          amount: commission,
          relatedScanner: sourceId,
          meta: {
            level: level,
            rate: rate * 100 + "%",
            sourceUser: userId,
            sourceAmount: cashbackEarned,
            sourceType: sourceType,
            type: "TEAM_COMMISSION"
          }
        });
      }

      currentReferrerId = referrer.referredBy;
      level++;
    }
  } catch (error) {
    console.error("Error processing team cashback:", error);
  }
}

  /**
   * Get team cashback summary for user
   */
  static async getTeamCashbackSummary(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      // Get all downline users with their earnings
      const downlineUsers = await User.find({
        $or: [
          { _id: { $in: user.referralTree?.level1 || [] } },
          { _id: { $in: user.referralTree?.level2 || [] } },
          { _id: { $in: user.referralTree?.level3 || [] } },
          { _id: { $in: user.referralTree?.level4 || [] } },
          { _id: { $in: user.referralTree?.level5 || [] } }
        ]
      }).select('userId referralEarnings totalReferrals');

      // Calculate team totals by level
      const teamStats = {
        level1: { users: 0, totalEarnings: 0, yourCommission: 0 },
        level2: { users: 0, totalEarnings: 0, yourCommission: 0 },
        level3: { users: 0, totalEarnings: 0, yourCommission: 0 },
        level4: { users: 0, totalEarnings: 0, yourCommission: 0 },
        level5: { users: 0, totalEarnings: 0, yourCommission: 0 }
      };

      for (let level = 1; level <= 5; level++) {
        const levelUsers = user.referralTree?.[`level${level}`] || [];
        teamStats[`level${level}`].users = levelUsers.length;
        
        // Sum earnings of users at this level
        for (const userId of levelUsers) {
          const levelUser = downlineUsers.find(u => u._id.toString() === userId.toString());
          if (levelUser) {
            teamStats[`level${level}`].totalEarnings += levelUser.referralEarnings?.total || 0;
          }
        }
        
        // Your commission from this level (already in your earnings)
        teamStats[`level${level}`].yourCommission = user.referralEarnings?.[`level${level}`] || 0;
      }

      return teamStats;
    } catch (error) {
      console.error("Error getting team cashback summary:", error);
      return null;
    }
  }
}

module.exports = ReferralService;