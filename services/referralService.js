// services/referralService.js - FIXED VERSION
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
      if (!user || !user.referredBy) {
        // console.log(`User ${userId} has no referrer, stopping commission chain`);
        return;
      }

      let currentReferrerId = user.referredBy;
      let level = 1;

      // console.log(`\n💰 Processing team cashback for user ${userId} - Amount: ₹${cashbackEarned}`);

      while (currentReferrerId && level <= 21) {
        const referrer = await User.findById(currentReferrerId);
        if (!referrer) break;

        // CRITICAL: Check if this level's leg is unlocked
        if (!referrer.isLegUnlocked(level)) {
          // console.log(`❌ Level ${level} leg not unlocked for ${referrer.userId}, skipping commission`);
          currentReferrerId = referrer.referredBy;
          level++;
          continue;
        }

        // Get commission rate
        const rate = referrer.referralRates[`level${level}`] || 0;
        const commission = Number((cashbackEarned * rate).toFixed(2));

        if (commission > 0) {
          // console.log(`✅ Level ${level} unlocked - Paying ${rate*100}% = ₹${commission} to ${referrer.userId}`);

          // Add to cashback wallet
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
              type: "TEAM_COMMISSION",
              legUnlocked: true
            }
          });
        }

        currentReferrerId = referrer.referredBy;
        level++;
      }
      
    } catch (error) {
      // console.error("Error processing team cashback:", error);
    }
  }

  /**
   * Get team cashback summary with member details - FIXED VERSION
   */
  static async getTeamCashbackSummary(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const teamStats = {
        legsUnlocked: user.legsUnlocked
      };
      
      // Initialize stats for all 21 levels
      for (let level = 1; level <= 21; level++) {
        const levelUsers = user.referralTree?.[`level${level}`] || [];
        
        const levelData = {
          users: levelUsers.length,
          yourCommission: user.referralEarnings?.[`level${level}`] || 0,
          teamCashback: user.teamCashback?.[`level${level}`]?.total || 0,
          unlocked: user.isLegUnlocked(level)
        };

        // ✅ FIX: Get detailed user information for this level
        if (levelUsers.length > 0) {
          const userDetails = await User.find(
            { _id: { $in: levelUsers } },
            'userId referralEarnings teamCashback'
          );
          
          levelData.usersList = userDetails.map(u => {
            // Calculate team cashback from all levels
            const teamCashbackTotal = Object.values(u.teamCashback || {}).reduce(
              (sum, level) => sum + (level?.total || 0), 0
            );
            
            return {
              userId: u.userId,
              earnings: u.referralEarnings?.total || 0,
              teamCashback: teamCashbackTotal,
              // Add more details if needed
              levelEarnings: u.referralEarnings || {},
              legsUnlocked: u.legsUnlocked
            };
          });
        } else {
          levelData.usersList = [];
        }

        teamStats[`level${level}`] = levelData;
      }

      return teamStats;
    } catch (error) {
      // console.error("Error getting team cashback summary:", error);
      return null;
    }
  }
}

module.exports = ReferralService;