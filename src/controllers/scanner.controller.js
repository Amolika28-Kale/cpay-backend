const Scanner = require("../models/Scanner");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const User = require("../models/User");

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



/* =========================================================
   3️⃣ ACCEPT REQUEST (User B Accept)
========================================================= */
exports.acceptRequest = async (req, res) => {
  try {
    const { scannerId } = req.body;
    const userId = req.user.id;

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

    if (!scanner)
      return res.status(400).json({ message: "Already accepted or expired" });

    res.json({
      message: "Request accepted successfully"
    });

  } catch (err) {
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
   5️⃣ FINAL CONFIRM (User A clicks DONE)
========================================================= */
/* =========================================================
   5️⃣ FINAL CONFIRM (User A clicks DONE)
========================================================= */
/* =========================================================
   5️⃣ FINAL CONFIRM (User A clicks DONE) - UPDATED WITH CASHBACK FOR CREATOR
========================================================= */
exports.confirmFinalPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { scannerId } = req.body;
    const userId = req.user.id;

    const scanner = await Scanner.findById(scannerId).session(session);

    if (!scanner) throw new Error("Request not found");
    if (scanner.status !== "PAYMENT_SUBMITTED") throw new Error("Payment proof not yet submitted");
    if (scanner.user.toString() !== userId) throw new Error("Unauthorized: Only creator can confirm");

    const payerId = scanner.acceptedBy;
    const amount = scanner.amount;

    // 1. Deduct Creator (User A)
    const userAWallet = await Wallet.findOne({ user: userId, type: "INR" }).session(session);
    if (!userAWallet || userAWallet.balance < amount) throw new Error("Your INR balance is too low to confirm");

    userAWallet.balance -= amount;
    await userAWallet.save({ session });

    // 2. Credit Payer (User B)
    let userBWallet = await Wallet.findOne({ user: payerId, type: "INR" }).session(session);
    if (!userBWallet) {
      userBWallet = new Wallet({ user: payerId, type: "INR", balance: 0 });
    }
    userBWallet.balance += amount;
    await userBWallet.save({ session });

    /* ================ CASHBACK DISTRIBUTION ================ */
    // 🔥 Cashback for Creator (User A) - 1%
    const creatorCashback = Number((amount * 0.01).toFixed(2));
    let creatorCashbackWallet = await Wallet.findOne({ user: userId, type: "CASHBACK" }).session(session);
    if (!creatorCashbackWallet) {
      creatorCashbackWallet = new Wallet({ user: userId, type: "CASHBACK", balance: 0 });
    }
    creatorCashbackWallet.balance += creatorCashback;
    await creatorCashbackWallet.save({ session });

    // 🔥 Cashback for Payer (User B) - 5%
    const payerCashback = Number((amount * 0.05).toFixed(2));
    let payerCashbackWallet = await Wallet.findOne({ user: payerId, type: "CASHBACK" }).session(session);
    if (!payerCashbackWallet) {
      payerCashbackWallet = new Wallet({ user: payerId, type: "CASHBACK", balance: 0 });
    }
    payerCashbackWallet.balance += payerCashback;
    await payerCashbackWallet.save({ session });

    /* ================ REFERRAL COMMISSION (1%) ================ */
    const payerUser = await User.findById(payerId).session(session);
    if (payerUser && payerUser.referredBy) {
      const referrerId = payerUser.referredBy;
      const referralBonus = Number((amount * 0.01).toFixed(2));

      await Wallet.findOneAndUpdate(
        { user: referrerId, type: "CASHBACK" },
        { $inc: { balance: referralBonus } },
        { upsert: true, session }
      );

      await User.findByIdAndUpdate(referrerId, { $inc: { referralEarnings: referralBonus } }).session(session);

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

    // 5. Update Status
    scanner.status = "COMPLETED";
    scanner.completedAt = new Date();
    await scanner.save({ session });

    // 6. Create Ledger Transactions
    await Transaction.create([
      { user: userId, type: "DEBIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId },
      { user: payerId, type: "CREDIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId },
      { user: userId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: creatorCashback, relatedScanner: scannerId, meta: { type: "CREATOR_CASHBACK" } },
      { user: payerId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: payerCashback, relatedScanner: scannerId, meta: { type: "PAYER_CASHBACK" } }
    ], { session });

    await session.commitTransaction();
    session.endSession();
    
    res.json({ 
      message: "Transaction successful", 
      creatorCashback,
      payerCashback 
    });

  } catch (err) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
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
