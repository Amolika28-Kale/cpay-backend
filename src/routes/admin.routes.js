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


// Public
router.post('/login', login);

// Protected
router.post('/set-rate', adminAuth, setConversionRate);

router.get('/users', adminAuth, getAllUsers);
router.delete('/users/:id', adminAuth, deleteUser);

router.get('/deposits', adminAuth, getAllDeposits);
router.put('/deposits/:id/approve', adminAuth, approveDeposit);
router.put('/deposits/:id/reject', adminAuth, rejectDeposit);

router.get('/withdraws', adminAuth, getAllWithdraws);
router.put('/withdraws/:id/approve', adminAuth, approveWithdraw);
router.put('/withdraws/:id/reject', adminAuth, rejectWithdraw);

module.exports = router;
