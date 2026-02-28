require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');

    const existingAdmin = await Admin.findOne({ adminId: 'ADMIN001' });

    if (existingAdmin) {
      console.log('✅ Admin already exists');
      process.exit();
    }

    await Admin.create({
      adminId: 'ADMIN001',
      pin: '123456'
    });

    console.log('✅ Admin seeded successfully!');
    console.log('Admin ID: ADMIN001');
    console.log('PIN: 123456');
    process.exit();

  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });