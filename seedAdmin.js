require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {

    const existingAdmin = await User.findOne({ email: 'admin@cpay.com' });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit();
    }

    await User.create({
      name: 'Admin',
      email: 'admin@cpay.com',
      password: 'admin123',   // ❗ plain password
      role: 'admin'
    });

    console.log('Admin seeded successfully');
    process.exit();

  })
  .catch(err => console.log(err));
