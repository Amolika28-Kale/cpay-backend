const Scanner = require("../models/Scanner");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

/* ================= CREATE SCANNER ================= */
exports.createScanner = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid scanner amount" });

    if (!req.file)
      return res.status(400).json({ message: "QR image required" });

    const scanner = await Scanner.create({
      user: userId,
      amount: Number(amount),
      image: `/uploads/${req.file.filename}`,
    });

    res.status(201).json(scanner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET ACTIVE ================= */
exports.getActiveScanners = async (req, res) => {
  try {
    const scanners = await Scanner.find({
      status: "ACTIVE",
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(scanners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= PAY ================= */
exports.payScanner = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { scannerId, paymentMode } = req.body;
    const userId = req.user.id;

    if (!["INR", "CASHBACK"].includes(paymentMode))
      throw new Error("Invalid payment mode");

    const scanner = await Scanner.findOneAndUpdate(
      {
        _id: scannerId,
        status: "ACTIVE",
        expiresAt: { $gt: new Date() },
      },
      {
        status: "PENDING_CONFIRMATION",
        paidBy: userId,
      },
      { new: true, session }
    );

    if (!scanner)
      throw new Error("Scanner expired or already used");

    if (scanner.user.toString() === userId.toString())
      throw new Error("Cannot pay your own scanner");

    const wallet = await Wallet.findOne({
      user: userId,
      type: paymentMode,
    }).session(session);

    if (!wallet || wallet.balance < scanner.amount)
      throw new Error("Insufficient balance");

    wallet.balance = Number(
      (wallet.balance - scanner.amount).toFixed(2)
    );

    await wallet.save({ session });

    await Transaction.create([{
      user: userId,
      type: "SCANNER_PAY",
      fromWallet: paymentMode,
      amount: scanner.amount,
      meta: { scannerId }
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Payment locked successfully" });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

/* ================= CONFIRM ================= */
exports.confirmPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { scannerId } = req.body;
    const userId = req.user.id;

    const scanner = await Scanner.findById(scannerId).session(session);

    if (!scanner || scanner.status !== "PENDING_CONFIRMATION")
      throw new Error("Invalid scanner state");

    if (!scanner.paidBy || scanner.paidBy.toString() !== userId.toString())
      throw new Error("Only payer can confirm");

    if (!req.file)
      throw new Error("Screenshot required");

    /* ================= OWNER INR WALLET ================= */
    let ownerWallet = await Wallet.findOne({
      user: scanner.user,
      type: "INR",
    }).session(session);

    if (!ownerWallet) {
      ownerWallet = new Wallet({
        user: scanner.user,
        type: "INR",
        balance: 0,
      });
      await ownerWallet.save({ session });
    }

    ownerWallet.balance = Number(
      (ownerWallet.balance + scanner.amount).toFixed(2)
    );
    await ownerWallet.save({ session });

    /* ================= CASHBACK ================= */
    const cashbackAmount = Number(
      (scanner.amount * 0.05).toFixed(2)
    );

    let cashbackWallet = await Wallet.findOne({
      user: userId,
      type: "CASHBACK",
    }).session(session);

    if (!cashbackWallet) {
      cashbackWallet = new Wallet({
        user: userId,
        type: "CASHBACK",
        balance: 0,
      });
      await cashbackWallet.save({ session });
    }

    cashbackWallet.balance = Number(
      (cashbackWallet.balance + cashbackAmount).toFixed(2)
    );
    await cashbackWallet.save({ session });

    /* ================= UPDATE SCANNER ================= */
    scanner.paymentScreenshot = `/uploads/${req.file.filename}`;
    scanner.status = "PAID";
    await scanner.save({ session });

    /* ================= TRANSACTIONS ================= */
    await Transaction.create([
      {
        user: scanner.user,
        type: "SCANNER_CREDIT",
        toWallet: "INR",
        amount: scanner.amount,
        meta: { scannerId }
      },
      {
        user: userId,
        type: "SCANNER_CASHBACK",
        toWallet: "CASHBACK",
        amount: cashbackAmount,
        meta: { percent: 5 }
      }
    ], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Payment confirmed",
      cashbackEarned: cashbackAmount
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};
