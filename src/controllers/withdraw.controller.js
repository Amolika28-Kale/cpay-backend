const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const Withdraw = require("../models/Withdraw");



// USER CREATE WITHDRAW REQUEST
exports.createWithdraw = async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;
    const userId = req.user.id;

    const inrWallet = await Wallet.findOne({ user: userId, type: "INR" });

    if (!inrWallet || inrWallet.balance < amount)
      return res.status(400).json({ message: "Insufficient INR balance" });

    const withdraw = await Withdraw.create({
      user: userId,
      amount,
      walletAddress
    });

    res.status(201).json(withdraw);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};




// USER WITHDRAW HISTORY
exports.getMyWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(withdraws);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// ADMIN GET ALL WITHDRAWS
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



// ADMIN APPROVE WITHDRAW
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

    if (!inrWallet || inrWallet.balance < withdraw.amount)
      throw new Error("Insufficient balance");

    inrWallet.balance -= withdraw.amount;
    await inrWallet.save({ session });

    withdraw.status = "approved";
    await withdraw.save({ session });

    await Transaction.create(
      [
        {
          user: withdraw.user,
          type: "WITHDRAW",
          fromWallet: "INR",
          amount: withdraw.amount,
          meta: { withdrawId: withdraw._id }
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Withdraw approved safely" });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};




// ADMIN REJECT WITHDRAW
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
