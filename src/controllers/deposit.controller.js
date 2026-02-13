const Deposit = require("../models/Deposit");
const User = require("../models/User");

const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

exports.approveDeposit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deposit = await Deposit.findById(req.params.id).session(session);

    if (!deposit || deposit.status !== "pending")
      throw new Error("Invalid deposit");

    deposit.status = "approved";
    await deposit.save({ session });

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


await Transaction.create(
  [{
    user: deposit.user,
    type: "DEPOSIT",
    toWallet: "USDT",
    amount: deposit.amount,
    meta: {
      depositId: deposit._id,
      txHash: deposit.txHash
    }
  }],
  { session }
);

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Deposit approved safely" });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};


exports.createDeposit = async (req, res) => {
  try {
    const { amount, txHash, paymentMethodId } = req.body;
    const userId = req.user.id;

    if (!paymentMethodId)
      return res.status(400).json({ message: "Payment method required" });

    const deposit = await Deposit.create({
      user: userId,
      paymentMethod: paymentMethodId,
      amount: Number(amount),
      txHash: txHash.trim()
    });

    res.status(201).json(deposit);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get All Deposits (Admin)
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


// Reject Deposit
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

// Get My Deposits (User)
exports.getMyDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
