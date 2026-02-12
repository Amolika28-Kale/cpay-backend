require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./src/models/Admin');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const hashed = await bcrypt.hash('admin123', 10);

    await Admin.create({
      email: 'admin@cpay.com',
      password: hashed,
      role: 'admin'
    });

    console.log('Admin seeded successfully');
    process.exit();
  })
  .catch(err => console.log(err));
