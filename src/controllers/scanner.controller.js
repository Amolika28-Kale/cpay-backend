const Scanner = require("../models/Scanner");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const withTransaction = require("../utils/withTransaction");


// ================= CREATE =================
exports.createScanner = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid scanner amount" });

    const scanner = await Scanner.create({
      user: userId,
      amount: Number(amount)
    });

    res.status(201).json(scanner);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ================= ACTIVE =================
exports.getActiveScanners = async (req, res) => {
  try {
    const scanners = await Scanner.find({
      status: "ACTIVE",
      expiresAt: { $gt: new Date() }
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(scanners);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ================= PAY =================
exports.payScanner = withTransaction(async (session, req, res) => {
  const { scannerId, paymentMode } = req.body;
  const userId = req.user.id;

  if (!["INR", "CASHBACK"].includes(paymentMode))
    return res.status(400).json({ message: "Invalid payment mode" });

  const scanner = await Scanner.findOne({
    _id: scannerId,
    status: "ACTIVE",
    expiresAt: { $gt: new Date() }
  }).session(session);

  if (!scanner)
    return res.status(400).json({ message: "Scanner not available or expired" });

  scanner.status = "PENDING_CONFIRMATION";
  await scanner.save({ session });

  const payerWallet = await Wallet.findOne({
    user: userId,
    type: paymentMode
  }).session(session);

  if (!payerWallet)
    throw new Error("Wallet not found");

  if (payerWallet.balance < scanner.amount)
    throw new Error("Insufficient balance");

  payerWallet.balance = Number(
    (payerWallet.balance - scanner.amount).toFixed(2)
  );

  await payerWallet.save({ session });

  await Transaction.create([
    {
      user: userId,
      type: "SCANNER_PAY",
      fromWallet: paymentMode,
      amount: scanner.amount,
      meta: { scannerId }
    }
  ], { session });

  res.json({ message: "Payment initiated" });
});



// ================= CONFIRM =================
exports.confirmPayment = withTransaction(async (session, req, res) => {
  const { scannerId } = req.body;

  const scanner = await Scanner.findById(scannerId).session(session);

  if (!scanner || scanner.status !== "PENDING_CONFIRMATION")
    throw new Error("Invalid scanner state");

  const receiverWallet = await Wallet.findOne({
    user: scanner.user,
    type: "INR"
  }).session(session);

  if (!receiverWallet)
    throw new Error("Receiver wallet not found");

  receiverWallet.balance = Number(
    (receiverWallet.balance + scanner.amount).toFixed(2)
  );

  await receiverWallet.save({ session });

  const cashbackRate =
    scanner.user.toString() === req.user.id.toString() ? 0.01 : 0.05;

  const cashbackAmount = Number(
    (scanner.amount * cashbackRate).toFixed(2)
  );

  const cashbackWallet = await Wallet.findOne({
    user: req.user.id,
    type: "CASHBACK"
  }).session(session);

  if (!cashbackWallet)
    throw new Error("Cashback wallet not found");

  cashbackWallet.balance = Number(
    (cashbackWallet.balance + cashbackAmount).toFixed(2)
  );

  await cashbackWallet.save({ session });

  scanner.status = "PAID";
  await scanner.save({ session });

  await Transaction.create([
    {
      user: req.user.id,
      type: "CASHBACK",
      toWallet: "CASHBACK",
      amount: cashbackAmount,
      meta: { scannerId }
    }
  ], { session });

  res.json({
    message: "Payment confirmed",
    cashbackEarned: cashbackAmount
  });
});
