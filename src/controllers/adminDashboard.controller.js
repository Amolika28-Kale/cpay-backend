
const User = require('../models/User');
const Deposit = require('../models/Deposit');

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDeposits = await Deposit.countDocuments();
    const pendingDeposits = await Deposit.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalDeposits,
      pendingDeposits
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
