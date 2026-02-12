const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const Rate = require("../models/Rate");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

exports.convertUSDTtoINR = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { usdtAmount } = req.body;
    const userId = req.user.id;

    if (!usdtAmount || usdtAmount <= 0)
      throw new Error("Invalid amount");

    // Get active rate
    const rate = await Rate.findOne({ isActive: true }).session(session);
    if (!rate) throw new Error("Conversion rate not set");

    const usdtWallet = await Wallet.findOne({
      user: userId,
      type: "USDT"
    }).session(session);

    const inrWallet = await Wallet.findOne({
      user: userId,
      type: "INR"
    }).session(session);

    if (!usdtWallet || usdtWallet.balance < usdtAmount)
      throw new Error("Insufficient USDT balance");

    const inrAmount = usdtAmount * rate.usdtToInr;

    // 🔹 Deduct USDT
    usdtWallet.balance -= usdtAmount;
    await usdtWallet.save({ session });

    // 🔹 Credit INR
    inrWallet.balance += inrAmount;
    await inrWallet.save({ session });

    // 🔥 REFERRAL BONUS (1%)
    const user = await User.findById(userId).session(session);

    if (user.referredBy) {
      const referralBonus = inrAmount * 0.01;

      const referrerCashbackWallet = await Wallet.findOne({
        user: user.referredBy,
        type: "CASHBACK"
      }).session(session);

      referrerCashbackWallet.balance += referralBonus;
      await referrerCashbackWallet.save({ session });

      await Transaction.create(
        [
          {
            user: user.referredBy,
            type: "CASHBACK",
            toWallet: "CASHBACK",
            amount: referralBonus,
            meta: {
              source: "REFERRAL_CONVERSION",
              fromUser: userId
            }
          }
        ],
        { session }
      );
    }

    // 🔹 Store Conversion Ledger
    await Transaction.create(
      [
        {
          user: userId,
          type: "CONVERSION",
          fromWallet: "USDT",
          toWallet: "INR",
          amount: inrAmount,
          meta: {
            usdtAmount,
            rateUsed: rate.usdtToInr
          }
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Conversion successful",
      usdtDeducted: usdtAmount,
      inrCredited: inrAmount,
      rateUsed: rate.usdtToInr
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};
