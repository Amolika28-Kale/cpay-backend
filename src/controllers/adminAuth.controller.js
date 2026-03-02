// const Admin = require('../models/Admin');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const Rate = require('../models/Rate');

// // ================= ADMIN LOGIN =================
// exports.login = async (req, res) => {
//   try {
//     let { adminId, pin } = req.body;

//     console.log("Admin login attempt:", { adminId, pin });

//     if (!adminId || !pin) {
//       return res.status(400).json({ message: "Admin ID and PIN are required" });
//     }

//     adminId = adminId.trim().toUpperCase();

//     const admin = await Admin.findOne({ adminId });
//     if (!admin) {
//       return res.status(404).json({ message: "Admin ID not found" });
//     }

//     const match = await bcrypt.compare(pin, admin.pin);
//     if (!match) {
//       return res.status(400).json({ message: "Invalid PIN" });
//     }

//     const token = jwt.sign(
//       { id: admin._id, role: admin.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({
//       token,
//       user: {
//         _id: admin._id,
//         adminId: admin.adminId,
//         role: admin.role
//       }
//     });

//   } catch (err) {
//     console.error("Admin login error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // ================= SET CONVERSION RATE =================
// exports.setConversionRate = async (req, res) => {
//   try {
//     const { usdtToInr } = req.body;

//     if (!usdtToInr || usdtToInr <= 0)
//       return res.status(400).json({ message: "Invalid rate" });

//     // deactivate old
//     await Rate.updateMany({}, { isActive: false });

//     const rate = await Rate.create({
//       usdtToInr,
//       isActive: true
//     });

//     res.json({
//       message: "Conversion rate updated successfully",
//       rate
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ================= SEED ADMIN =================
// exports.seedAdmin = async () => {
//   try {
//     const existingAdmin = await Admin.findOne({ adminId: 'ADMIN001' });
    
//     if (!existingAdmin) {
//       await Admin.create({
//         adminId: 'ADMIN001',
//         pin: '123456'
//       });
//       console.log('✅ Admin seeded: ADMIN001 / 123456');
//     } else {
//       console.log('Admin already exists');
//     }
//   } catch (err) {
//     console.error('Error seeding admin:', err);
//   }
// };


const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Rate = require('../models/Rate');

// ================= ADMIN LOGIN =================
exports.login = async (req, res) => {
  try {
    let { adminId, pin } = req.body;

    console.log("👤 Admin login attempt:", { adminId });

    if (!adminId || !pin) {
      return res.status(400).json({ 
        success: false,
        message: "Admin ID and PIN are required" 
      });
    }

    // 6-digit validation
    if (!/^\d{6}$/.test(adminId)) {
      return res.status(400).json({ 
        success: false,
        message: "Admin ID must be 6 digits" 
      });
    }

    const admin = await Admin.findOne({ adminId });
    
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: "Invalid admin credentials" 
      });
    }

    const match = await bcrypt.compare(pin, admin.pin);
    
    if (!match) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid admin credentials" 
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { 
        id: admin._id, 
        adminId: admin.adminId,
        role: admin.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: admin._id,
          userId: admin.adminId, // 6-digit format
          role: admin.role,
          name: admin.name
        }
      }
    });

  } catch (err) {
    console.error("❌ Admin login error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// ================= CREATE NEW ADMIN =================
exports.createAdmin = async (req, res) => {
  try {
    const { adminId, pin, name, email, role, permissions } = req.body;

    // 6-digit validation
    if (!/^\d{6}$/.test(adminId)) {
      return res.status(400).json({ 
        success: false,
        message: "Admin ID must be exactly 6 digits" 
      });
    }

    if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
      return res.status(400).json({ 
        success: false,
        message: "PIN must be 6 digits" 
      });
    }

    const existingAdmin = await Admin.findOne({ adminId });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false,
        message: "Admin ID already exists" 
      });
    }

    const admin = await Admin.create({
      adminId,
      pin,
      name: name || 'Admin',
      email,
      role: role || 'admin',
      permissions: permissions || ['all']
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        adminId: admin.adminId,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (err) {
    console.error("❌ Create admin error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// ================= SET CONVERSION RATE =================
exports.setConversionRate = async (req, res) => {
  try {
    const { usdtToInr } = req.body;

    if (!usdtToInr || usdtToInr <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid rate" 
      });
    }

    // deactivate old
    await Rate.updateMany({}, { isActive: false });

    const rate = await Rate.create({
      usdtToInr,
      isActive: true
    });

    res.json({
      success: true,
      message: "Conversion rate updated successfully",
      data: rate
    });

  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// ================= GET ALL ADMINS =================
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select('-pin')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: admins
    });

  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// ================= DELETE ADMIN =================
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }

    const admin = await Admin.findByIdAndDelete(id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    res.json({
      success: true,
      message: "Admin deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// ================= SEED ADMIN =================
exports.seedAdmin = async () => {
  try {
    // Check for existing 6-digit admin IDs
    const existingAdmin = await Admin.findOne({ 
      $or: [
        { adminId: '777777' },
        { adminId: '888888' },
        { adminId: '999999' }
      ]
    });
    
    if (!existingAdmin) {
      // Create main admin
      await Admin.create({
        adminId: '777777',
        pin: '123456',
        name: 'Admin',
        role: 'admin',
        permissions: ['all']
      });

      // Create finance admin
      await Admin.create({
        adminId: '888888',
        pin: '123456',
        name: 'Finance Admin',
        role: 'admin',
        permissions: ['deposits', 'withdrawals']
      });

      // Create support admin
      await Admin.create({
        adminId: '999999',
        pin: '123456',
        name: 'Support Admin',
        role: 'admin',
        permissions: ['users', 'scanners']
      });

      console.log('━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ ADMINS SEEDED SUCCESSFULLY!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Admin ID: 777777 | PIN: 123456 | Role: Admin');
      console.log('📋 Admin ID: 888888 | PIN: 123456 | Role: Finance Admin');
      console.log('📋 Admin ID: 999999 | PIN: 123456 | Role: Support Admin');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('✅ Admins already exist');
      
      // Show existing admins
      const admins = await Admin.find().select('-pin');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Existing Admins:');
      admins.forEach(admin => {
        console.log(`   ${admin.adminId} - ${admin.name || 'Admin'} (${admin.role})`);
      });
      console.log('━━━━━━━━━━━━━━━━━━━━━━━');
    }
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
  }
};