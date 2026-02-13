const express = require('express');
const router = express.Router();

const adminAuth = require('../middlewares/adminAuth.middleware');

const { login, setConversionRate } = require('../controllers/adminAuth.controller');

const {
  getAllUsers,
  deleteUser
} = require('../controllers/adminUsers.controller');

const {
  getAllDeposits,
  approveDeposit,
  rejectDeposit
} = require('../controllers/deposit.controller');

const {
  getAllWithdraws,
  approveWithdraw,
  rejectWithdraw
} = require('../controllers/withdraw.controller');
const { togglePaymentMethod, getAllPaymentMethods } = require('../controllers/paymentMethodController');


// Public
router.post('/login', login);

// Protected
router.post('/set-rate', adminAuth, setConversionRate);
router.put('/payment-method/:id/toggle', adminAuth, togglePaymentMethod);


router.get('/users', adminAuth, getAllUsers);
router.delete('/users/:id', adminAuth, deleteUser);

router.get('/deposits', adminAuth, getAllDeposits);
router.put('/deposits/:id/approve', adminAuth, approveDeposit);
router.put('/deposits/:id/reject', adminAuth, rejectDeposit);

router.get('/withdraws', adminAuth, getAllWithdraws);
router.put('/withdraws/:id/approve', adminAuth, approveWithdraw);
router.put('/withdraws/:id/reject', adminAuth, rejectWithdraw);

router.get('/payment-methods', adminAuth, getAllPaymentMethods);


module.exports = router;
