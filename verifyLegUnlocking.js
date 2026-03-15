// verifyLegUnlocking.js
const mongoose = require('mongoose');
require('dotenv').config();

// तुमच्या project structure प्रमाणे योग्य path द्या
const User = require('./src/models/User'); // किंवा './models/User'

// MongoDB URI check
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cpayadmin123:cpay123@cluster0.zdbgyfs.mongodb.net/cpay?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ MongoDB Connected Successfully');
  await verifyLegUnlocking();
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

const verifyLegUnlocking = async () => {
  try {
    const users = await User.find({});
    
    console.log("\n📊 LEG UNLOCKING STATUS REPORT");
    console.log("========================================");
    console.log(`Total Users: ${users.length}\n`);
    
    // Statistics
    const stats = {
      leg2: { unlocked: 0, shouldBe: 0, total: 0, issues: [] },
      leg3: { unlocked: 0, shouldBe: 0, total: 0, issues: [] },
      leg4: { unlocked: 0, shouldBe: 0, total: 0, issues: [] },
      leg5: { unlocked: 0, shouldBe: 0, total: 0, issues: [] },
      leg6: { unlocked: 0, shouldBe: 0, total: 0, issues: [] },
      leg7: { unlocked: 0, shouldBe: 0, total: 0, issues: [] }
    };
    
    // Detailed user report
    console.log("🔍 DETAILED USER REPORT:");
    console.log("========================================");
    
    for (const user of users) {
      const directCount = user.referralTree?.level1?.length || 0;
      
      console.log(`\n👤 User: ${user.userId}`);
      console.log(`   Direct Referrals: ${directCount}`);
      console.log(`   Current Legs:`, {
        leg2: user.legsUnlocked.leg2,
        leg3: user.legsUnlocked.leg3,
        leg4: user.legsUnlocked.leg4,
        leg5: user.legsUnlocked.leg5,
        leg6: user.legsUnlocked.leg6,
        leg7: user.legsUnlocked.leg7
      });
      
      // Check what should be unlocked
      const shouldBe = {
        leg2: directCount >= 1,
        leg3: directCount >= 2,
        leg4: directCount >= 3,
        leg5: directCount >= 4,
        leg6: directCount >= 5,
        leg7: directCount >= 6
      };
      
      console.log(`   Should Be:`, shouldBe);
      
      // Update statistics
      if (directCount >= 1) stats.leg2.total++;
      if (directCount >= 2) stats.leg3.total++;
      if (directCount >= 3) stats.leg4.total++;
      if (directCount >= 4) stats.leg5.total++;
      if (directCount >= 5) stats.leg6.total++;
      if (directCount >= 6) stats.leg7.total++;
      
      if (user.legsUnlocked.leg2) stats.leg2.unlocked++;
      if (user.legsUnlocked.leg3) stats.leg3.unlocked++;
      if (user.legsUnlocked.leg4) stats.leg4.unlocked++;
      if (user.legsUnlocked.leg5) stats.leg5.unlocked++;
      if (user.legsUnlocked.leg6) stats.leg6.unlocked++;
      if (user.legsUnlocked.leg7) stats.leg7.unlocked++;
      
      // Check for issues
      if (directCount >= 1 && !user.legsUnlocked.leg2) {
        stats.leg2.issues.push(user.userId);
      }
      if (directCount >= 2 && !user.legsUnlocked.leg3) {
        stats.leg3.issues.push(user.userId);
      }
      if (directCount >= 3 && !user.legsUnlocked.leg4) {
        stats.leg4.issues.push(user.userId);
      }
      if (directCount >= 4 && !user.legsUnlocked.leg5) {
        stats.leg5.issues.push(user.userId);
      }
      if (directCount >= 5 && !user.legsUnlocked.leg6) {
        stats.leg6.issues.push(user.userId);
      }
      if (directCount >= 6 && !user.legsUnlocked.leg7) {
        stats.leg7.issues.push(user.userId);
      }
    }
    
    console.log("\n\n📊 LEG UNLOCKING SUMMARY");
    console.log("========================================");
    console.log("Leg 2:");
    console.log(`   ✅ Unlocked: ${stats.leg2.unlocked}`);
    console.log(`   📊 Should be: ${stats.leg2.total}`);
    console.log(`   ❌ Issues: ${stats.leg2.issues.length}`);
    if (stats.leg2.issues.length > 0) {
      console.log(`      Users with issues: ${stats.leg2.issues.join(', ')}`);
    }
    
    console.log("\nLeg 3:");
    console.log(`   ✅ Unlocked: ${stats.leg3.unlocked}`);
    console.log(`   📊 Should be: ${stats.leg3.total}`);
    console.log(`   ❌ Issues: ${stats.leg3.issues.length}`);
    if (stats.leg3.issues.length > 0) {
      console.log(`      Users with issues: ${stats.leg3.issues.join(', ')}`);
    }
    
    console.log("\nLeg 4:");
    console.log(`   ✅ Unlocked: ${stats.leg4.unlocked}`);
    console.log(`   📊 Should be: ${stats.leg4.total}`);
    console.log(`   ❌ Issues: ${stats.leg4.issues.length}`);
    if (stats.leg4.issues.length > 0) {
      console.log(`      Users with issues: ${stats.leg4.issues.join(', ')}`);
    }
    
    console.log("\nLeg 5:");
    console.log(`   ✅ Unlocked: ${stats.leg5.unlocked}`);
    console.log(`   📊 Should be: ${stats.leg5.total}`);
    console.log(`   ❌ Issues: ${stats.leg5.issues.length}`);
    if (stats.leg5.issues.length > 0) {
      console.log(`      Users with issues: ${stats.leg5.issues.join(', ')}`);
    }
    
    console.log("\nLeg 6:");
    console.log(`   ✅ Unlocked: ${stats.leg6.unlocked}`);
    console.log(`   📊 Should be: ${stats.leg6.total}`);
    console.log(`   ❌ Issues: ${stats.leg6.issues.length}`);
    if (stats.leg6.issues.length > 0) {
      console.log(`      Users with issues: ${stats.leg6.issues.join(', ')}`);
    }
    
    console.log("\nLeg 7:");
    console.log(`   ✅ Unlocked: ${stats.leg7.unlocked}`);
    console.log(`   📊 Should be: ${stats.leg7.total}`);
    console.log(`   ❌ Issues: ${stats.leg7.issues.length}`);
    if (stats.leg7.issues.length > 0) {
      console.log(`      Users with issues: ${stats.leg7.issues.join(', ')}`);
    }
    
    console.log("\n========================================");
    
    // Overall status
    const totalIssues = stats.leg2.issues.length + stats.leg3.issues.length + 
                        stats.leg4.issues.length + stats.leg5.issues.length + 
                        stats.leg6.issues.length + stats.leg7.issues.length;
    
    if (totalIssues === 0) {
      console.log("\n✅ All legs are correctly unlocked based on direct referrals!");
    } else {
      console.log(`\n⚠️ Found ${totalIssues} leg unlocking issues that need fixing.`);
      console.log("Run fixLegUnlocking.js to fix these issues.");
    }
    
    mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error in verification:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};