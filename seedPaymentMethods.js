require('dotenv').config();
const mongoose = require('mongoose');
const PaymentMethod = require('./src/models/PaymentMethod');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // Clear existing payment methods
    await PaymentMethod.deleteMany();

    // Insert both BEP20 and TRC20
    await PaymentMethod.insertMany([
      {
        method: 'USDT-BEP20',
        details: {
          address: '0xa91D8Ba3029FC14907cb4bEE60763869f0eD88f7',
          network: 'BSC (BEP20)'
        }
      },
      {
        method: 'USDT-TRC20',
        details: {
          address: 'TGTmCXghBxNAkUxeL7hnDPjQiQicKG26v2',
          network: 'TRON (TRC20)'
        }
      }
    ]);

    // console.log("✅ BEP20 and TRC20 payment methods seeded successfully");
    // console.log("📝 BEP20 Address:", '0xa91D8Ba3029FC14907cb4bEE60763869f0eD88f7');
    // console.log("📝 TRC20 Address:", 'TGTmCXghBxNAkUxeL7hnDPjQiQicKG26v2');
    
    process.exit();
  })
  .catch(err => {
    console.error("❌ Error seeding payment methods:", err);
    process.exit(1);
  });