// require('dotenv').config();
// const mongoose = require('mongoose');
// const Admin = require('./src/models/Admin');

// mongoose.connect(process.env.MONGO_URI)
//   .then(async () => {
//     console.log('MongoDB Connected');

//     const existingAdmin = await Admin.findOne({ adminId: 'ADMIN001' });

//     if (existingAdmin) {
//       console.log('✅ Admin already exists');
//       process.exit();
//     }

//     await Admin.create({
//       adminId: 'ADMIN001',
//       pin: '123456'
//     });

//     console.log('✅ Admin seeded successfully!');
//     console.log('Admin ID: ADMIN001');
//     console.log('PIN: 123456');
//     process.exit();

//   })
//   .catch(err => {
//     console.error('Error:', err);
//     process.exit(1);
//   });


require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // console.log('📦 MongoDB Connected Successfully');

    // 6-digit admin IDs
    const admins = [
      {
        adminId: '777777',
        pin: '123456',
        name: 'Admin',
        role: 'admin',
        permissions: ['all']
      },
      {
        adminId: '888888',
        pin: '123456',
        name: 'Finance Admin',
        role: 'admin',
        permissions: ['deposits', 'withdrawals']
      },
      {
        adminId: '999999',
        pin: '123456',
        name: 'Support Admin',
        role: 'admin',
        permissions: ['users', 'scanners']
      }
    ];

    let createdCount = 0;
    let existingCount = 0;

    // console.log('━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const adminData of admins) {
      const existing = await Admin.findOne({ adminId: adminData.adminId });
      
      if (!existing) {
        await Admin.create(adminData);
        // console.log(`✅ Created: ${adminData.adminId} - ${adminData.name}`);
        createdCount++;
      } else {
        // console.log(`⚠️  Already exists: ${adminData.adminId} - ${existing.name}`);
        existingCount++;
      }
    }

    // console.log('━━━━━━━━━━━━━━━━━━━━━━━');
    // console.log('✅ ADMIN SEEDING COMPLETE');
    // console.log('━━━━━━━━━━━━━━━━━━━━━━━');
    // console.log(`📊 Created: ${createdCount}`);
    // console.log(`📊 Existing: ${existingCount}`);
    // console.log('━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Show all admins
    const allAdmins = await Admin.find().select('-pin');
    // console.log('\n📋 All Admins:');
    allAdmins.forEach(admin => {
      // console.log(`   ${admin.adminId} - ${admin.name || 'Admin'} (${admin.role})`);
    });
    // console.log('━━━━━━━━━━━━━━━━━━━━━━━');
    // console.log('\n🌐 Login at: /auth');
    // console.log('━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    // console.error('❌ Error seeding admins:', error);
  } finally {
    await mongoose.disconnect();
    // console.log('📦 MongoDB Disconnected');
    process.exit(0);
  }
};

seedAdmins();