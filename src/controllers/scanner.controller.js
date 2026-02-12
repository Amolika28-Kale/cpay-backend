const Scanner = require('../models/Scanner');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const withTransaction = require('../utils/withTransaction');

exports.createScanner = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const scanner = await Scanner.create({ user: userId, amount });
    res.status(201).json(scanner);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getActiveScanners = async (req, res) => {
  try {
    const scanners = await Scanner.find({ status: 'ACTIVE' }).populate('user', 'name');
    res.json(scanners);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.payScanner = withTransaction(async (session, req, res) => {
  const { scannerId } = req.body;
  const userId = req.user.id;

  const scanner = await Scanner.findOneAndUpdate(
    { _id: scannerId, status: "ACTIVE" },
    { status: "PAID" },
    { new: true, session }
  );

  if (!scanner)
    return res.status(400).json({ message: "Scanner not available" });

  const payerWallet = await Wallet.findOne({ user: userId, type: "INR" }).session(session);
  if (!payerWallet || payerWallet.balance < scanner.amount)
    return res.status(400).json({ message: "Insufficient balance" });

  const receiverWallet = await Wallet.findOne({ user: scanner.user, type: "INR" }).session(session);
  const payerCashbackWallet = await Wallet.findOne({ user: userId, type: "CASHBACK" }).session(session);

  // Deduct from payer
  payerWallet.balance -= scanner.amount;
  await payerWallet.save({ session });

  // Credit receiver INR
  receiverWallet.balance += scanner.amount;
  await receiverWallet.save({ session });

  let cashbackRate = 0;
  let cashbackAmount = 0;

  // SELF PAYMENT → 1%
  if (scanner.user.toString() === userId.toString()) {
    cashbackRate = 0.01;
  } else {
    cashbackRate = 0.05;
  }

  cashbackAmount = scanner.amount * cashbackRate;

  payerCashbackWallet.balance += cashbackAmount;
  await payerCashbackWallet.save({ session });

  await Transaction.create(
    [
      {
        user: userId,
        type: "SCANNER_PAY",
        fromWallet: "INR",
        toWallet: "INR",
        amount: scanner.amount,
        meta: { scannerId }
      },
      {
        user: userId,
        type: "CASHBACK",
        toWallet: "CASHBACK",
        amount: cashbackAmount,
        meta: {
          scannerId,
          cashbackRate: cashbackRate === 0.01 ? "1%" : "5%"
        }
      }
    ],
    { session }
  );

  res.json({
    message: "Payment successful",
    cashback: cashbackAmount
  });
});

exports.getUserScanners = async (req, res) => {
  try {
    const userId = req.user.id;
    const scanners = await Scanner.find({ user: userId }).sort({ createdAt: -1 });
    res.json(scanners);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
