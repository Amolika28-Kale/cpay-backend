const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

exports.getWallets = async (req, res) => {
  try {
    const userId = req.user.id;
    const wallets = await Wallet.find({ user: userId });
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.transferCashback = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const cashbackWallet = await Wallet.findOne({ user: userId, type: 'CASHBACK' });
    const inrWallet = await Wallet.findOne({ user: userId, type: 'INR' });

    if (!cashbackWallet || cashbackWallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient cashback balance' });
    }

    cashbackWallet.balance -= amount;
    inrWallet.balance += amount;

    await cashbackWallet.save();
    await inrWallet.save();

    await Transaction.create({
      user: userId,
      type: 'CASHBACK_TRANSFER',
      fromWallet: 'CASHBACK',
      toWallet: 'INR',
      amount
    });

    res.json({ message: 'Transfer successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getWalletSummary = async (req, res) => {
  try {
    const wallets = await Wallet.find({ user: req.user.id });

    const summary = {
      USDT: 0,
      INR: 0,
      CASHBACK: 0
    };

    wallets.forEach(w => {
      summary[w.type] = w.balance;
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
