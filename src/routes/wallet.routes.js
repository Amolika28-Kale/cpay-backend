const express = require('express');
const { getWallets, transferCashback, getWalletSummary } = require('../controllers/wallet.controller');
const userAuth = require('../middlewares/userAuth.middleware');

const router = express.Router();

router.get('/', userAuth, getWallets);
router.get('/my', userAuth, getWalletSummary);
router.post('/transfer-cashback', userAuth, transferCashback);


module.exports = router;
