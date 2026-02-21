require('dotenv').config();
const mongoose = require('mongoose');
const PaymentMethod = require('./src/models/PaymentMethod');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {

    await PaymentMethod.deleteMany();

    await PaymentMethod.insertMany([
      {
        method: 'USDT-BEP20',
        details: {
          address: '0x3a5aB6aB21B27133B92bAabA698Dbd27a5a86154',
          network: 'BSC (BEP20)'
        }
      }
    ]);

    console.log("✅ BEP20 payment method seeded successfully");
    process.exit();

  })
  .catch(err => console.log(err));