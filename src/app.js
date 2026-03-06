

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();
// const userRoutes = require('./routes/user.routes');
// const adminRoutes = require('./routes/admin.routes');
// const depositRoutes = require('./routes/deposit.routes');
// const withdrawRoutes = require("./routes/withdraw.routes");
// const scannerRoutes = require('./routes/scanner.routes');
// const walletRoutes = require('./routes/wallet.routes');
// const conversionRoutes = require("./routes/conversion.routes");
// const transactionRoutes = require("./routes/transaction.routes");
// const paymentMethodRoutes = require('./routes/payment.routes');
// const app = express();

// app.use(cors({
//   origin: ["http://localhost:5173","http://localhost:5174","http://localhost:5175", "https://crypto-cpay.netlify.app"],
//   credentials: true
// }));
// app.use(express.json());

// // MongoDB connection options
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   retryWrites: true, // यामुळे write conflicts कमी होतात
//   w: 'majority' // यामुळे transactions consistent राहतात
// }) .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log(err));

//   app.get("/", (req, res) => {
//   res.send("Backend Working 🚀");
// });

// app.use("/uploads", express.static("uploads"));
// app.use('/api/auth', userRoutes);
// app.use('/api/admin', adminRoutes);

// app.use('/api/payment-methods', paymentMethodRoutes);
// app.use('/api/deposit', depositRoutes);
// app.use("/api/withdraw", withdrawRoutes);
// app.use('/api/scanner', scannerRoutes);
// app.use('/api/wallet', walletRoutes);
// app.use("/api/conversion", conversionRoutes);
// app.use("/api/transactions", transactionRoutes);



// module.exports = app;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const depositRoutes = require('./routes/deposit.routes');
const withdrawRoutes = require("./routes/withdraw.routes");
const scannerRoutes = require('./routes/scanner.routes');
const walletRoutes = require('./routes/wallet.routes');
const conversionRoutes = require("./routes/conversion.routes");
const transactionRoutes = require("./routes/transaction.routes");
const paymentMethodRoutes = require('./routes/payment.routes');
const AutoRequestService = require('../services/autoRequestService');

// ✅ Import AutoRequestService

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "https://crypto-cpay.netlify.app"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ✅ MongoDB connection - SINGLE CONNECTION
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  
  // ✅ Start Auto Request Service after database connection
  AutoRequestService.startScheduledJobs();
  console.log('✅ Auto Request Scheduler Started');
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Routes
app.get("/", (req, res) => {
  res.send("Backend Working 🚀");
});

app.use('/api/auth', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/deposit', depositRoutes);
app.use("/api/withdraw", withdrawRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/wallet', walletRoutes);
app.use("/api/conversion", conversionRoutes);
app.use("/api/transactions", transactionRoutes);

module.exports = app;