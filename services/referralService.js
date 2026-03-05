
const Transaction = require("../src/models/Transaction");
const User = require("../src/models/User");
const Wallet = require("../src/models/Wallet");

class ReferralService {
  /**
   * Process team cashback commissions for all 21 levels
   */
  static async processTeamCashback(userId, cashbackEarned, sourceType, sourceId = null) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.referredBy) return;

      let currentReferrerId = user.referredBy;
      let level = 1;

      while (currentReferrerId && level <= 21) {
        const referrer = await User.findById(currentReferrerId);
        if (!referrer) break;

        // Check if this level's leg is unlocked for the referrer
        if (!referrer.isLegUnlocked(level)) {
          // console.log(`Level ${level} leg not unlocked for ${referrer.userId}, skipping...`);
          currentReferrerId = referrer.referredBy;
          level++;
          continue;
        }

        // Get commission rate for this level
        const rate = referrer.referralRates[`level${level}`] || 0;
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

          // Update referral earnings
          const updateQuery = {};
          updateQuery[`referralEarnings.level${level}`] = (referrer.referralEarnings[`level${level}`] || 0) + commission;
          updateQuery[`referralEarnings.total`] = (referrer.referralEarnings.total || 0) + commission;
          
          // Update team cashback total
          updateQuery[`teamCashback.level${level}.total`] = (referrer.teamCashback?.[`level${level}`]?.total || 0) + cashbackEarned;
          
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

          // console.log(`✅ Level ${level} commission: ₹${commission} to ${referrer.userId} (${rate*100}%)`);
        }

        currentReferrerId = referrer.referredBy;
        level++;
      }
    } catch (error) {
      console.error("Error processing team cashback:", error);
    }
  }

  /**
   * Get team cashback summary for user (all 21 levels)
   */
  static async getTeamCashbackSummary(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const teamStats = {};
      
      // Initialize stats for all 21 levels
      for (let level = 1; level <= 21; level++) {
        const levelUsers = user.referralTree?.[`level${level}`] || [];
        const levelData = {
          users: levelUsers.length,
          totalEarnings: 0,
          yourCommission: user.referralEarnings?.[`level${level}`] || 0,
          teamCashback: user.teamCashback?.[`level${level}`]?.total || 0,
          unlocked: user.isLegUnlocked(level)
        };

        // Get details of users at this level (for frontend display)
        if (levelUsers.length > 0) {
          const userDetails = await User.find(
            { _id: { $in: levelUsers } },
            'userId referralEarnings.total teamCashback'
          );
          
          levelData.usersList = userDetails.map(u => ({
            userId: u.userId,
            earnings: u.referralEarnings?.total || 0,
            teamCashback: u.teamCashback?.total || 0
          }));
        }

        teamStats[`level${level}`] = levelData;
      }

      // Add leg unlocking status
      teamStats.legsUnlocked = user.legsUnlocked;

      return teamStats;
    } catch (error) {
      console.error("Error getting team cashback summary:", error);
      return null;
    }
  }

  /**
   * Get detailed team tree structure
   */
  static async getTeamTree(userId, depth = 7) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const tree = {
        userId: user.userId,
        referralCode: user.referralCode,
        earnings: user.referralEarnings?.total || 0,
        levels: {}
      };

      for (let level = 1; level <= depth * 3; level++) {
        const levelUsers = user.referralTree?.[`level${level}`] || [];
        if (levelUsers.length > 0) {
          const users = await User.find(
            { _id: { $in: levelUsers } },
            'userId referralEarnings.total teamCashback'
          );
          
          tree.levels[`level${level}`] = users.map(u => ({
            userId: u.userId,
            earnings: u.referralEarnings?.total || 0,
            teamCashback: u.teamCashback?.total || 0
          }));
        } else {
          tree.levels[`level${level}`] = [];
        }
      }

      return tree;
    } catch (error) {
      console.error("Error getting team tree:", error);
      return null;
    }
  }
}

module.exports = ReferralService;