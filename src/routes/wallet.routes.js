const express = require('express');
const { getWallets, transferCashback, getWalletSummary, getCurrentRate, selfPay } = require('../controllers/wallet.controller');
const userAuth = require('../middlewares/userAuth.middleware');
const Wallet = require('../models/Wallet');

const router = express.Router();

router.get('/', userAuth, getWallets);
router.get('/my', userAuth, getWalletSummary);
router.post('/transfer-cashback', userAuth, transferCashback);
router.get('/rate', getCurrentRate);
router.post('/self-pay', userAuth, selfPay);
router.get('/balance', userAuth, async (req, res) => {
  const { type } = req.query;
  const wallet = await Wallet.findOne({ user: req.user.id, type });
  res.json({ balance: wallet?.balance || 0 });
});


module.exports = router;
