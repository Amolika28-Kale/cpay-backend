const express = require('express');
const router = express.Router();

const adminAuth = require('../middlewares/adminAuth.middleware');

const { login, setConversionRate, createAdmin, getAllAdmins, deleteAdmin } = require('../controllers/adminAuth.controller');
const { getAllUsers, deleteUser } = require('../controllers/adminUsers.controller');
const { getAllDeposits, approveDeposit, rejectDeposit } = require('../controllers/deposit.controller');
const { getAllWithdraws, approveWithdraw, rejectWithdraw } = require('../controllers/withdraw.controller');
const { togglePaymentMethod, getAllPaymentMethods } = require('../controllers/paymentMethodController');
const { getSystemStats, getUserDetails } = require('../controllers/adminStats.controller'); // ✅ नवीन

// Public
router.post('/login', login);

// Admin Management
router.post('/create', createAdmin);
router.get('/list', getAllAdmins);
router.delete('/:id', deleteAdmin);

// System Stats - ✅ नवीन
router.get('/stats', adminAuth, getSystemStats);
router.get('/users/:userId', adminAuth, getUserDetails);

// Settings
router.post('/set-rate', adminAuth, setConversionRate);
router.put('/payment-method/:id/toggle', adminAuth, togglePaymentMethod);

// Users
router.get('/users', adminAuth, getAllUsers);
router.delete('/users/:id', adminAuth, deleteUser);

// Deposits
router.get('/deposits', adminAuth, getAllDeposits);
router.put('/deposits/:id/approve', adminAuth, approveDeposit);
router.put('/deposits/:id/reject', adminAuth, rejectDeposit);

// Withdraws
router.get('/withdraws', adminAuth, getAllWithdraws);
router.put('/withdraws/:id/approve', adminAuth, approveWithdraw);
router.put('/withdraws/:id/reject', adminAuth, rejectWithdraw);

// Payment Methods
router.get('/payment-methods', adminAuth, getAllPaymentMethods);

module.exports = router;