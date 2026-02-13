const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const Withdraw = require("../models/Withdraw");


// ================= USER CREATE WITHDRAW =================
exports.createWithdraw = async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid withdraw amount" });

    if (!walletAddress || walletAddress.trim() === "")
      return res.status(400).json({ message: "Wallet address required" });

    const inrWallet = await Wallet.findOne({
      user: userId,
      type: "INR"
    });

    if (!inrWallet)
      return res.status(404).json({ message: "INR wallet not found" });

    if (inrWallet.balance < amount)
      return res.status(400).json({ message: "Insufficient INR balance" });

    const withdraw = await Withdraw.create({
      user: userId,
      amount: Number(amount),
      walletAddress: walletAddress.trim()
    });

    res.status(201).json(withdraw);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ================= USER WITHDRAW HISTORY =================
exports.getMyWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(withdraws);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// ================= ADMIN GET ALL =================
exports.getAllWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(withdraws);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// ================= ADMIN APPROVE =================
exports.approveWithdraw = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdraw = await Withdraw.findById(req.params.id).session(session);

    if (!withdraw || withdraw.status !== "pending")
      throw new Error("Invalid withdraw request");

    const inrWallet = await Wallet.findOne({
      user: withdraw.user,
      type: "INR"
    }).session(session);

    if (!inrWallet)
      throw new Error("INR wallet not found");

    if (inrWallet.balance < withdraw.amount)
      throw new Error("Insufficient balance");

    // 🔻 Deduct INR
    inrWallet.balance = Number(
      (inrWallet.balance - withdraw.amount).toFixed(2)
    );
    await inrWallet.save({ session });

    // 🔥 1% Cashback
    const cashbackAmount = Number(
      (withdraw.amount * 0.01).toFixed(2)
    );

    const cashbackWallet = await Wallet.findOne({
      user: withdraw.user,
      type: "CASHBACK"
    }).session(session);

    if (!cashbackWallet)
      throw new Error("Cashback wallet not found");

    cashbackWallet.balance = Number(
      (cashbackWallet.balance + cashbackAmount).toFixed(2)
    );

    await cashbackWallet.save({ session });

    withdraw.status = "approved";
    await withdraw.save({ session });

    await Transaction.create([
      {
        user: withdraw.user,
        type: "WITHDRAW",
        fromWallet: "INR",
        amount: withdraw.amount,
        meta: { withdrawId: withdraw._id }
      },
      {
        user: withdraw.user,
        type: "CASHBACK",
        toWallet: "CASHBACK",
        amount: cashbackAmount,
        meta: { source: "WITHDRAW_1_PERCENT" }
      }
    ], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Withdraw approved with 1% cashback" });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};



// ================= ADMIN REJECT =================
exports.rejectWithdraw = async (req, res) => {
  try {
    const { reason } = req.body;

    const withdraw = await Withdraw.findById(req.params.id);

    if (!withdraw)
      return res.status(404).json({ message: "Withdraw not found" });

    if (withdraw.status !== "pending")
      return res.status(400).json({ message: "Already processed" });

    withdraw.status = "rejected";
    withdraw.rejectReason = reason || "Not specified";
    await withdraw.save();

    res.json({ message: "Withdraw rejected" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
