// fixLegUnlocking.js
const mongoose = require('mongoose');
require('dotenv').config();

// तुमचं User model import करा
const User = require('./src/models/User');

// MongoDB URL check
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cpayadmin123:cpay123@cluster0.zdbgyfs.mongodb.net/cpay?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB Connected Successfully');
  fixExistingUsersLegs();
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Fix script function - CORRECTED
const fixExistingUsersLegs = async () => {
  try {
    console.log("\n🔍 Starting Leg Unlocking Fix Script...");
    console.log("========================================");
    
    // सगळे users मिळवा
    const allUsers = await User.find({});
    console.log(`Total users found: ${allUsers.length}`);
    
    let leg1Fixed = 0;
    let leg2Fixed = 0;
    let leg3Fixed = 0;
    let leg4Fixed = 0;
    let leg5Fixed = 0;
    let leg6Fixed = 0;
    let leg7Fixed = 0;
    let totalFixes = 0;
    
    for (const user of allUsers) {
      let changed = false;
      const directReferralsCount = user.referralTree?.level1?.length || 0;
      
      console.log(`\n👤 User: ${user.userId} (Direct referrals: ${directReferralsCount})`);
      console.log(`   Current legs:`, user.legsUnlocked);
      
      // ===== LEG 1 SPECIAL HANDLING =====
      // Leg 1 should be false if direct referrals = 0
      // Leg 1 should be true only if direct referrals >= 1
      if (directReferralsCount === 0 && user.legsUnlocked.leg1 === true) {
        user.legsUnlocked.leg1 = false;
        leg1Fixed++;
        changed = true;
        console.log(`   🔒 Leg 1 locked - No direct referrals`);
      } else if (directReferralsCount >= 1 && user.legsUnlocked.leg1 === false) {
        user.legsUnlocked.leg1 = true;
        leg1Fixed++;
        changed = true;
        console.log(`   ✅ Leg 1 unlocked - Has ${directReferralsCount} direct referrals`);
      }
      
      // LEG 2 (Levels 4-6): Need 2 direct referrals
      if (directReferralsCount >= 2 && !user.legsUnlocked.leg2) {
        user.legsUnlocked.leg2 = true;
        leg2Fixed++;
        changed = true;
        console.log(`   ✅ Leg 2 unlocked - Has ${directReferralsCount} direct referrals`);
      } else if (directReferralsCount < 2 && user.legsUnlocked.leg2 === true) {
        user.legsUnlocked.leg2 = false;
        leg2Fixed++;
        changed = true;
        console.log(`   🔒 Leg 2 locked - Needs 2 direct referrals (has ${directReferralsCount})`);
      }
      
      // LEG 3 (Levels 7-9): Need 3 direct referrals
      if (directReferralsCount >= 3 && !user.legsUnlocked.leg3) {
        user.legsUnlocked.leg3 = true;
        leg3Fixed++;
        changed = true;
        console.log(`   ✅ Leg 3 unlocked - Has ${directReferralsCount} direct referrals`);
      } else if (directReferralsCount < 3 && user.legsUnlocked.leg3 === true) {
        user.legsUnlocked.leg3 = false;
        leg3Fixed++;
        changed = true;
        console.log(`   🔒 Leg 3 locked - Needs 3 direct referrals (has ${directReferralsCount})`);
      }
      
      // LEG 4 (Levels 10-12): Need 4 direct referrals
      if (directReferralsCount >= 4 && !user.legsUnlocked.leg4) {
        user.legsUnlocked.leg4 = true;
        leg4Fixed++;
        changed = true;
        console.log(`   ✅ Leg 4 unlocked - Has ${directReferralsCount} direct referrals`);
      } else if (directReferralsCount < 4 && user.legsUnlocked.leg4 === true) {
        user.legsUnlocked.leg4 = false;
        leg4Fixed++;
        changed = true;
        console.log(`   🔒 Leg 4 locked - Needs 4 direct referrals (has ${directReferralsCount})`);
      }
      
      // LEG 5 (Levels 13-15): Need 5 direct referrals
      if (directReferralsCount >= 5 && !user.legsUnlocked.leg5) {
        user.legsUnlocked.leg5 = true;
        leg5Fixed++;
        changed = true;
        console.log(`   ✅ Leg 5 unlocked - Has ${directReferralsCount} direct referrals`);
      } else if (directReferralsCount < 5 && user.legsUnlocked.leg5 === true) {
        user.legsUnlocked.leg5 = false;
        leg5Fixed++;
        changed = true;
        console.log(`   🔒 Leg 5 locked - Needs 5 direct referrals (has ${directReferralsCount})`);
      }
      
      // LEG 6 (Levels 16-18): Need 6 direct referrals
      if (directReferralsCount >= 6 && !user.legsUnlocked.leg6) {
        user.legsUnlocked.leg6 = true;
        leg6Fixed++;
        changed = true;
        console.log(`   ✅ Leg 6 unlocked - Has ${directReferralsCount} direct referrals`);
      } else if (directReferralsCount < 6 && user.legsUnlocked.leg6 === true) {
        user.legsUnlocked.leg6 = false;
        leg6Fixed++;
        changed = true;
        console.log(`   🔒 Leg 6 locked - Needs 6 direct referrals (has ${directReferralsCount})`);
      }
      
      // LEG 7 (Levels 19-21): Need 7 direct referrals
      if (directReferralsCount >= 7 && !user.legsUnlocked.leg7) {
        user.legsUnlocked.leg7 = true;
        leg7Fixed++;
        changed = true;
        console.log(`   ✅ Leg 7 unlocked - Has ${directReferralsCount} direct referrals`);
      } else if (directReferralsCount < 7 && user.legsUnlocked.leg7 === true) {
        user.legsUnlocked.leg7 = false;
        leg7Fixed++;
        changed = true;
        console.log(`   🔒 Leg 7 locked - Needs 7 direct referrals (has ${directReferralsCount})`);
      }
      
      if (changed) {
        await user.save();
        totalFixes++;
        console.log(`   💾 Saved changes for ${user.userId}`);
        console.log(`   New legs:`, user.legsUnlocked);
      }
    }
    
    console.log("\n========================================");
    console.log("📊 FIX SUMMARY:");
    console.log("========================================");
    console.log(`✅ Leg 1 fixed: ${leg1Fixed} users`);
    console.log(`✅ Leg 2 fixed: ${leg2Fixed} users`);
    console.log(`✅ Leg 3 fixed: ${leg3Fixed} users`);
    console.log(`✅ Leg 4 fixed: ${leg4Fixed} users`);
    console.log(`✅ Leg 5 fixed: ${leg5Fixed} users`);
    console.log(`✅ Leg 6 fixed: ${leg6Fixed} users`);
    console.log(`✅ Leg 7 fixed: ${leg7Fixed} users`);
    console.log(`📌 Total users updated: ${totalFixes}`);
    console.log("========================================");
    
    console.log("\n✅ Fix script completed successfully!");
    
    // MongoDB connection close करा
    mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error in fix script:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};