// const Deposit = require("../models/Deposit");
// const mongoose = require("mongoose");
// const Wallet = require("../models/Wallet");
// const Transaction = require("../models/Transaction");

// const TEST_MODE = true; // production madhe false kara

// exports.createDeposit = async (req, res) => {
//   try {
//     const { amount, txHash, paymentMethodId } = req.body;

//     if (!amount || !txHash || !paymentMethodId)
//       return res.status(400).json({ message: "All fields required" });

//     const deposit = await Deposit.create({
//       user: req.user.id,
//       paymentMethod: paymentMethodId,
//       amount: Number(amount),
//       txHash: txHash.trim(),
//       paymentScreenshot: req.file
//         ? `/uploads/${req.file.filename}`
//         : null
//     });

//     res.status(201).json(deposit);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// exports.approveDeposit = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const deposit = await Deposit.findById(req.params.id).session(session);

//     if (!deposit || deposit.status !== "pending")
//       throw new Error("Invalid deposit");

//     deposit.status = "approved";
//     await deposit.save({ session });

//     /* ===== USDT WALLET ===== */
//     let usdtWallet = await Wallet.findOne({
//       user: deposit.user,
//       type: "USDT"
//     }).session(session);

//     if (!usdtWallet) {
//       usdtWallet = await Wallet.create([{
//         user: deposit.user,
//         type: "USDT",
//         balance: 0
//       }], { session });
//       usdtWallet = usdtWallet[0];
//     }

//     usdtWallet.balance += deposit.amount;
//     await usdtWallet.save({ session });

//     // Create USDT deposit transaction
//     await Transaction.create([{
//       user: deposit.user,
//       type: "DEPOSIT", // Using existing DEPOSIT type
//       fromWallet: null,
//       toWallet: "USDT", // Add USDT to enum first
//       amount: deposit.amount,
//       meta: {
//         depositId: deposit._id,
//         txHash: deposit.txHash,
//         currency: "USDT"
//       }
//     }], { session });

//     /* ===== AUTO INR CONVERSION (TEST MODE) ===== */
//     if (TEST_MODE) {
//       const conversionRate = 95; // testing rate

//       let inrWallet = await Wallet.findOne({
//         user: deposit.user,
//         type: "INR"
//       }).session(session);

//       if (!inrWallet) {
//         inrWallet = await Wallet.create([{
//           user: deposit.user,
//           type: "INR",
//           balance: 0
//         }], { session });
//         inrWallet = inrWallet[0];
//       }

//       const inrAmount = deposit.amount * conversionRate;

//       inrWallet.balance += inrAmount;
//       await inrWallet.save({ session });

//       // Create INR credit transaction using CASHBACK type or add new type
//       await Transaction.create([{
//         user: deposit.user,
//         type: "CREDIT", // Using existing CREDIT type
//         fromWallet: "USDT", // Need to add USDT to enum
//         toWallet: "INR",
//         amount: inrAmount,
//         meta: { 
//           rate: conversionRate,
//           type: "CONVERSION",
//           originalAmount: deposit.amount,
//           originalCurrency: "USDT"
//         }
//       }], { session });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     res.json({ 
//       message: "Deposit approved & INR credited (TEST MODE)",
//       amount: deposit.amount,
//       inrAmount: TEST_MODE ? deposit.amount * 83 : null
//     });

//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Approve deposit error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


// exports.getAllDeposits = async (req, res) => {
//   try {
//     const deposits = await Deposit.find()
//       .populate("user", "name email")
//       .populate("paymentMethod")
//       .sort({ createdAt: -1 });

//     res.json(deposits);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };


// exports.rejectDeposit = async (req, res) => {
//   try {
//     const { reason } = req.body;

//     const deposit = await Deposit.findById(req.params.id);

//     if (!deposit)
//       return res.status(404).json({ message: "Deposit not found" });

//     if (deposit.status !== "pending")
//       return res.status(400).json({ message: "Already processed" });

//     deposit.status = "rejected";
//     deposit.rejectReason = reason || "Not specified";
//     await deposit.save();

//     res.json({ message: "Deposit rejected" });

//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };


// exports.getMyDeposits = async (req, res) => {
//   try {
//     const deposits = await Deposit.find({ user: req.user.id })
//       .sort({ createdAt: -1 });

//     res.json(deposits);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };


// const Deposit = require("../models/Deposit");
// const mongoose = require("mongoose");
// const Wallet = require("../models/Wallet");
// const Transaction = require("../models/Transaction");
// const User = require("../models/User"); // ✅ User import करा

// const TEST_MODE = true; // production madhe false kara
// const AUTO_APPROVE_DELAY = 2 * 60 * 1000; // Changed from 5 to 2 minutes

// // Auto-approve function with retry logic
// const autoApproveDeposit = async (depositId, retryCount = 0) => {
//   const maxRetries = 3;
//   const session = await mongoose.startSession();
  
//   try {
//     session.startTransaction({
//       readPreference: 'primary',
//       readConcern: { level: 'local' },
//       writeConcern: { w: 'majority' }
//     });

//     const deposit = await Deposit.findById(depositId).session(session);
    
//     if (!deposit || deposit.status !== "pending") {
//       await session.abortTransaction();
//       session.endSession();
//       return;
//     }

//     deposit.status = "approved";
//     await deposit.save({ session });

//     /* ===== USDT WALLET ===== */
//     let usdtWallet = await Wallet.findOne({
//       user: deposit.user,
//       type: "USDT"
//     }).session(session);

//     if (!usdtWallet) {
//       usdtWallet = await Wallet.create([{
//         user: deposit.user,
//         type: "USDT",
//         balance: 0
//       }], { session });
//       usdtWallet = usdtWallet[0];
//     }

//     usdtWallet.balance += deposit.amount;
//     await usdtWallet.save({ session });

//     // ✅ Check if this is first deposit
//     const user = await User.findById(deposit.user).session(session);
//     if (user && !user.firstDepositCompleted) {
//       user.firstDepositCompleted = true;
//       await user.save({ session });
//       console.log(`✅ First deposit completed for user: ${user.userId}`);
//     }

//     // Create USDT deposit transaction
//     await Transaction.create([{
//       user: deposit.user,
//       type: "DEPOSIT",
//       fromWallet: null,
//       toWallet: "USDT",
//       amount: deposit.amount,
//       meta: {
//         depositId: deposit._id,
//         txHash: deposit.txHash,
//         currency: "USDT",
//         autoApproved: true,
//         firstDeposit: !user?.firstDepositCompleted ? true : false
//       }
//     }], { session });

//     /* ===== AUTO INR CONVERSION (TEST MODE) ===== */
//     if (TEST_MODE) {
//       const conversionRate = 95;

//       let inrWallet = await Wallet.findOne({
//         user: deposit.user,
//         type: "INR"
//       }).session(session);

//       if (!inrWallet) {
//         inrWallet = await Wallet.create([{
//           user: deposit.user,
//           type: "INR",
//           balance: 0
//         }], { session });
//         inrWallet = inrWallet[0];
//       }

//       const inrAmount = deposit.amount * conversionRate;
//       inrWallet.balance += inrAmount;
//       await inrWallet.save({ session });

//       await Transaction.create([{
//         user: deposit.user,
//         type: "CREDIT",
//         fromWallet: "USDT",
//         toWallet: "INR",
//         amount: inrAmount,
//         meta: { 
//           rate: conversionRate,
//           type: "CONVERSION",
//           originalAmount: deposit.amount,
//           originalCurrency: "USDT",
//           autoApproved: true
//         }
//       }], { session });
//     }

//     await session.commitTransaction();
//     session.endSession();

//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
    
//     // Retry logic for write conflicts
//     if (err.code === 112 || err.codeName === 'WriteConflict') {
//       if (retryCount < maxRetries) {
//         // Exponential backoff
//         const delay = Math.pow(2, retryCount) * 100;
//         await new Promise(resolve => setTimeout(resolve, delay));
//         return autoApproveDeposit(depositId, retryCount + 1);
//       } else {
//         console.error(`❌ Max retries reached for deposit ${depositId}`);
//       }
//     } else {
//       console.error("❌ Auto-approve error:", err);
//     }
//   }
// };

// exports.createDeposit = async (req, res) => {
//   try {
//     const { amount, txHash, paymentMethodId } = req.body;

//     // ✅ Screenshot check add करा
//     if (!amount || !txHash || !paymentMethodId || !req.file) {
//       return res.status(400).json({ message: "All fields required including screenshot" });
//     }

//     const deposit = await Deposit.create({
//       user: req.user.id,
//       paymentMethod: paymentMethodId,
//       amount: Number(amount),
//       txHash: txHash.trim(),
//       paymentScreenshot: req.file
//         ? `/uploads/${req.file.filename}`
//         : null
//     });

//     // ⏰ Schedule auto-approval after 2 minutes
//     setTimeout(() => autoApproveDeposit(deposit._id), AUTO_APPROVE_DELAY);

//     res.status(201).json(deposit);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// const Deposit = require("../models/Deposit");
// const mongoose = require("mongoose");
// const Wallet = require("../models/Wallet");
// const Transaction = require("../models/Transaction");
// const User = require("../models/User");

// const TEST_MODE = true; // production madhe false kara
// const AUTO_APPROVE_DELAY = 2 * 60 * 1000; // 2 minutes

// // Auto-approve function with retry logic - FIXED for first deposit activation
// const autoApproveDeposit = async (depositId, retryCount = 0) => {
//   const maxRetries = 3;
//   const session = await mongoose.startSession();
  
//   try {
//     session.startTransaction({
//       readPreference: 'primary',
//       readConcern: { level: 'local' },
//       writeConcern: { w: 'majority' }
//     });

//     const deposit = await Deposit.findById(depositId).session(session);
    
//     if (!deposit || deposit.status !== "pending") {
//       await session.abortTransaction();
//       session.endSession();
//       return;
//     }

//     deposit.status = "approved";
//     await deposit.save({ session });

//     /* ===== USDT WALLET ===== */
//     let usdtWallet = await Wallet.findOne({
//       user: deposit.user,
//       type: "USDT"
//     }).session(session);

//     if (!usdtWallet) {
//       usdtWallet = await Wallet.create([{
//         user: deposit.user,
//         type: "USDT",
//         balance: 0
//       }], { session });
//       usdtWallet = usdtWallet[0];
//     }

//     usdtWallet.balance += deposit.amount;
//     await usdtWallet.save({ session });

//     // ✅ Get user
//     const user = await User.findById(deposit.user).session(session);
    
//     // ✅ Check if this is first deposit EVER
//     const isFirstDepositEver = user && !user.firstDepositCompleted;
    
//     if (user && !user.firstDepositCompleted) {
//       user.firstDepositCompleted = true;
//       console.log(`✅ First deposit completed for user: ${user.userId}`);
//     }

//     // Create USDT deposit transaction
//     await Transaction.create([{
//       user: deposit.user,
//       type: "DEPOSIT",
//       fromWallet: null,
//       toWallet: "USDT",
//       amount: deposit.amount,
//       meta: {
//         depositId: deposit._id,
//         txHash: deposit.txHash,
//         currency: "USDT",
//         autoApproved: true,
//         firstDeposit: isFirstDepositEver
//       }
//     }], { session });

//     /* ===== AUTO INR CONVERSION (TEST MODE) ===== */
//     let inrAmount = 0;
//     const conversionRate = 95;
    
//     if (TEST_MODE) {
//       let inrWallet = await Wallet.findOne({
//         user: deposit.user,
//         type: "INR"
//       }).session(session);

//       if (!inrWallet) {
//         inrWallet = await Wallet.create([{
//           user: deposit.user,
//           type: "INR",
//           balance: 0
//         }], { session });
//         inrWallet = inrWallet[0];
//       }

//       inrAmount = deposit.amount * conversionRate;
//       inrWallet.balance += inrAmount;
//       await inrWallet.save({ session });

//       await Transaction.create([{
//         user: deposit.user,
//         type: "CREDIT",
//         fromWallet: "USDT",
//         toWallet: "INR",
//         amount: inrAmount,
//         meta: { 
//           rate: conversionRate,
//           type: "CONVERSION",
//           originalAmount: deposit.amount,
//           originalCurrency: "USDT",
//           autoApproved: true
//         }
//       }], { session });
//     }

//     // ✅ FIXED: AUTOMATIC WALLET ACTIVATION for first deposit
//     // First deposit असल्यास लगेच wallet activate करा
//     if (isFirstDepositEver) {
      
//       // Calculate daily limit (INR amount from this deposit)
//       const dailyLimit = inrAmount; // deposit.amount * 95
      
//       // Calculate expiry date (7 days from now)
//       const expiryDate = new Date();
//       expiryDate.setDate(expiryDate.getDate() + 7);
      
//       // Update user activation
//       user.walletActivated = true;
//       user.activationDate = new Date();
//       user.activationExpiryDate = expiryDate;
//       user.dailyAcceptLimit = dailyLimit;
//       user.sevenDayTotalAccepted = 0;
//       user.sevenDayResetDate = expiryDate;
//       user.todayAcceptedCount = 0;
      
//       // Add to activation history
//       if (!user.activationHistory) {
//         user.activationHistory = [];
//       }
//       user.activationHistory.push({
//         date: new Date(),
//         limit: dailyLimit,
//         amount: deposit.amount,
//         expiryDate: expiryDate,
//         status: 'ACTIVE'
//       });
      
//       await user.save({ session });

//       // Create wallet activation transaction
//       await Transaction.create([{
//         user: deposit.user,
//         type: "WALLET_ACTIVATION",
//         fromWallet: "USDT",
//         toWallet: "INR",
//         amount: deposit.amount,
//         meta: {
//           usdtAmount: deposit.amount,
//           inrAmount: inrAmount,
//           dailyLimit: dailyLimit,
//           type: "FIRST_ACTIVATION",
//           activationDate: new Date(),
//           validUntil: expiryDate
//         }
//       }], { session });

//       console.log(`✅ Wallet auto-activated for FIRST DEPOSIT! User: ${user.userId} with daily limit: ₹${dailyLimit}`);
//     }
//     // जर first deposit नसेल पण आधीच active असेल तर daily limit update करा
//     else if (user.walletActivated) {
//       // Optionally update daily limit if needed
//       console.log(`✅ User ${user.userId} already has activated wallet`);
//     }

//     await session.commitTransaction();
//     session.endSession();

//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
    
//     // Retry logic for write conflicts
//     if (err.code === 112 || err.codeName === 'WriteConflict') {
//       if (retryCount < maxRetries) {
//         const delay = Math.pow(2, retryCount) * 100;
//         await new Promise(resolve => setTimeout(resolve, delay));
//         return autoApproveDeposit(depositId, retryCount + 1);
//       } else {
//         console.error(`❌ Max retries reached for deposit ${depositId}`);
//       }
//     } else {
//       console.error("❌ Auto-approve error:", err);
//     }
//   }
// };

// exports.createDeposit = async (req, res) => {
//   try {
//     const { amount, txHash, paymentMethodId } = req.body;

//     // ✅ Screenshot check add करा
//     if (!amount || !txHash || !paymentMethodId || !req.file) {
//       return res.status(400).json({ message: "All fields required including screenshot" });
//     }

//     const deposit = await Deposit.create({
//       user: req.user.id,
//       paymentMethod: paymentMethodId,
//       amount: Number(amount),
//       txHash: txHash.trim(),
//       paymentScreenshot: req.file
//         ? `/uploads/${req.file.filename}`
//         : null
//     });

//     // ⏰ Schedule auto-approval after 2 minutes
//     setTimeout(() => autoApproveDeposit(deposit._id), AUTO_APPROVE_DELAY);

//     res.status(201).json(deposit);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// exports.approveDeposit = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const deposit = await Deposit.findById(req.params.id).session(session);

//     if (!deposit || deposit.status !== "pending")
//       throw new Error("Invalid deposit");

//     deposit.status = "approved";
//     await deposit.save({ session });

//     /* ===== USDT WALLET ===== */
//     let usdtWallet = await Wallet.findOne({
//       user: deposit.user,
//       type: "USDT"
//     }).session(session);

//     if (!usdtWallet) {
//       usdtWallet = await Wallet.create([{
//         user: deposit.user,
//         type: "USDT",
//         balance: 0
//       }], { session });
//       usdtWallet = usdtWallet[0];
//     }

//     usdtWallet.balance += deposit.amount;
//     await usdtWallet.save({ session });

//     await Transaction.create([{
//       user: deposit.user,
//       type: "DEPOSIT",
//       fromWallet: null,
//       toWallet: "USDT",
//       amount: deposit.amount,
//       meta: {
//         depositId: deposit._id,
//         txHash: deposit.txHash,
//         currency: "USDT"
//       }
//     }], { session });

//     if (TEST_MODE) {
//       const conversionRate = 95;

//       let inrWallet = await Wallet.findOne({
//         user: deposit.user,
//         type: "INR"
//       }).session(session);

//       if (!inrWallet) {
//         inrWallet = await Wallet.create([{
//           user: deposit.user,
//           type: "INR",
//           balance: 0
//         }], { session });
//         inrWallet = inrWallet[0];
//       }

//       const inrAmount = deposit.amount * conversionRate;
//       inrWallet.balance += inrAmount;
//       await inrWallet.save({ session });

//       await Transaction.create([{
//         user: deposit.user,
//         type: "CREDIT",
//         fromWallet: "USDT",
//         toWallet: "INR",
//         amount: inrAmount,
//         meta: { 
//           rate: conversionRate,
//           type: "CONVERSION",
//           originalAmount: deposit.amount,
//           originalCurrency: "USDT"
//         }
//       }], { session });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     res.json({ 
//       message: "Deposit approved & INR credited",
//       amount: deposit.amount,
//       inrAmount: TEST_MODE ? deposit.amount * conversionRate : null
//     });

//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Approve deposit error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.getAllDeposits = async (req, res) => {
//   try {
//     const deposits = await Deposit.find()
//       .populate("user", "name email")
//       .populate("paymentMethod")
//       .sort({ createdAt: -1 });

//     res.json(deposits);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.rejectDeposit = async (req, res) => {
//   try {
//     const { reason } = req.body;
//     const deposit = await Deposit.findById(req.params.id);

//     if (!deposit)
//       return res.status(404).json({ message: "Deposit not found" });

//     if (deposit.status !== "pending")
//       return res.status(400).json({ message: "Already processed" });

//     deposit.status = "rejected";
//     deposit.rejectReason = reason || "Not specified";
//     await deposit.save();

//     res.json({ message: "Deposit rejected" });

//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.getMyDeposits = async (req, res) => {
//   try {
//     const deposits = await Deposit.find({ user: req.user.id })
//       .sort({ createdAt: -1 });

//     res.json(deposits);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };


const Deposit = require("../models/Deposit");
const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const AUTO_APPROVE_DELAY = 2 * 60 * 1000; // 2 minutes

// Auto-approve function - FIXED for no duplicates and proper activation
const autoApproveDeposit = async (depositId, retryCount = 0) => {
  const maxRetries = 3;
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const deposit = await Deposit.findById(depositId).session(session);
    
    if (!deposit || deposit.status !== "pending") {
      await session.abortTransaction();
      session.endSession();
      return;
    }

    deposit.status = "approved";
    await deposit.save({ session });

    // ✅ Get user
    const user = await User.findById(deposit.user).session(session);
    if (!user) {
      throw new Error("User not found");
    }
    
    // ✅ Check if this is first deposit EVER
    const isFirstDepositEver = !user.firstDepositCompleted;
    
    if (!user.firstDepositCompleted) {
      user.firstDepositCompleted = true;
      console.log(`✅ First deposit completed for user: ${user.userId}`);
    }

    /* ===== USDT WALLET ===== */
    let usdtWallet = await Wallet.findOne({
      user: deposit.user,
      type: "USDT"
    }).session(session);

    if (!usdtWallet) {
      usdtWallet = new Wallet({
        user: deposit.user,
        type: "USDT",
        balance: 0
      });
    }

    usdtWallet.balance += deposit.amount;
    await usdtWallet.save({ session });

    /* ===== INR CONVERSION ===== */
    const conversionRate = 95;
    const inrAmount = deposit.amount * conversionRate;

    let inrWallet = await Wallet.findOne({
      user: deposit.user,
      type: "INR"
    }).session(session);

    if (!inrWallet) {
      inrWallet = new Wallet({
        user: deposit.user,
        type: "INR",
        balance: 0
      });
    }

    inrWallet.balance += inrAmount;
    await inrWallet.save({ session });

    // ✅ Prepare transactions array - NO DUPLICATES
    const transactions = [
      // 1. USDT Deposit
      {
        user: deposit.user,
        type: "DEPOSIT",
        fromWallet: null,
        toWallet: "USDT",
        amount: deposit.amount,
        meta: {
          depositId: deposit._id,
          txHash: deposit.txHash,
          currency: "USDT",
          autoApproved: true
        }
      },
      // 2. INR Credit (from conversion)
      {
        user: deposit.user,
        type: "CREDIT",
        fromWallet: "USDT",
        toWallet: "INR",
        amount: inrAmount,
        meta: {
          rate: conversionRate,
          type: "CONVERSION",
          originalAmount: deposit.amount,
          originalCurrency: "USDT"
        }
      }
    ];

    /* ===== WALLET ACTIVATION LOGIC ===== */
    const now = new Date();
    let activationMessage = "";

    // Check if wallet is already active and not expired
    const isWalletActive = user.walletActivated && 
                          user.activationExpiryDate && 
                          user.activationExpiryDate > now;

    // CASE 1: FIRST DEPOSIT EVER
    if (isFirstDepositEver) {
      // Activate for 7 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      
      user.walletActivated = true;
      user.activationDate = now;
      user.activationExpiryDate = expiryDate;
      user.dailyAcceptLimit = inrAmount; // Set limit = this deposit amount
      user.sevenDayTotalAccepted = 0;
      user.sevenDayResetDate = expiryDate;
      user.todayAcceptedCount = 0;
      
      // Add to activation history
      if (!user.activationHistory) {
        user.activationHistory = [];
      }
      user.activationHistory.push({
        date: now,
        limit: inrAmount,
        amount: deposit.amount,
        expiryDate: expiryDate,
        status: 'ACTIVE'
      });
      
      transactions.push({
        user: deposit.user,
        type: "WALLET_ACTIVATION",
        fromWallet: "USDT",
        toWallet: "INR",
        amount: deposit.amount,
        meta: {
          type: "FIRST_ACTIVATION",
          dailyLimit: inrAmount,
          validUntil: expiryDate,
          action: "New wallet activated for 7 days"
        }
      });
      
      activationMessage = `FIRST DEPOSIT: Wallet activated until ${expiryDate.toLocaleDateString()} with limit ₹${inrAmount}`;
      console.log(`✅ ${activationMessage}`);
    }
    
    // CASE 2: WALLET ALREADY ACTIVE (Not expired)
    else if (isWalletActive) {
      const daysRemaining = Math.ceil((user.activationExpiryDate - now) / (1000 * 60 * 60 * 24));
      const oldLimit = user.dailyAcceptLimit;
      const newLimit = oldLimit + inrAmount; // Add to existing limit
      
      // Extend expiry by 7 more days from now
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 7);
      
      // Update user
      user.dailyAcceptLimit = newLimit;
      user.activationDate = now; // Reset activation date
      user.activationExpiryDate = newExpiryDate; // Extend to 7 more days
      user.sevenDayResetDate = newExpiryDate;
      
      // Add to history
      if (!user.activationHistory) user.activationHistory = [];
      user.activationHistory.push({
        date: now,
        limit: newLimit,
        amount: deposit.amount,
        expiryDate: newExpiryDate,
        status: 'ACTIVE',
        note: `Extended activation - Previous limit: ₹${oldLimit} + ₹${inrAmount}`
      });
      
      transactions.push({
        user: deposit.user,
        type: "WALLET_ACTIVATION",
        fromWallet: "USDT",
        toWallet: "INR",
        amount: deposit.amount,
        meta: {
          type: "EXTENDED_ACTIVATION",
          previousLimit: oldLimit,
          newLimit: newLimit,
          previousExpiry: user.activationExpiryDate,
          newExpiry: newExpiryDate,
          daysRemaining: daysRemaining,
          action: "Wallet extended for 7 more days with increased limit"
        }
      });
      
      activationMessage = `EXTENDED ACTIVATION: +7 days, Limit: ₹${oldLimit} → ₹${newLimit}`;
      console.log(`✅ ${activationMessage}`);
    }
    
    // CASE 3: WALLET EXPIRED (Needs re-activation)
    else {
      // Reactivate for 7 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      
      user.walletActivated = true;
      user.activationDate = now;
      user.activationExpiryDate = expiryDate;
      user.dailyAcceptLimit = inrAmount; // Set new limit
      user.sevenDayTotalAccepted = 0;
      user.sevenDayResetDate = expiryDate;
      user.todayAcceptedCount = 0;
      
      // Add to activation history
      if (!user.activationHistory) user.activationHistory = [];
      user.activationHistory.push({
        date: now,
        limit: inrAmount,
        amount: deposit.amount,
        expiryDate: expiryDate,
        status: 'ACTIVE'
      });
      
      transactions.push({
        user: deposit.user,
        type: "WALLET_ACTIVATION",
        fromWallet: "USDT",
        toWallet: "INR",
        amount: deposit.amount,
        meta: {
          type: "REACTIVATION",
          dailyLimit: inrAmount,
          validUntil: expiryDate,
          action: "Wallet re-activated for 7 days after expiry"
        }
      });
      
      activationMessage = `REACTIVATED: Wallet expired, new activation until ${expiryDate.toLocaleDateString()} with limit ₹${inrAmount}`;
      console.log(`✅ ${activationMessage}`);
    }

    // ✅ Save user
    await user.save({ session });

    // ✅ Create ALL transactions in ONE array
    await Transaction.insertMany(transactions, { session });

    await session.commitTransaction();
    session.endSession();

    console.log(`✅ Deposit ${depositId} processed successfully for user ${user.userId}`);
    console.log(`   USDT: ${deposit.amount} → INR: ₹${inrAmount}`);

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    
    if (err.code === 112 || err.codeName === 'WriteConflict') {
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        return autoApproveDeposit(depositId, retryCount + 1);
      } else {
        console.error(`❌ Max retries reached for deposit ${depositId}`);
      }
    } else {
      console.error("❌ Auto-approve error:", err);
    }
  }
};

exports.createDeposit = async (req, res) => {
  try {
    const { amount, txHash, paymentMethodId } = req.body;

    if (!amount || !txHash || !paymentMethodId || !req.file) {
      return res.status(400).json({ message: "All fields required including screenshot" });
    }

    const deposit = await Deposit.create({
      user: req.user.id,
      paymentMethod: paymentMethodId,
      amount: Number(amount),
      txHash: txHash.trim(),
      paymentScreenshot: req.file
        ? `/uploads/${req.file.filename}`
        : null
    });

    // Schedule auto-approval after 2 minutes
    setTimeout(() => autoApproveDeposit(deposit._id), AUTO_APPROVE_DELAY);

    res.status(201).json(deposit);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveDeposit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deposit = await Deposit.findById(req.params.id).session(session);

    if (!deposit || deposit.status !== "pending")
      throw new Error("Invalid deposit");

    deposit.status = "approved";
    await deposit.save({ session });

    /* ===== USDT WALLET ===== */
    let usdtWallet = await Wallet.findOne({
      user: deposit.user,
      type: "USDT"
    }).session(session);

    if (!usdtWallet) {
      usdtWallet = new Wallet({
        user: deposit.user,
        type: "USDT",
        balance: 0
      });
    }

    usdtWallet.balance += deposit.amount;
    await usdtWallet.save({ session });

    const conversionRate = 95;
    const inrAmount = deposit.amount * conversionRate;

    let inrWallet = await Wallet.findOne({
      user: deposit.user,
      type: "INR"
    }).session(session);

    if (!inrWallet) {
      inrWallet = new Wallet({
        user: deposit.user,
        type: "INR",
        balance: 0
      });
    }

    inrWallet.balance += inrAmount;
    await inrWallet.save({ session });

    const transactions = [
      {
        user: deposit.user,
        type: "DEPOSIT",
        fromWallet: null,
        toWallet: "USDT",
        amount: deposit.amount,
        meta: { depositId: deposit._id, txHash: deposit.txHash, currency: "USDT" }
      },
      {
        user: deposit.user,
        type: "CREDIT",
        fromWallet: "USDT",
        toWallet: "INR",
        amount: inrAmount,
        meta: { rate: conversionRate, type: "CONVERSION", originalAmount: deposit.amount }
      }
    ];

    await Transaction.insertMany(transactions, { session });
    await session.commitTransaction();
    session.endSession();

    res.json({ 
      message: "Deposit approved",
      amount: deposit.amount,
      inrAmount: inrAmount
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Approve deposit error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .populate("user", "name email")
      .populate("paymentMethod")
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.rejectDeposit = async (req, res) => {
  try {
    const { reason } = req.body;
    const deposit = await Deposit.findById(req.params.id);

    if (!deposit)
      return res.status(404).json({ message: "Deposit not found" });

    if (deposit.status !== "pending")
      return res.status(400).json({ message: "Already processed" });

    deposit.status = "rejected";
    deposit.rejectReason = reason || "Not specified";
    await deposit.save();

    res.json({ message: "Deposit rejected" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};