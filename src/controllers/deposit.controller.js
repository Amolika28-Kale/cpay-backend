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


const Deposit = require("../models/Deposit");
const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

const TEST_MODE = true; // production madhe false kara
const AUTO_APPROVE_DELAY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Auto-approve function
const autoApproveDeposit = async (depositId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deposit = await Deposit.findById(depositId).session(session);
    
    if (!deposit || deposit.status !== "pending") {
      console.log(`Deposit ${depositId} already processed or not found`);
      return;
    }

    deposit.status = "approved";
    await deposit.save({ session });

    /* ===== USDT WALLET ===== */
    let usdtWallet = await Wallet.findOne({
      user: deposit.user,
      type: "USDT"
    }).session(session);

    if (!usdtWallet) {
      usdtWallet = await Wallet.create([{
        user: deposit.user,
        type: "USDT",
        balance: 0
      }], { session });
      usdtWallet = usdtWallet[0];
    }

    usdtWallet.balance += deposit.amount;
    await usdtWallet.save({ session });

    // Create USDT deposit transaction
    await Transaction.create([{
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
    }], { session });

    /* ===== AUTO INR CONVERSION (TEST MODE) ===== */
    if (TEST_MODE) {
      const conversionRate = 95;

      let inrWallet = await Wallet.findOne({
        user: deposit.user,
        type: "INR"
      }).session(session);

      if (!inrWallet) {
        inrWallet = await Wallet.create([{
          user: deposit.user,
          type: "INR",
          balance: 0
        }], { session });
        inrWallet = inrWallet[0];
      }

      const inrAmount = deposit.amount * conversionRate;
      inrWallet.balance += inrAmount;
      await inrWallet.save({ session });

      await Transaction.create([{
        user: deposit.user,
        type: "CREDIT",
        fromWallet: "USDT",
        toWallet: "INR",
        amount: inrAmount,
        meta: { 
          rate: conversionRate,
          type: "CONVERSION",
          originalAmount: deposit.amount,
          originalCurrency: "USDT",
          autoApproved: true
        }
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();
    
    console.log(`✅ Deposit ${depositId} auto-approved successfully`);

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Auto-approve error:", err);
  }
};

exports.createDeposit = async (req, res) => {
  try {
    const { amount, txHash, paymentMethodId } = req.body;

    if (!amount || !txHash || !paymentMethodId)
      return res.status(400).json({ message: "All fields required" });

    const deposit = await Deposit.create({
      user: req.user.id,
      paymentMethod: paymentMethodId,
      amount: Number(amount),
      txHash: txHash.trim(),
      paymentScreenshot: req.file
        ? `/uploads/${req.file.filename}`
        : null
    });

    // ⏰ Schedule auto-approval after 5 minutes
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
      usdtWallet = await Wallet.create([{
        user: deposit.user,
        type: "USDT",
        balance: 0
      }], { session });
      usdtWallet = usdtWallet[0];
    }

    usdtWallet.balance += deposit.amount;
    await usdtWallet.save({ session });

    await Transaction.create([{
      user: deposit.user,
      type: "DEPOSIT",
      fromWallet: null,
      toWallet: "USDT",
      amount: deposit.amount,
      meta: {
        depositId: deposit._id,
        txHash: deposit.txHash,
        currency: "USDT"
      }
    }], { session });

    if (TEST_MODE) {
      const conversionRate = 95;

      let inrWallet = await Wallet.findOne({
        user: deposit.user,
        type: "INR"
      }).session(session);

      if (!inrWallet) {
        inrWallet = await Wallet.create([{
          user: deposit.user,
          type: "INR",
          balance: 0
        }], { session });
        inrWallet = inrWallet[0];
      }

      const inrAmount = deposit.amount * conversionRate;
      inrWallet.balance += inrAmount;
      await inrWallet.save({ session });

      await Transaction.create([{
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
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ 
      message: "Deposit approved & INR credited",
      amount: deposit.amount,
      inrAmount: TEST_MODE ? deposit.amount * conversionRate : null
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