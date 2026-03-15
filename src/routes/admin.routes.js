const express = require('express');
const router = express.Router();

const adminAuth = require('../middlewares/adminAuth.middleware');

const { login, setConversionRate, createAdmin, getAllAdmins, deleteAdmin } = require('../controllers/adminAuth.controller');
const { getAllUsers, deleteUser } = require('../controllers/adminUsers.controller');
const { getAllDeposits, approveDeposit, rejectDeposit } = require('../controllers/deposit.controller');
const { getAllWithdraws, approveWithdraw, rejectWithdraw } = require('../controllers/withdraw.controller');
const { togglePaymentMethod, getAllPaymentMethods } = require('../controllers/paymentMethodController');
const { getSystemStats, getUserDetails, getAllUsersWithReferrals } = require('../controllers/adminStats.controller'); // ✅ नवीन
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Scanner = require('../models/Scanner');
const { default: mongoose } = require('mongoose');

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
// Get all users with complete referral details
router.get('/users-with-referrals', adminAuth, getAllUsersWithReferrals);

// Get single user details by ID
router.get('/user/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if userId is valid ObjectId
    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).select('-pin').populate('referredBy', 'userId email');
    } else {
      user = await User.findOne({ userId: userId }).select('-pin').populate('referredBy', 'userId email');
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Get user's transactions
    const transactions = await Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(50);
    
    // Get user's scanners
    const createdScanners = await Scanner.find({ user: user._id }).populate('acceptedBy', 'userId email');
    const acceptedScanners = await Scanner.find({ acceptedBy: user._id }).populate('user', 'userId email');
    
    // Get user's wallets
    const wallets = await Wallet.find({ user: user._id });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        wallets: wallets.reduce((acc, w) => ({ ...acc, [w.type]: w.balance }), {}),
        transactions,
        scanners: { created: createdScanners, accepted: acceptedScanners }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;