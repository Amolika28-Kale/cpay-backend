const Scanner = require("../models/Scanner");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const withTransaction = require("../utils/withTransaction");

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
exports.payScanner = withTransaction(async (session, req, res) => {
  const { scannerId, paymentMode } = req.body;
  const userId = req.user.id;

  if (!["INR", "CASHBACK"].includes(paymentMode))
    throw new Error("Invalid payment mode");

  const scanner = await Scanner.findOne({
    _id: scannerId,
    status: "ACTIVE",
    expiresAt: { $gt: new Date() },
  }).session(session);

  if (!scanner)
    throw new Error("Scanner not available");

  if (scanner.user.toString() === userId.toString())
    throw new Error("Cannot pay your own scanner");

  const payerWallet = await Wallet.findOne({
    user: userId,
    type: paymentMode,
  }).session(session);

  if (!payerWallet)
    throw new Error("Wallet not found");

  if (payerWallet.balance < scanner.amount)
    throw new Error("Insufficient balance");

  /* Deduct from payer */
  payerWallet.balance = Number(
    (payerWallet.balance - scanner.amount).toFixed(2)
  );

  await payerWallet.save({ session });

  scanner.status = "PENDING_CONFIRMATION";
  console.log("Scanner status before pay:", scanner?.status);

  scanner.paidBy = userId;

  await scanner.save({ session });

  await Transaction.create(
    [
      {
        user: userId,
        type: "SCANNER_PAY",
        fromWallet: paymentMode,
        amount: scanner.amount,
        meta: { scannerId },
      },
    ],
    { session }
  );

  res.json({ message: "Payment initiated successfully" });
});

/* ================= CONFIRM ================= */
exports.confirmPayment = withTransaction(async (session, req, res) => {
  const { scannerId } = req.body;
  const userId = req.user.id;

  const scanner = await Scanner.findById(scannerId).session(session);

  if (!scanner)
    throw new Error("Scanner not found");

  if (scanner.status !== "PENDING_CONFIRMATION")
    
    throw new Error("Invalid scanner state");
    console.log("Scanner status before confirm:", scanner?.status);


  if (!scanner.paidBy || scanner.paidBy.toString() !== userId.toString())
    throw new Error("Only payer can confirm");

  if (!req.file)
    throw new Error("Payment screenshot required");

  /* CREDIT OWNER (User A) */
  const ownerWallet = await Wallet.findOne({
    user: scanner.user,
    type: "INR",
  }).session(session);

  if (!ownerWallet)
    throw new Error("Owner wallet not found");

  ownerWallet.balance = Number(
    (ownerWallet.balance + scanner.amount).toFixed(2)
  );

  await ownerWallet.save({ session });

  /* GIVE 5% CASHBACK TO PAYER */
  const cashbackWallet = await Wallet.findOne({
    user: userId,
    type: "CASHBACK",
  }).session(session);

  if (!cashbackWallet)
    throw new Error("Cashback wallet not found");

  const cashbackAmount = Number(
    ((scanner.amount * 5) / 100).toFixed(2)
  );

  cashbackWallet.balance = Number(
    (cashbackWallet.balance + cashbackAmount).toFixed(2)
  );

  await cashbackWallet.save({ session });

  /* SAVE SCREENSHOT */
  scanner.paymentScreenshot = `/uploads/${req.file.filename}`;
  scanner.status = "PAID";

  await scanner.save({ session });

  await Transaction.create(
    [
      {
        user: scanner.user,
        type: "SCANNER_CREDIT",
        toWallet: "INR",
        amount: scanner.amount,
        meta: { scannerId },
      },
      {
        user: userId,
        type: "CASHBACK",
        toWallet: "CASHBACK",
        amount: cashbackAmount,
        meta: { scannerId, percent: 5 },
      },
    ],
    { session }
  );

  res.json({
    message: "Payment confirmed successfully",
    cashbackEarned: cashbackAmount,
  });
});
