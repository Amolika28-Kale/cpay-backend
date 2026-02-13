const Wallet = require("../models/Wallet");

module.exports = async function createDefaultWallets(userId) {
  const types = ["USDT", "INR", "CASHBACK"];

  for (let type of types) {
    await Wallet.create({
      user: userId,
      type,
      balance: 0,
    });
  }
};
