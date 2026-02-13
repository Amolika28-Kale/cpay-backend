require('dotenv').config();
const mongoose = require('mongoose');
const PaymentMethod = require('./src/models/PaymentMethod');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {

    await PaymentMethod.deleteMany();

    await PaymentMethod.insertMany([
      {
        method: 'UPI',
        details: {
          upiId: 'amolikakale234@okhdfcbank',
          name: 'cpay Exchange',
          phone: '+91-8625043745'
        }
      },
      {
        method: 'BANK',
        details: {
          accountName: 'cpay Exchange Ltd',
          accountNumber: '13058100003991',
          ifsc: 'BARB0VELAPU',
          bankName: 'HDFC Bank'
        }
      },
      {
        method: 'USDT-TRC20',
        details: {
          address: 'TGTmCXghBxNAkUxeL7hnDPjQiQicKG26v2',
          network: 'TRON (TRC20)'
        }
      },
      {
        method: 'USDT-BEP20',
        details: {
          address: '0xa91D8Ba3029FC14907cb4bEE60763869f0eD88f7',
          network: 'BSC (BEP20)'
        }
      }
    ]);

    console.log("Payment methods seeded successfully");
    process.exit();

  })
  .catch(err => console.log(err));
