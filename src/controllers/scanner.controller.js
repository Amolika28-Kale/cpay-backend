const Scanner = require("../models/Scanner");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const User = require("../models/User");
const ReferralService = require("../../services/referralService");


/* =========================================================
   1️⃣ REQUEST TO PAY (User A creates request)
========================================================= */
exports.requestToPay = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    if (!req.file)
      return res.status(400).json({ message: "QR required" });

    const scanner = await Scanner.create({
      user: userId,
      amount: Number(amount),
      image: `/uploads/${req.file.filename}`,
      upiLink: req.body.upiLink,
      status: "ACTIVE"
    });

    res.status(201).json({
      message: "Request sent to all users",
      scanner
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* =========================================================
   2️⃣ GET ALL ACTIVE REQUESTS
========================================================= */
exports.getActiveRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Scanner.find({
      $or: [
        { status: "ACTIVE" },
        { acceptedBy: userId, status: { $in: ["ACCEPTED", "PAYMENT_SUBMITTED"] } },
        { user: userId, status: { $in: ["ACCEPTED", "PAYMENT_SUBMITTED"] } }
      ],
      expiresAt: { $gt: new Date() }
    })
      .populate("user", "name")
      .populate("acceptedBy", "name")
      .sort({ createdAt: -1 });

    res.json(requests);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// /* =========================================================
//    3️⃣ ACCEPT REQUEST (User B Accept)


/* =========================================================
   3️⃣ ACCEPT REQUEST (User B Accept) - UPDATED WITH DAILY LIMIT
========================================================= */
exports.acceptRequest = async (req, res) => {
  try {
    const { scannerId } = req.body;
    const userId = req.user.id;

    console.log("Accept request received:", { scannerId, userId });

    // Check wallet activation and daily limit
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.walletActivated) {
      return res.status(400).json({ message: "Please activate your wallet first" });
    }

    if (user.todayAcceptedCount >= user.dailyAcceptLimit) {
      return res.status(400).json({ message: "Daily accept limit reached" });
    }

    // Find and update the scanner
    const scanner = await Scanner.findOneAndUpdate(
      {
        _id: scannerId,
        status: "ACTIVE"
      },
      {
        status: "ACCEPTED",
        acceptedBy: userId,
        acceptedAt: new Date()
      },
      { new: true }
    );

    if (!scanner) {
      return res.status(400).json({ message: "Already accepted or expired" });
    }

    // Increment today's accepted count
    user.todayAcceptedCount += 1;
    await user.save();

    console.log("Request accepted successfully:", scanner._id);

    res.json({
      message: "Request accepted successfully",
      scanner
    });

  } catch (err) {
    console.error("Accept request error:", err);
    res.status(500).json({ message: err.message });
  }
};




/* =========================================================
   4️⃣ SUBMIT PAYMENT SCREENSHOT (User B)
========================================================= */
exports.submitPayment = async (req, res) => {
  try {
    const { scannerId } = req.body;
    const userId = req.user.id;

    const scanner = await Scanner.findById(scannerId);

    if (!scanner || scanner.status !== "ACCEPTED")
      return res.status(400).json({ message: "Invalid state" });

    if (scanner.acceptedBy.toString() !== userId)
      return res.status(403).json({ message: "Not authorized" });

    if (!req.file)
      return res.status(400).json({ message: "Screenshot required" });

    scanner.paymentScreenshot = `/uploads/${req.file.filename}`;
    scanner.status = "PAYMENT_SUBMITTED";
    scanner.paymentSubmittedAt = new Date();

    await scanner.save();

    res.json({ message: "Screenshot submitted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




/* =========================================================
   6️⃣ SELF PAY (1% CASHBACK)
========================================================= */
exports.selfPay = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount } = req.body;
    const userId = req.user.id;

    const wallet = await Wallet.findOne({
      user: userId,
      type: "INR"
    }).session(session);

    if (!wallet || wallet.balance < amount)
      throw new Error("Insufficient balance");

    wallet.balance -= amount;
    await wallet.save({ session });

    const cashback = Number((amount * 0.01).toFixed(2));

    let cashbackWallet = await Wallet.findOne({
      user: userId,
      type: "CASHBACK"
    }).session(session);

    if (!cashbackWallet) {
      cashbackWallet = new Wallet({
        user: userId,
        type: "CASHBACK",
        balance: 0
      });
    }

    cashbackWallet.balance += cashback;
    await cashbackWallet.save({ session });

    /* ================= REFERRAL COMMISSION ON SELF PAY ================= */
    const currentUser = await User.findById(userId).session(session);

    if (currentUser.referredBy) {
      const referralBonus = Number((amount * 0.01).toFixed(2));
      const referrerId = currentUser.referredBy;

      let refWallet = await Wallet.findOne({
        user: referrerId,
        type: "CASHBACK"
      }).session(session);

      if (!refWallet) {
        refWallet = new Wallet({
          user: referrerId,
          type: "CASHBACK",
          balance: 0
        });
      }

      refWallet.balance += referralBonus;
      await refWallet.save({ session });

      await User.findByIdAndUpdate(referrerId, {
        $inc: { referralEarnings: referralBonus }
      }).session(session);

      // FIXED: Added toWallet field
      await Transaction.create([{
        user: referrerId,
        type: "CASHBACK",
        fromWallet: "INR",
        toWallet: "CASHBACK",
        amount: referralBonus,
        meta: { type: "SELF_PAY_REFERRAL" }
      }], { session });
    }

    // FIXED: Single transaction with both fromWallet and toWallet
    await Transaction.create([{
      user: userId,
      type: "SELF_PAY",
      fromWallet: "INR",
      toWallet: "CASHBACK", // Changed from null to CASHBACK
      amount: amount,
      meta: { 
        type: "SELF_PAY",
        cashbackEarned: cashback 
      }
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Self payment successful",
      cashbackEarned: cashback
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

/* =========================================================
   7️⃣ ADMIN: GET ALL SCANNERS (FOR ADMIN DASHBOARD)
========================================================= */
exports.getAllScanners = async (req, res) => {
  try {
    // Admin needs to see everything: Active, Accepted, Submitted, Completed, and Expired
    const allScanners = await Scanner.find()
      .populate("user", "name email")       // See who created it
      .populate("acceptedBy", "name email") // See who is paying it
      .sort({ createdAt: -1 });

    res.json(allScanners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Activate wallet for daily accepting
exports.activateWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dailyLimit } = req.body; // User can set their daily limit

    const user = await User.findById(userId);
    const inrWallet = await Wallet.findOne({ user: userId, type: "INR" });

    const activationAmount = dailyLimit * 0.1; // 10% of daily limit

    if (!inrWallet || inrWallet.balance < activationAmount) {
      return res.status(400).json({ 
        message: `Insufficient balance. Need ₹${activationAmount} to activate` 
      });
    }

    // Deduct activation amount (this will be held as security)
    inrWallet.balance -= activationAmount;
    await inrWallet.save();

    // Update user's activation status
    user.walletActivated = true;
    user.activationDate = new Date();
    user.dailyAcceptLimit = dailyLimit;
    user.todayAcceptedCount = 0;
    await user.save();

    // Create transaction record
    await Transaction.create({
      user: userId,
      type: "WALLET_ACTIVATION",
      fromWallet: "INR",
      toWallet: "SECURITY_HOLD",
      amount: activationAmount,
      meta: { dailyLimit, type: "ACTIVATION_DEPOSIT" }
    });

    res.json({ 
      message: "Wallet activated successfully",
      dailyLimit,
      activationAmount
    });

  } catch (err) {
    console.error("Wallet activation error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Check if wallet is activated for today
exports.checkWalletActivation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Reset if it's a new day
    const lastActivation = user.activationDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastActivation && lastActivation < today) {
      user.walletActivated = false;
      user.todayAcceptedCount = 0;
      await user.save();
    }

    res.json({
      activated: user.walletActivated,
      dailyLimit: user.dailyAcceptLimit,
      todayAccepted: user.todayAcceptedCount,
      remaining: user.walletActivated ? user.dailyAcceptLimit - user.todayAcceptedCount : 0
    });

  } catch (err) {
    console.error("Check activation error:", err);
    res.status(500).json({ message: err.message });
  }
};



// Updated confirm payment with correct logic
// Updated confirm payment with correct logic and error handling
// Updated confirm payment with correct logic and error handling
exports.confirmFinalPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { scannerId } = req.body;
    const userId = req.user.id; // This is User A (Creator)

    const scanner = await Scanner.findById(scannerId).session(session);
    if (!scanner) throw new Error("Request not found");
    if (scanner.status !== "PAYMENT_SUBMITTED") throw new Error("Payment proof not yet submitted");
    if (scanner.user.toString() !== userId) throw new Error("Unauthorized: Only creator can confirm");

    const acceptorId = scanner.acceptedBy; // This is User B (Acceptor)
    const amount = scanner.amount;

    console.log("Confirming payment:", {
      creatorId: userId,
      acceptorId: acceptorId,
      amount: amount
    });

    // ✅ STEP 1: Debit from Creator (User A)
    const creatorWallet = await Wallet.findOne({ user: userId, type: "INR" }).session(session);
    if (!creatorWallet || creatorWallet.balance < amount) {
      throw new Error("Creator's INR balance is too low");
    }
    creatorWallet.balance -= amount;
    await creatorWallet.save({ session });
    console.log(`Debited ₹${amount} from Creator (User A): ${userId}`);

    // ✅ STEP 2: Credit to Acceptor (User B)
    let acceptorWallet = await Wallet.findOne({ user: acceptorId, type: "INR" }).session(session);
    if (!acceptorWallet) {
      acceptorWallet = new Wallet({ user: acceptorId, type: "INR", balance: 0 });
    }
    acceptorWallet.balance += amount;
    await acceptorWallet.save({ session });
    console.log(`Credited ₹${amount} to Acceptor (User B): ${acceptorId}`);

    /* ================ CASHBACK DISTRIBUTION ================ */
    // 🔥 Cashback for Creator (User A) - 1%
    const creatorCashback = Number((amount * 0.01).toFixed(2));
    let creatorCashbackWallet = await Wallet.findOne({ user: userId, type: "CASHBACK" }).session(session);
    if (!creatorCashbackWallet) {
      creatorCashbackWallet = new Wallet({ user: userId, type: "CASHBACK", balance: 0 });
    }
    creatorCashbackWallet.balance += creatorCashback;
    await creatorCashbackWallet.save({ session });
    console.log(`Creator Cashback: ₹${creatorCashback}`);

    // 🔥 Cashback for Acceptor (User B) - 5%
    const acceptorCashback = Number((amount * 0.05).toFixed(2));
    let acceptorCashbackWallet = await Wallet.findOne({ user: acceptorId, type: "CASHBACK" }).session(session);
    if (!acceptorCashbackWallet) {
      acceptorCashbackWallet = new Wallet({ user: acceptorId, type: "CASHBACK", balance: 0 });
    }
    acceptorCashbackWallet.balance += acceptorCashback;
    await acceptorCashbackWallet.save({ session });
    console.log(`Acceptor Cashback: ₹${acceptorCashback}`);

    // Update scanner status
    scanner.status = "COMPLETED";
    scanner.completedAt = new Date();
    await scanner.save({ session });

    // Create ledger transactions
    const transactions = [
      { user: userId, type: "DEBIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId, meta: { type: "PAYMENT_SENT_TO_ACCEPTOR" } },
      { user: acceptorId, type: "CREDIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId, meta: { type: "PAYMENT_RECEIVED_FROM_CREATOR" } },
      { user: userId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: creatorCashback, relatedScanner: scannerId, meta: { type: "CREATOR_CASHBACK" } },
      { user: acceptorId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: acceptorCashback, relatedScanner: scannerId, meta: { type: "ACCEPTOR_CASHBACK" } }
    ];

    await Transaction.insertMany(transactions, { session });

    /* ================ REFERRAL COMMISSION (1%) ================ */
    const acceptorUser = await User.findById(acceptorId).session(session);
    if (acceptorUser && acceptorUser.referredBy) {
      const referrerId = acceptorUser.referredBy;
      const referralBonus = Number((amount * 0.01).toFixed(2));

      // ✅ FIXED: Update specific fields in referralEarnings object
      await Wallet.findOneAndUpdate(
        { user: referrerId, type: "CASHBACK" },
        { $inc: { balance: referralBonus } },
        { upsert: true, session }
      );

      // ✅ FIXED: Update referralEarnings.total instead of the whole object
      await User.findByIdAndUpdate(
        referrerId, 
        { 
          $inc: { 
            'referralEarnings.total': referralBonus,
            'referralEarnings.level1': referralBonus // Assuming this is level 1 commission
          } 
        },
        { session }
      );

      await Transaction.create([{
        user: referrerId,
        type: "CASHBACK",
        fromWallet: "INR",
        toWallet: "CASHBACK",
        amount: referralBonus,
        relatedScanner: scannerId,
        meta: { type: "REFERRAL_COMMISSION" }
      }], { session });
    }

    // Process team cashback for both users' uplines
    await session.commitTransaction();
    session.endSession();

    // Team cashback processing - transaction commit नंतर
    try {
      await ReferralService.processTeamCashback(userId, creatorCashback, 'CREATOR_CASHBACK', scannerId);
    } catch (err) {
      console.error("Error processing team cashback for creator:", err);
    }
    
    try {
      await ReferralService.processTeamCashback(acceptorId, acceptorCashback, 'ACCEPTOR_CASHBACK', scannerId);
    } catch (err) {
      console.error("Error processing team cashback for acceptor:", err);
    }
    
    res.json({ 
      message: "Transaction successful",
      transaction: {
        amount,
        creatorId: userId,
        acceptorId,
        creatorCashback,
        acceptorCashback
      }
    });

  } catch (err) {
    console.error("Confirm payment error:", err);
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};


// /* =========================================================
//    5️⃣ FINAL CONFIRM (User A clicks DONE)
// ========================================================= */
// /* =========================================================
//    5️⃣ FINAL CONFIRM (User A clicks DONE)
// ========================================================= */
// /* =========================================================
//    5️⃣ FINAL CONFIRM (User A clicks DONE) - UPDATED WITH CASHBACK FOR CREATOR
// ========================================================= */
// exports.confirmFinalPayment = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { scannerId } = req.body;
//     const userId = req.user.id;

//     const scanner = await Scanner.findById(scannerId).session(session);

//     if (!scanner) throw new Error("Request not found");
//     if (scanner.status !== "PAYMENT_SUBMITTED") throw new Error("Payment proof not yet submitted");
//     if (scanner.user.toString() !== userId) throw new Error("Unauthorized: Only creator can confirm");

//     const payerId = scanner.acceptedBy;
//     const amount = scanner.amount;

//     // 1. Deduct Creator (User A)
//     const userAWallet = await Wallet.findOne({ user: userId, type: "INR" }).session(session);
//     if (!userAWallet || userAWallet.balance < amount) throw new Error("Your INR balance is too low to confirm");

//     userAWallet.balance -= amount;
//     await userAWallet.save({ session });

//     // 2. Credit Payer (User B)
//     let userBWallet = await Wallet.findOne({ user: payerId, type: "INR" }).session(session);
//     if (!userBWallet) {
//       userBWallet = new Wallet({ user: payerId, type: "INR", balance: 0 });
//     }
//     userBWallet.balance += amount;
//     await userBWallet.save({ session });

//     /* ================ CASHBACK DISTRIBUTION ================ */
//     // 🔥 Cashback for Creator (User A) - 1%
//     const creatorCashback = Number((amount * 0.01).toFixed(2));
//     let creatorCashbackWallet = await Wallet.findOne({ user: userId, type: "CASHBACK" }).session(session);
//     if (!creatorCashbackWallet) {
//       creatorCashbackWallet = new Wallet({ user: userId, type: "CASHBACK", balance: 0 });
//     }
//     creatorCashbackWallet.balance += creatorCashback;
//     await creatorCashbackWallet.save({ session });

//     // 🔥 Cashback for Payer (User B) - 5%
//     const payerCashback = Number((amount * 0.05).toFixed(2));
//     let payerCashbackWallet = await Wallet.findOne({ user: payerId, type: "CASHBACK" }).session(session);
//     if (!payerCashbackWallet) {
//       payerCashbackWallet = new Wallet({ user: payerId, type: "CASHBACK", balance: 0 });
//     }
//     payerCashbackWallet.balance += payerCashback;
//     await payerCashbackWallet.save({ session });

//     /* ================ REFERRAL COMMISSION (1%) ================ */
//     const payerUser = await User.findById(payerId).session(session);
//     if (payerUser && payerUser.referredBy) {
//       const referrerId = payerUser.referredBy;
//       const referralBonus = Number((amount * 0.01).toFixed(2));

//       await Wallet.findOneAndUpdate(
//         { user: referrerId, type: "CASHBACK" },
//         { $inc: { balance: referralBonus } },
//         { upsert: true, session }
//       );

//       await User.findByIdAndUpdate(referrerId, { $inc: { referralEarnings: referralBonus } }).session(session);

//       await Transaction.create([{
//         user: referrerId,
//         type: "CASHBACK",
//         fromWallet: "INR",
//         toWallet: "CASHBACK",
//         amount: referralBonus,
//         relatedScanner: scannerId,
//         meta: { type: "REFERRAL_COMMISSION" }
//       }], { session });
//     }

//     // 5. Update Status
//     scanner.status = "COMPLETED";
//     scanner.completedAt = new Date();
//     await scanner.save({ session });

//     // 6. Create Ledger Transactions
//     await Transaction.create([
//       { user: userId, type: "DEBIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId },
//       { user: payerId, type: "CREDIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId },
//       { user: userId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: creatorCashback, relatedScanner: scannerId, meta: { type: "CREATOR_CASHBACK" } },
//       { user: payerId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: payerCashback, relatedScanner: scannerId, meta: { type: "PAYER_CASHBACK" } }
//     ], { session });

//     await session.commitTransaction();
//     session.endSession();
    
//     res.json({ 
//       message: "Transaction successful", 
//       creatorCashback,
//       payerCashback 
//     });

//   } catch (err) {
//     if (session.inTransaction()) await session.abortTransaction();
//     session.endSession();
//     res.status(400).json({ message: err.message });
//   }
// };

// // Updated accept request with daily limit check
// exports.acceptRequest = async (req, res) => {
//   try {
//     const { scannerId } = req.body;
//     const userId = req.user.id;

//     // Check wallet activation and daily limit
//     const user = await User.findById(userId);
    
//     if (!user.walletActivated) {
//       return res.status(400).json({ message: "Please activate your wallet first" });
//     }

//     if (user.todayAcceptedCount >= user.dailyAcceptLimit) {
//       return res.status(400).json({ message: "Daily accept limit reached" });
//     }

//     const scanner = await Scanner.findOneAndUpdate(
//       {
//         _id: scannerId,
//         status: "ACTIVE"
//       },
//       {
//         status: "ACCEPTED",
//         acceptedBy: userId,
//         acceptedAt: new Date()
//       },
//       { new: true }
//     );

//     if (!scanner) {
//       return res.status(400).json({ message: "Already accepted or expired" });
//     }

//     // Increment today's accepted count
//     user.todayAcceptedCount += 1;
//     await user.save();

//     res.json({
//       message: "Request accepted successfully"
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };