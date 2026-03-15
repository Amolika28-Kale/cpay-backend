// fixLegUnlocking.js
const mongoose = require('mongoose');
require('dotenv').config();

// तुमचं User model import करा (path योग्य आहे का तपासा)
const User = require('./src/models/User'); // किंवा './src/models/User'

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

// Fix script function - DIRECT REFERRAL BASED
const fixExistingUsersLegs = async () => {
  try {
    console.log("\n🔍 Starting Leg Unlocking Fix Script...");
    console.log("========================================");
    
    // सगळे users मिळवा
    const allUsers = await User.find({});
    console.log(`Total users found: ${allUsers.length}`);
    
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
      
      // LEG 2 (Levels 4-6): Need 1 direct referral
      if (!user.legsUnlocked.leg2 && directReferralsCount >= 1) {
        user.legsUnlocked.leg2 = true;
        leg2Fixed++;
        changed = true;
        console.log(`   ✅ Leg 2 unlocked - Has ${directReferralsCount} direct referrals`);
      }
      
      // LEG 3 (Levels 7-9): Need 2 direct referrals
      if (!user.legsUnlocked.leg3 && directReferralsCount >= 2) {
        user.legsUnlocked.leg3 = true;
        leg3Fixed++;
        changed = true;
        console.log(`   ✅ Leg 3 unlocked - Has ${directReferralsCount} direct referrals`);
      }
      
      // LEG 4 (Levels 10-12): Need 3 direct referrals
      if (!user.legsUnlocked.leg4 && directReferralsCount >= 3) {
        user.legsUnlocked.leg4 = true;
        leg4Fixed++;
        changed = true;
        console.log(`   ✅ Leg 4 unlocked - Has ${directReferralsCount} direct referrals`);
      }
      
      // LEG 5 (Levels 13-15): Need 4 direct referrals
      if (!user.legsUnlocked.leg5 && directReferralsCount >= 4) {
        user.legsUnlocked.leg5 = true;
        leg5Fixed++;
        changed = true;
        console.log(`   ✅ Leg 5 unlocked - Has ${directReferralsCount} direct referrals`);
      }
      
      // LEG 6 (Levels 16-18): Need 5 direct referrals
      if (!user.legsUnlocked.leg6 && directReferralsCount >= 5) {
        user.legsUnlocked.leg6 = true;
        leg6Fixed++;
        changed = true;
        console.log(`   ✅ Leg 6 unlocked - Has ${directReferralsCount} direct referrals`);
      }
      
      // LEG 7 (Levels 19-21): Need 6 direct referrals
      if (!user.legsUnlocked.leg7 && directReferralsCount >= 6) {
        user.legsUnlocked.leg7 = true;
        leg7Fixed++;
        changed = true;
        console.log(`   ✅ Leg 7 unlocked - Has ${directReferralsCount} direct referrals`);
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
    console.log(`✅ Leg 2 fixed: ${leg2Fixed} users`);
    console.log(`✅ Leg 3 fixed: ${leg3Fixed} users`);
    console.log(`✅ Leg 4 fixed: ${leg4Fixed} users`);
    console.log(`✅ Leg 5 fixed: ${leg5Fixed} users`);
    console.log(`✅ Leg 6 fixed: ${leg6Fixed} users`);
    console.log(`✅ Leg 7 fixed: ${leg7Fixed} users`);
    console.log(`📌 Total users updated: ${totalFixes}`);
    console.log("========================================");
    
    // Verify by showing sample of fixed users
    console.log("\n🔍 Sample of fixed users:");
    const fixedUsers = await User.find({
      $or: [
        { "legsUnlocked.leg2": true },
        { "legsUnlocked.leg3": true },
        { "legsUnlocked.leg4": true },
        { "legsUnlocked.leg5": true },
        { "legsUnlocked.leg6": true },
        { "legsUnlocked.leg7": true }
      ]
    }).limit(5);
    
    for (const user of fixedUsers) {
      const directCount = user.referralTree?.level1?.length || 0;
      console.log(`- ${user.userId}: Direct=${directCount}, Legs=`, user.legsUnlocked);
    }
    
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