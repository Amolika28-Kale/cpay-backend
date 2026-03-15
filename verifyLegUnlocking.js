// verifyLegUnlocking.js
const mongoose = require('mongoose');
require('dotenv').config();

// तुमच्या project structure प्रमाणे योग्य path द्या
const User = require('./src/models/User');

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
      leg1: { unlocked: 0, shouldBe: 0, total: 0, issues: [] },
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
        leg1: user.legsUnlocked.leg1,
        leg2: user.legsUnlocked.leg2,
        leg3: user.legsUnlocked.leg3,
        leg4: user.legsUnlocked.leg4,
        leg5: user.legsUnlocked.leg5,
        leg6: user.legsUnlocked.leg6,
        leg7: user.legsUnlocked.leg7
      });
      
      // CORRECTED REQUIREMENTS
      const shouldBe = {
        leg1: directCount >= 1,
        leg2: directCount >= 2,
        leg3: directCount >= 3,
        leg4: directCount >= 4,
        leg5: directCount >= 5,
        leg6: directCount >= 6,
        leg7: directCount >= 7
      };
      
      console.log(`   Should Be:`, shouldBe);
      
      // Update statistics
      if (directCount >= 1) stats.leg1.total++;
      if (directCount >= 2) stats.leg2.total++;
      if (directCount >= 3) stats.leg3.total++;
      if (directCount >= 4) stats.leg4.total++;
      if (directCount >= 5) stats.leg5.total++;
      if (directCount >= 6) stats.leg6.total++;
      if (directCount >= 7) stats.leg7.total++;
      
      if (user.legsUnlocked.leg1) stats.leg1.unlocked++;
      if (user.legsUnlocked.leg2) stats.leg2.unlocked++;
      if (user.legsUnlocked.leg3) stats.leg3.unlocked++;
      if (user.legsUnlocked.leg4) stats.leg4.unlocked++;
      if (user.legsUnlocked.leg5) stats.leg5.unlocked++;
      if (user.legsUnlocked.leg6) stats.leg6.unlocked++;
      if (user.legsUnlocked.leg7) stats.leg7.unlocked++;
      
      // Check for issues
      if (directCount >= 1 && !user.legsUnlocked.leg1) {
        stats.leg1.issues.push(user.userId);
      }
      if (directCount >= 2 && !user.legsUnlocked.leg2) {
        stats.leg2.issues.push(user.userId);
      }
      if (directCount >= 3 && !user.legsUnlocked.leg3) {
        stats.leg3.issues.push(user.userId);
      }
      if (directCount >= 4 && !user.legsUnlocked.leg4) {
        stats.leg4.issues.push(user.userId);
      }
      if (directCount >= 5 && !user.legsUnlocked.leg5) {
        stats.leg5.issues.push(user.userId);
      }
      if (directCount >= 6 && !user.legsUnlocked.leg6) {
        stats.leg6.issues.push(user.userId);
      }
      if (directCount >= 7 && !user.legsUnlocked.leg7) {
        stats.leg7.issues.push(user.userId);
      }
      
      // Also check for wrongly unlocked legs
      if (directCount < 1 && user.legsUnlocked.leg1) {
        stats.leg1.issues.push(`${user.userId} (wrongly unlocked)`);
      }
      if (directCount < 2 && user.legsUnlocked.leg2) {
        stats.leg2.issues.push(`${user.userId} (wrongly unlocked)`);
      }
      if (directCount < 3 && user.legsUnlocked.leg3) {
        stats.leg3.issues.push(`${user.userId} (wrongly unlocked)`);
      }
      if (directCount < 4 && user.legsUnlocked.leg4) {
        stats.leg4.issues.push(`${user.userId} (wrongly unlocked)`);
      }
      if (directCount < 5 && user.legsUnlocked.leg5) {
        stats.leg5.issues.push(`${user.userId} (wrongly unlocked)`);
      }
      if (directCount < 6 && user.legsUnlocked.leg6) {
        stats.leg6.issues.push(`${user.userId} (wrongly unlocked)`);
      }
      if (directCount < 7 && user.legsUnlocked.leg7) {
        stats.leg7.issues.push(`${user.userId} (wrongly unlocked)`);
      }
    }
    
    console.log("\n\n📊 LEG UNLOCKING SUMMARY");
    console.log("========================================");
    
    const legs = [
      { name: "Leg 1", levels: "1-3", required: 1 },
      { name: "Leg 2", levels: "4-6", required: 2 },
      { name: "Leg 3", levels: "7-9", required: 3 },
      { name: "Leg 4", levels: "10-12", required: 4 },
      { name: "Leg 5", levels: "13-15", required: 5 },
      { name: "Leg 6", levels: "16-18", required: 6 },
      { name: "Leg 7", levels: "19-21", required: 7 }
    ];
    
    legs.forEach((leg, index) => {
      const legKey = `leg${index + 1}`;
      console.log(`${leg.name} (Levels ${leg.levels}): Need ${leg.required} direct`);
      console.log(`   ✅ Unlocked: ${stats[legKey].unlocked}`);
      console.log(`   📊 Should be: ${stats[legKey].total}`);
      console.log(`   ❌ Issues: ${stats[legKey].issues.length}`);
      if (stats[legKey].issues.length > 0) {
        console.log(`      Users with issues: ${stats[legKey].issues.join(', ')}`);
      }
      console.log("");
    });
    
    console.log("========================================");
    
    // Overall status
    const totalIssues = stats.leg1.issues.length + stats.leg2.issues.length + 
                        stats.leg3.issues.length + stats.leg4.issues.length + 
                        stats.leg5.issues.length + stats.leg6.issues.length + 
                        stats.leg7.issues.length;
    
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