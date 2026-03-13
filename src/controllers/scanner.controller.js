// const Scanner = require("../models/Scanner");
// const Wallet = require("../models/Wallet");
// const Transaction = require("../models/Transaction");
// const mongoose = require("mongoose");
// const User = require("../models/User");
// const ReferralService = require("../../services/referralService");


// /* =========================================================
//    1️⃣ REQUEST TO PAY (User A creates request)
// ========================================================= */
// // exports.requestToPay = async (req, res) => {
// //   try {
// //     const { amount } = req.body;
// //     const userId = req.user.id;

// //     if (!amount || amount <= 0)
// //       return res.status(400).json({ message: "Invalid amount" });

// //     if (!req.file)
// //       return res.status(400).json({ message: "QR required" });

// //     const scanner = await Scanner.create({
// //       user: userId,
// //       amount: Number(amount),
// //       image: `/uploads/${req.file.filename}`,
// //       upiLink: req.body.upiLink,
// //       status: "ACTIVE"
// //     });

// //     res.status(201).json({
// //       message: "Request sent to all users",
// //       scanner
// //     });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };


// exports.requestToPay = async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const userId = req.user.id;

//     // ✅ Check if user can create pay request
//     const user = await User.findById(userId);
    
//     // If user has done first deposit but not first accept, block creating requests
//     if (user.firstDepositCompleted && !user.firstAcceptCompleted) {
//       return res.status(403).json({ 
//         message: "You must accept at least one payment request before creating your own" 
//       });
//     }

//     if (!amount || amount <= 0)
//       return res.status(400).json({ message: "Invalid amount" });

//     if (!req.file)
//       return res.status(400).json({ message: "QR required" });

//     const scanner = await Scanner.create({
//       user: userId,
//       amount: Number(amount),
//       image: `/uploads/${req.file.filename}`,
//       upiLink: req.body.upiLink,
//       status: "ACTIVE"
//     });

//     res.status(201).json({
//       message: "Request sent to all users",
//       scanner
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* =========================================================
//    2️⃣ GET ALL ACTIVE REQUESTS
// ========================================================= */
// exports.getActiveRequests = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const requests = await Scanner.find({
//       $or: [
//         { status: "ACTIVE" },
//         { acceptedBy: userId, status: { $in: ["ACCEPTED", "PAYMENT_SUBMITTED"] } },
//         { user: userId, status: { $in: ["ACCEPTED", "PAYMENT_SUBMITTED"] } }
//       ],
//       expiresAt: { $gt: new Date() }
//     })
//       .populate("user", "name")
//       .populate("acceptedBy", "name")
//       .sort({ createdAt: -1 });

//     res.json(requests);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };



// // // /* =========================================================
// // //    3️⃣ ACCEPT REQUEST (User B Accept)

// // exports.acceptRequest = async (req, res) => {
// //   try {
// //     const { scannerId } = req.body;
// //     const userId = req.user.id;

// //     const user = await User.findById(userId);
    
// //     if (!user) return res.status(404).json({ message: "User not found" });
// //     if (!user.walletActivated) return res.status(400).json({ message: "Please activate your wallet first" });
    
// //     // Amount check - daily limit पेक्षा जास्त तर नको
// //     const scanner = await Scanner.findById(scannerId);
// //     if (!scanner) return res.status(404).json({ message: "Scanner not found" });
    
// //     if (user.todayAcceptedTotal + scanner.amount > user.dailyAcceptLimit) {
// //       return res.status(400).json({ message: "Daily amount limit exceeded" });
// //     }

// //     // Update scanner
// //     scanner.status = "ACCEPTED";
// //     scanner.acceptedBy = userId;
// //     scanner.acceptedAt = new Date();
// //     await scanner.save();

// //     // Update user's daily totals - amount वाढवा
// //     user.todayAcceptedTotal = (user.todayAcceptedTotal || 0) + scanner.amount;
// //     user.todayAcceptedCount = (user.todayAcceptedCount || 0) + 1;
// //     await user.save();

// //     res.json({ message: "Request accepted successfully" });

// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // exports.acceptRequest = async (req, res) => {
// //   try {
// //     const { scannerId } = req.body;
// //     const userId = req.user.id;

// //     const user = await User.findById(userId);
    
// //     if (!user) return res.status(404).json({ message: "User not found" });
// //     if (!user.walletActivated) return res.status(400).json({ message: "Please activate your wallet first" });
    
// //     // Amount check - daily limit पेक्षा जास्त तर नको
// //     const scanner = await Scanner.findById(scannerId);
// //     if (!scanner) return res.status(404).json({ message: "Scanner not found" });
    
// //     if (user.todayAcceptedTotal + scanner.amount > user.dailyAcceptLimit) {
// //       return res.status(400).json({ message: "Daily amount limit exceeded" });
// //     }

// //     // Update scanner
// //     scanner.status = "ACCEPTED";
// //     scanner.acceptedBy = userId;
// //     scanner.acceptedAt = new Date();
// //     await scanner.save();

// //     // Update user's daily totals - amount वाढवा
// //     user.todayAcceptedTotal = (user.todayAcceptedTotal || 0) + scanner.amount;
// //     user.todayAcceptedCount = (user.todayAcceptedCount || 0) + 1;
    
// //     // ✅ Mark first accept completed
// //     if (!user.firstAcceptCompleted) {
// //       user.firstAcceptCompleted = true;
// //     }
    
// //     await user.save();

// //     res.json({ message: "Request accepted successfully" });

// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// exports.acceptRequest = async (req, res) => {
//   try {
//     const { scannerId } = req.body;
//     const userId = req.user.id;

//     const user = await User.findById(userId);
    
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (!user.walletActivated) return res.status(400).json({ message: "Please activate your wallet first" });
    
//     // Amount check - daily limit पेक्षा जास्त तर नको
//     const scanner = await Scanner.findById(scannerId);
//     if (!scanner) return res.status(404).json({ message: "Scanner not found" });
    
//     if (user.todayAcceptedTotal + scanner.amount > user.dailyAcceptLimit) {
//       return res.status(400).json({ message: "Daily amount limit exceeded" });
//     }

//     // Update scanner
//     scanner.status = "ACCEPTED";
//     scanner.acceptedBy = userId;
//     scanner.acceptedAt = new Date();
//     await scanner.save();

//     // Update user's daily totals - amount वाढवा
//     user.todayAcceptedTotal = (user.todayAcceptedTotal || 0) + scanner.amount;
//     user.todayAcceptedCount = (user.todayAcceptedCount || 0) + 1;
    
//     // ✅ Mark first accept completed
//     if (!user.firstAcceptCompleted) {
//       user.firstAcceptCompleted = true;
//     }
    
//     await user.save();

//     res.json({ message: "Request accepted successfully" });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// /* =========================================================
//    4️⃣ SUBMIT PAYMENT SCREENSHOT (User B)
// ========================================================= */
// exports.submitPayment = async (req, res) => {
//   try {
//     const { scannerId } = req.body;
//     const userId = req.user.id;

//     const scanner = await Scanner.findById(scannerId);

//     if (!scanner || scanner.status !== "ACCEPTED")
//       return res.status(400).json({ message: "Invalid state" });

//     if (scanner.acceptedBy.toString() !== userId)
//       return res.status(403).json({ message: "Not authorized" });

//     if (!req.file)
//       return res.status(400).json({ message: "Screenshot required" });

//     scanner.paymentScreenshot = `/uploads/${req.file.filename}`;
//     scanner.status = "PAYMENT_SUBMITTED";
//     scanner.paymentSubmittedAt = new Date();

//     await scanner.save();

//     res.json({ message: "Screenshot submitted successfully" });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };




// /* =========================================================
//    6️⃣ SELF PAY (1% CASHBACK)
// ========================================================= */
// exports.selfPay = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { amount } = req.body;
//     const userId = req.user.id;

//     const wallet = await Wallet.findOne({
//       user: userId,
//       type: "INR"
//     }).session(session);

//     if (!wallet || wallet.balance < amount)
//       throw new Error("Insufficient balance");

//     wallet.balance -= amount;
//     await wallet.save({ session });

//     const cashback = Number((amount * 0.01).toFixed(2));

//     let cashbackWallet = await Wallet.findOne({
//       user: userId,
//       type: "CASHBACK"
//     }).session(session);

//     if (!cashbackWallet) {
//       cashbackWallet = new Wallet({
//         user: userId,
//         type: "CASHBACK",
//         balance: 0
//       });
//     }

//     cashbackWallet.balance += cashback;
//     await cashbackWallet.save({ session });

//     /* ================= REFERRAL COMMISSION ON SELF PAY ================= */
//     const currentUser = await User.findById(userId).session(session);

//     if (currentUser.referredBy) {
//       const referralBonus = Number((amount * 0.01).toFixed(2));
//       const referrerId = currentUser.referredBy;

//       let refWallet = await Wallet.findOne({
//         user: referrerId,
//         type: "CASHBACK"
//       }).session(session);

//       if (!refWallet) {
//         refWallet = new Wallet({
//           user: referrerId,
//           type: "CASHBACK",
//           balance: 0
//         });
//       }

//       refWallet.balance += referralBonus;
//       await refWallet.save({ session });

//       await User.findByIdAndUpdate(referrerId, {
//         $inc: { referralEarnings: referralBonus }
//       }).session(session);

//       // FIXED: Added toWallet field
//       await Transaction.create([{
//         user: referrerId,
//         type: "CASHBACK",
//         fromWallet: "INR",
//         toWallet: "CASHBACK",
//         amount: referralBonus,
//         meta: { type: "SELF_PAY_REFERRAL" }
//       }], { session });
//     }

//     // FIXED: Single transaction with both fromWallet and toWallet
//     await Transaction.create([{
//       user: userId,
//       type: "SELF_PAY",
//       fromWallet: "INR",
//       toWallet: "CASHBACK", // Changed from null to CASHBACK
//       amount: amount,
//       meta: { 
//         type: "SELF_PAY",
//         cashbackEarned: cashback 
//       }
//     }], { session });

//     await session.commitTransaction();
//     session.endSession();

//     res.json({
//       message: "Self payment successful",
//       cashbackEarned: cashback
//     });

//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(400).json({ message: err.message });
//   }
// };

// /* =========================================================
//    7️⃣ ADMIN: GET ALL SCANNERS (FOR ADMIN DASHBOARD)
// ========================================================= */
// exports.getAllScanners = async (req, res) => {
//   try {
//     // Admin needs to see everything: Active, Accepted, Submitted, Completed, and Expired
//     const allScanners = await Scanner.find()
//       .populate("user", "name email")       // See who created it
//       .populate("acceptedBy", "name email") // See who is paying it
//       .sort({ createdAt: -1 });

//     res.json(allScanners);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// // Activate wallet for daily accepting
// exports.activateWallet = async (req, res) => {
//   const session = await mongoose.startSession();
  
//   try {
//     session.startTransaction({
//       readPreference: 'primary',
//       readConcern: { level: 'local' },
//       writeConcern: { w: 'majority' }
//     });

//     const userId = req.user.id;
//     const { dailyLimit, activationAmount } = req.body;

//     const user = await User.findById(userId).session(session);
//     if (!user) {
//       throw new Error("User not found");
//     }

//     // ✅ Check if wallet is already activated
//     if (user.walletActivated) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ 
//         message: "Wallet already activated",
//         dailyLimit: user.dailyAcceptLimit 
//       });
//     }

//     // ✅ USDT wallet मध्ये activation amount ADD करा
//     let usdtWallet = await Wallet.findOne({ 
//       user: userId, 
//       type: "USDT" 
//     }).session(session);

//     if (!usdtWallet) {
//       usdtWallet = new Wallet({
//         user: userId,
//         type: "USDT",
//         balance: 0
//       });
//     }

//     usdtWallet.balance += activationAmount;
//     await usdtWallet.save({ session });

//     // ✅ INR wallet मध्ये 95x amount add करा
//     const conversionRate = 95;
//     const inrAmount = activationAmount * conversionRate;

//     let inrWallet = await Wallet.findOne({ 
//       user: userId, 
//       type: "INR" 
//     }).session(session);

//     if (!inrWallet) {
//       inrWallet = new Wallet({
//         user: userId,
//         type: "INR",
//         balance: 0
//       });
//     }

//     inrWallet.balance += inrAmount;
//     await inrWallet.save({ session });

//     // ✅ Transaction records
//     await Transaction.create([
//       {
//         user: userId,
//         type: "DEPOSIT",
//         fromWallet: null,
//         toWallet: "USDT",
//         amount: activationAmount,
//         meta: {
//           currency: "USDT",
//           type: "ACTIVATION_DEPOSIT"
//         }
//       },
//       {
//         user: userId,
//         type: "CONVERSION",
//         fromWallet: "USDT",
//         toWallet: "INR",
//         amount: inrAmount,
//         meta: {
//           rate: conversionRate,
//           originalAmount: activationAmount,
//           originalCurrency: "USDT",
//           type: "ACTIVATION_CONVERSION"
//         }
//       },
//       {
//         user: userId,
//         type: "WALLET_ACTIVATION",
//         fromWallet: "USDT",
//         toWallet: "INR",
//         amount: activationAmount,
//         meta: {
//           usdtAmount: activationAmount,
//           inrAmount: inrAmount,
//           rate: conversionRate,
//           dailyLimit: dailyLimit,
//           type: "ACTIVATION"
//         }
//       }
//     ], { session });

//     // ✅ User activation status update
//     user.walletActivated = true;
//     user.activationDate = new Date();
//     user.dailyAcceptLimit = dailyLimit;
//     user.todayAcceptedTotal = 0;
//     user.todayAcceptedCount = 0;
//     await user.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.json({ 
//       message: "Wallet activated successfully",
//       dailyLimit,
//       activationAmount,
//       inrAmount,
//       usdtBalance: usdtWallet.balance,
//       inrBalance: inrWallet.balance
//     });

//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Wallet activation error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // // controllers/scanner.controller.js
// // exports.checkWalletActivation = async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user.id);
    
// //     // Reset if it's a new day
// //     const lastActivation = user.activationDate;
// //     const today = new Date();
// //     today.setHours(0, 0, 0, 0);

// //     if (lastActivation && lastActivation < today) {
// //       user.walletActivated = false;
// //       user.todayAcceptedTotal = 0; // amount रीसेट
// //       user.todayAcceptedCount = 0; // count रीसेट
// //       await user.save();
// //     }

// //     res.json({
// //       activated: user.walletActivated,
// //       dailyLimit: user.dailyAcceptLimit || 1000,
// //       todayAccepted: user.todayAcceptedTotal || 0, // amount दाखवा
// //       remaining: user.walletActivated ? (user.dailyAcceptLimit || 1000) - (user.todayAcceptedTotal || 0) : 0
// //     });

// //   } catch (err) {
// //     console.error("Check activation error:", err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// exports.checkWalletActivation = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
    
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Reset if it's a new day
//     const lastActivation = user.activationDate;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // जर activation झालं असेल पण ते आजचं नसेल तर reset करा
//     if (user.walletActivated && lastActivation) {
//       const activationDay = new Date(lastActivation);
//       activationDay.setHours(0, 0, 0, 0);
      
//       // जर activation दुसऱ्या दिवशीचं असेल तर reset
//       if (activationDay < today) {
//         console.log("New day detected - resetting activation");
//         user.walletActivated = false;
//         user.todayAcceptedTotal = 0;
//         user.todayAcceptedCount = 0;
//         await user.save();
//       }
//     }

//     res.json({
//       activated: user.walletActivated || false,
//       dailyLimit: user.walletActivated ? user.dailyAcceptLimit : 0,
//       todayAccepted: user.todayAcceptedTotal || 0,
//       remaining: user.walletActivated ? (user.dailyAcceptLimit - (user.todayAcceptedTotal || 0)) : 0,
//       activationDate: user.activationDate,
//       firstDepositCompleted: user.firstDepositCompleted || false,
//       firstAcceptCompleted: user.firstAcceptCompleted || false
//     });

//   } catch (err) {
//     console.error("Check activation error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // // Updated confirm payment with correct logic
// // exports.confirmFinalPayment = async (req, res) => {
// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     const { scannerId } = req.body;
// //     const userId = req.user.id; // This is User A (Creator)

// //     const scanner = await Scanner.findById(scannerId).session(session);
// //     if (!scanner) throw new Error("Request not found");
// //     if (scanner.status !== "PAYMENT_SUBMITTED") throw new Error("Payment proof not yet submitted");
// //     if (scanner.user.toString() !== userId) throw new Error("Unauthorized: Only creator can confirm");

// //     const acceptorId = scanner.acceptedBy; // This is User B (Acceptor)
// //     const amount = scanner.amount;

// //     console.log("Confirming payment:", {
// //       creatorId: userId,
// //       acceptorId: acceptorId,
// //       amount: amount
// //     });

// //     // ✅ STEP 1: Debit from Creator (User A)
// //     const creatorWallet = await Wallet.findOne({ user: userId, type: "INR" }).session(session);
// //     if (!creatorWallet || creatorWallet.balance < amount) {
// //       throw new Error("Creator's INR balance is too low");
// //     }
// //     creatorWallet.balance -= amount;
// //     await creatorWallet.save({ session });
// //     console.log(`Debited ₹${amount} from Creator (User A): ${userId}`);

// //     // ✅ STEP 2: Credit to Acceptor (User B)
// //     let acceptorWallet = await Wallet.findOne({ user: acceptorId, type: "INR" }).session(session);
// //     if (!acceptorWallet) {
// //       acceptorWallet = new Wallet({ user: acceptorId, type: "INR", balance: 0 });
// //     }
// //     acceptorWallet.balance += amount;
// //     await acceptorWallet.save({ session });
// //     console.log(`Credited ₹${amount} to Acceptor (User B): ${acceptorId}`);

// //     /* ================ CASHBACK DISTRIBUTION ================ */
// //     // 🔥 Cashback for Creator (User A) - 1%
// //     const creatorCashback = Number((amount * 0.01).toFixed(2));
// //     let creatorCashbackWallet = await Wallet.findOne({ user: userId, type: "CASHBACK" }).session(session);
// //     if (!creatorCashbackWallet) {
// //       creatorCashbackWallet = new Wallet({ user: userId, type: "CASHBACK", balance: 0 });
// //     }
// //     creatorCashbackWallet.balance += creatorCashback;
// //     await creatorCashbackWallet.save({ session });
// //     console.log(`Creator Cashback: ₹${creatorCashback}`);

// //     // 🔥 Cashback for Acceptor (User B) - 5%
// //     const acceptorCashback = Number((amount * 0.05).toFixed(2));
// //     let acceptorCashbackWallet = await Wallet.findOne({ user: acceptorId, type: "CASHBACK" }).session(session);
// //     if (!acceptorCashbackWallet) {
// //       acceptorCashbackWallet = new Wallet({ user: acceptorId, type: "CASHBACK", balance: 0 });
// //     }
// //     acceptorCashbackWallet.balance += acceptorCashback;
// //     await acceptorCashbackWallet.save({ session });
// //     console.log(`Acceptor Cashback: ₹${acceptorCashback}`);

// //     // Update scanner status
// //     scanner.status = "COMPLETED";
// //     scanner.completedAt = new Date();
// //     await scanner.save({ session });

// //     // Create ledger transactions
// //     const transactions = [
// //       { user: userId, type: "DEBIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId, meta: { type: "PAYMENT_SENT_TO_ACCEPTOR" } },
// //       { user: acceptorId, type: "CREDIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId, meta: { type: "PAYMENT_RECEIVED_FROM_CREATOR" } },
// //       { user: userId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: creatorCashback, relatedScanner: scannerId, meta: { type: "CREATOR_CASHBACK" } },
// //       { user: acceptorId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: acceptorCashback, relatedScanner: scannerId, meta: { type: "ACCEPTOR_CASHBACK" } }
// //     ];

// //     await Transaction.insertMany(transactions, { session });

// //     /* ================ REFERRAL COMMISSION (1%) ================ */
// //     const acceptorUser = await User.findById(acceptorId).session(session);
// //     if (acceptorUser && acceptorUser.referredBy) {
// //       const referrerId = acceptorUser.referredBy;
// //       const referralBonus = Number((amount * 0.01).toFixed(2));

// //       // ✅ FIXED: Update specific fields in referralEarnings object
// //       await Wallet.findOneAndUpdate(
// //         { user: referrerId, type: "CASHBACK" },
// //         { $inc: { balance: referralBonus } },
// //         { upsert: true, session }
// //       );

// //       // ✅ FIXED: Update referralEarnings.total instead of the whole object
// //       await User.findByIdAndUpdate(
// //         referrerId, 
// //         { 
// //           $inc: { 
// //             'referralEarnings.total': referralBonus,
// //             'referralEarnings.level1': referralBonus // Assuming this is level 1 commission
// //           } 
// //         },
// //         { session }
// //       );

// //       await Transaction.create([{
// //         user: referrerId,
// //         type: "CASHBACK",
// //         fromWallet: "INR",
// //         toWallet: "CASHBACK",
// //         amount: referralBonus,
// //         relatedScanner: scannerId,
// //         meta: { type: "REFERRAL_COMMISSION" }
// //       }], { session });
// //     }

// //     // Process team cashback for both users' uplines
// //     await session.commitTransaction();
// //     session.endSession();

// //     // Team cashback processing - transaction commit नंतर
// //     try {
// //       await ReferralService.processTeamCashback(userId, creatorCashback, 'CREATOR_CASHBACK', scannerId);
// //     } catch (err) {
// //       console.error("Error processing team cashback for creator:", err);
// //     }
    
// //     try {
// //       await ReferralService.processTeamCashback(acceptorId, acceptorCashback, 'ACCEPTOR_CASHBACK', scannerId);
// //     } catch (err) {
// //       console.error("Error processing team cashback for acceptor:", err);
// //     }
    
// //     res.json({ 
// //       message: "Transaction successful",
// //       transaction: {
// //         amount,
// //         creatorId: userId,
// //         acceptorId,
// //         creatorCashback,
// //         acceptorCashback
// //       }
// //     });

// //   } catch (err) {
// //     console.error("Confirm payment error:", err);
// //     await session.abortTransaction();
// //     session.endSession();
// //     res.status(400).json({ message: err.message });
// //   }
// // };

// // Updated confirm payment with correct logic
// exports.confirmFinalPayment = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { scannerId } = req.body;
//     const userId = req.user.id; // This is User A (Creator)

//     const scanner = await Scanner.findById(scannerId).session(session);
//     if (!scanner) throw new Error("Request not found");
//     if (scanner.status !== "PAYMENT_SUBMITTED") throw new Error("Payment proof not yet submitted");
//     if (scanner.user.toString() !== userId) throw new Error("Unauthorized: Only creator can confirm");

//     const acceptorId = scanner.acceptedBy; // This is User B (Acceptor)
//     const amount = scanner.amount;

//     // console.log("Confirming payment:", {
//     //   creatorId: userId,
//     //   acceptorId: acceptorId,
//     //   amount: amount
//     // });

//     // ✅ STEP 1: Debit from Creator (User A)
//     const creatorWallet = await Wallet.findOne({ user: userId, type: "INR" }).session(session);
//     if (!creatorWallet || creatorWallet.balance < amount) {
//       throw new Error("Creator's INR balance is too low");
//     }
//     creatorWallet.balance -= amount;
//     await creatorWallet.save({ session });
//     // console.log(`Debited ₹${amount} from Creator (User A): ${userId}`);

//     // ✅ STEP 2: Credit to Acceptor (User B)
//     let acceptorWallet = await Wallet.findOne({ user: acceptorId, type: "INR" }).session(session);
//     if (!acceptorWallet) {
//       acceptorWallet = new Wallet({ user: acceptorId, type: "INR", balance: 0 });
//     }
//     acceptorWallet.balance += amount;
//     await acceptorWallet.save({ session });
//     // console.log(`Credited ₹${amount} to Acceptor (User B): ${acceptorId}`);

//     /* ================ CASHBACK DISTRIBUTION ================ */
//     // 🔥 Cashback for Creator (User A) - 4%
//     const creatorCashback = Number((amount * 0.04).toFixed(2)); // 1% वरून 4% केले
//     let creatorCashbackWallet = await Wallet.findOne({ user: userId, type: "CASHBACK" }).session(session);
//     if (!creatorCashbackWallet) {
//       creatorCashbackWallet = new Wallet({ user: userId, type: "CASHBACK", balance: 0 });
//     }
//     creatorCashbackWallet.balance += creatorCashback;
//     await creatorCashbackWallet.save({ session });
//     // console.log(`Creator Cashback (4%): ₹${creatorCashback}`);

//     // 🔥 Cashback for Acceptor (User B) - 5%
//     const acceptorCashback = Number((amount * 0.05).toFixed(2));
//     let acceptorCashbackWallet = await Wallet.findOne({ user: acceptorId, type: "CASHBACK" }).session(session);
//     if (!acceptorCashbackWallet) {
//       acceptorCashbackWallet = new Wallet({ user: acceptorId, type: "CASHBACK", balance: 0 });
//     }
//     acceptorCashbackWallet.balance += acceptorCashback;
//     await acceptorCashbackWallet.save({ session });
//     // console.log(`Acceptor Cashback: ₹${acceptorCashback}`);

//     // Update scanner status
//     scanner.status = "COMPLETED";
//     scanner.completedAt = new Date();
//     await scanner.save({ session });

//     // Create ledger transactions
//     const transactions = [
//       { user: userId, type: "DEBIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId, meta: { type: "PAYMENT_SENT_TO_ACCEPTOR" } },
//       { user: acceptorId, type: "CREDIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId, meta: { type: "PAYMENT_RECEIVED_FROM_CREATOR" } },
//       { user: userId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: creatorCashback, relatedScanner: scannerId, meta: { type: "CREATOR_CASHBACK" } },
//       { user: acceptorId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: acceptorCashback, relatedScanner: scannerId, meta: { type: "ACCEPTOR_CASHBACK" } }
//     ];

//     await Transaction.insertMany(transactions, { session });

//     /* ================ REFERRAL COMMISSION (OLD - REMOVE THIS) ================ */
//     // हा भाग काढून टाका कारण आता ReferralService हे सगळं हँडल करेल
//     /*
//     const acceptorUser = await User.findById(acceptorId).session(session);
//     if (acceptorUser && acceptorUser.referredBy) {
//       const referrerId = acceptorUser.referredBy;
//       const referralBonus = Number((amount * 0.01).toFixed(2));

//       await Wallet.findOneAndUpdate(
//         { user: referrerId, type: "CASHBACK" },
//         { $inc: { balance: referralBonus } },
//         { upsert: true, session }
//       );

//       await User.findByIdAndUpdate(
//         referrerId, 
//         { 
//           $inc: { 
//             'referralEarnings.total': referralBonus,
//             'referralEarnings.level1': referralBonus
//           } 
//         },
//         { session }
//       );

//       await Transaction.create([{
//         user: referrerId,
//         type: "CASHBACK",
//         fromWallet: "INR",
//         toWallet: "CASHBACK",
//         amount: referralBonus,
//         relatedScanner: scannerId,
//         meta: { type: "REFERRAL_COMMISSION" }
//       }], { session });
//     }
//     */

//     await session.commitTransaction();
//     session.endSession();

//     // ✅ Team cashback processing - transaction commit नंतर (नवीन 21-Level system)
//     try {
//       // Creator च्या cashback वर team cashback
//       await ReferralService.processTeamCashback(userId, creatorCashback, 'CREATOR_CASHBACK', scannerId);
//     } catch (err) {
//       console.error("Error processing team cashback for creator:", err);
//     }
    
//     try {
//       // Acceptor च्या cashback वर team cashback
//       await ReferralService.processTeamCashback(acceptorId, acceptorCashback, 'ACCEPTOR_CASHBACK', scannerId);
//     } catch (err) {
//       console.error("Error processing team cashback for acceptor:", err);
//     }
    
//     res.json({ 
//       message: "Transaction successful",
//       transaction: {
//         amount,
//         creatorId: userId,
//         acceptorId,
//         creatorCashback,
//         acceptorCashback
//       }
//     });

//   } catch (err) {
//     console.error("Confirm payment error:", err);
//     await session.abortTransaction();
//     session.endSession();
//     res.status(400).json({ message: err.message });
//   }
// };



// //    5️⃣ FINAL CONFIRM (User A clicks DONE) - UPDATED WITH CASHBACK FOR CREATOR




// // ========================================================= */
// // exports.confirmFinalPayment = async (req, res) => {
// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     const { scannerId } = req.body;
// //     const userId = req.user.id;

// //     const scanner = await Scanner.findById(scannerId).session(session);

// //     if (!scanner) throw new Error("Request not found");
// //     if (scanner.status !== "PAYMENT_SUBMITTED") throw new Error("Payment proof not yet submitted");
// //     if (scanner.user.toString() !== userId) throw new Error("Unauthorized: Only creator can confirm");

// //     const payerId = scanner.acceptedBy;
// //     const amount = scanner.amount;

// //     // 1. Deduct Creator (User A)
// //     const userAWallet = await Wallet.findOne({ user: userId, type: "INR" }).session(session);
// //     if (!userAWallet || userAWallet.balance < amount) throw new Error("Your INR balance is too low to confirm");

// //     userAWallet.balance -= amount;
// //     await userAWallet.save({ session });

// //     // 2. Credit Payer (User B)
// //     let userBWallet = await Wallet.findOne({ user: payerId, type: "INR" }).session(session);
// //     if (!userBWallet) {
// //       userBWallet = new Wallet({ user: payerId, type: "INR", balance: 0 });
// //     }
// //     userBWallet.balance += amount;
// //     await userBWallet.save({ session });

// //     /* ================ CASHBACK DISTRIBUTION ================ */
// //     // 🔥 Cashback for Creator (User A) - 1%
// //     const creatorCashback = Number((amount * 0.01).toFixed(2));
// //     let creatorCashbackWallet = await Wallet.findOne({ user: userId, type: "CASHBACK" }).session(session);
// //     if (!creatorCashbackWallet) {
// //       creatorCashbackWallet = new Wallet({ user: userId, type: "CASHBACK", balance: 0 });
// //     }
// //     creatorCashbackWallet.balance += creatorCashback;
// //     await creatorCashbackWallet.save({ session });

// //     // 🔥 Cashback for Payer (User B) - 5%
// //     const payerCashback = Number((amount * 0.05).toFixed(2));
// //     let payerCashbackWallet = await Wallet.findOne({ user: payerId, type: "CASHBACK" }).session(session);
// //     if (!payerCashbackWallet) {
// //       payerCashbackWallet = new Wallet({ user: payerId, type: "CASHBACK", balance: 0 });
// //     }
// //     payerCashbackWallet.balance += payerCashback;
// //     await payerCashbackWallet.save({ session });

// //     /* ================ REFERRAL COMMISSION (1%) ================ */
// //     const payerUser = await User.findById(payerId).session(session);
// //     if (payerUser && payerUser.referredBy) {
// //       const referrerId = payerUser.referredBy;
// //       const referralBonus = Number((amount * 0.01).toFixed(2));

// //       await Wallet.findOneAndUpdate(
// //         { user: referrerId, type: "CASHBACK" },
// //         { $inc: { balance: referralBonus } },
// //         { upsert: true, session }
// //       );

// //       await User.findByIdAndUpdate(referrerId, { $inc: { referralEarnings: referralBonus } }).session(session);

// //       await Transaction.create([{
// //         user: referrerId,
// //         type: "CASHBACK",
// //         fromWallet: "INR",
// //         toWallet: "CASHBACK",
// //         amount: referralBonus,
// //         relatedScanner: scannerId,
// //         meta: { type: "REFERRAL_COMMISSION" }
// //       }], { session });
// //     }

// //     // 5. Update Status
// //     scanner.status = "COMPLETED";
// //     scanner.completedAt = new Date();
// //     await scanner.save({ session });

// //     // 6. Create Ledger Transactions
// //     await Transaction.create([
// //       { user: userId, type: "DEBIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId },
// //       { user: payerId, type: "CREDIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId },
// //       { user: userId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: creatorCashback, relatedScanner: scannerId, meta: { type: "CREATOR_CASHBACK" } },
// //       { user: payerId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: payerCashback, relatedScanner: scannerId, meta: { type: "PAYER_CASHBACK" } }
// //     ], { session });

// //     await session.commitTransaction();
// //     session.endSession();
    
// //     res.json({ 
// //       message: "Transaction successful", 
// //       creatorCashback,
// //       payerCashback 
// //     });

// //   } catch (err) {
// //     if (session.inTransaction()) await session.abortTransaction();
// //     session.endSession();
// //     res.status(400).json({ message: err.message });
// //   }
// // };

// // // Updated accept request with daily limit check
// // exports.acceptRequest = async (req, res) => {
// //   try {
// //     const { scannerId } = req.body;
// //     const userId = req.user.id;

// //     // Check wallet activation and daily limit
// //     const user = await User.findById(userId);
    
// //     if (!user.walletActivated) {
// //       return res.status(400).json({ message: "Please activate your wallet first" });
// //     }

// //     if (user.todayAcceptedCount >= user.dailyAcceptLimit) {
// //       return res.status(400).json({ message: "Daily accept limit reached" });
// //     }

// //     const scanner = await Scanner.findOneAndUpdate(
// //       {
// //         _id: scannerId,
// //         status: "ACTIVE"
// //       },
// //       {
// //         status: "ACCEPTED",
// //         acceptedBy: userId,
// //         acceptedAt: new Date()
// //       },
// //       { new: true }
// //     );

// //     if (!scanner) {
// //       return res.status(400).json({ message: "Already accepted or expired" });
// //     }

// //     // Increment today's accepted count
// //     user.todayAcceptedCount += 1;
// //     await user.save();

// //     res.json({
// //       message: "Request accepted successfully"
// //     });

// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };


const Scanner = require("../models/Scanner");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const User = require("../models/User");
const ReferralService = require("../../services/referralService");
const AutoRequestService = require("../../services/autoRequestService"); // ✅ Import Auto Request Service
const fs = require('fs'); // File system for cleanup

/* =========================================================
   1️⃣ REQUEST TO PAY (User A creates request)
========================================================= */
// exports.requestToPay = async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const userId = req.user.id;

//     const user = await User.findById(userId);
    
//     if (user.firstDepositCompleted && !user.firstAcceptCompleted) {
//       return res.status(403).json({ 
//         message: "You must accept at least one payment request before creating your own" 
//       });
//     }

//     if (!amount || amount <= 0)
//       return res.status(400).json({ message: "Invalid amount" });

//     if (!req.file)
//       return res.status(400).json({ message: "QR required" });

//     const expiresAt = new Date();
//     expiresAt.setMinutes(expiresAt.getMinutes() + 10);

//     const scanner = await Scanner.create({
//       user: userId,
//       amount: Number(amount),
//       image: `/uploads/${req.file.filename}`,
//       upiLink: req.body.upiLink,
//       status: "ACTIVE",
//       expiresAt: expiresAt,
//       isAutoRequest: false // Not auto request
//     });

//     res.status(201).json({
//       message: "Request sent to all users",
//       scanner
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


exports.requestToPay = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    // ========== 1. USER VALIDATION ==========
    const user = await User.findById(userId);
    if (!user) {
      // Clean up uploaded file if user not found
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user can create request
    if (user.firstDepositCompleted && !user.firstAcceptCompleted) {
      // Clean up uploaded file
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ 
        message: "You must accept at least one payment request before creating your own" 
      });
    }

    // ========== 2. AMOUNT VALIDATION ==========
    if (!amount || amount <= 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Invalid amount" });
    }

    const requestAmount = Number(amount);

    // ========== 3. FILE VALIDATION ==========
    if (!req.file) {
      return res.status(400).json({ message: "QR code image is required" });
    }

    // ✅ File type validation
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: "Invalid file type. Please upload QR code image (JPEG, PNG)" 
      });
    }

    // ✅ File size validation (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "File too large. Maximum size is 5MB" });
    }

    // ========== 4. BALANCE CHECK ==========
    // Get user's INR wallet
    const inrWallet = await Wallet.findOne({ 
      user: userId, 
      type: "INR" 
    });

    if (!inrWallet) {
      // If no INR wallet exists, create one with zero balance
      // But user shouldn't be able to create request with zero balance
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: "Insufficient balance. Please deposit funds first.",
        requiresDeposit: true
      });
    }

    // Check if user has sufficient balance
    if (inrWallet.balance < requestAmount) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: `Insufficient balance. You have ₹${inrWallet.balance} but need ₹${requestAmount}. Please deposit more funds.`,
        requiresDeposit: true,
        currentBalance: inrWallet.balance,
        requiredAmount: requestAmount,
        shortfall: requestAmount - inrWallet.balance
      });
    }

    // ========== 5. CREATE SCANNER REQUEST ==========
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const scanner = await Scanner.create({
      user: userId,
      amount: requestAmount,
      image: `/uploads/${req.file.filename}`,
      upiLink: req.body.upiLink || "",
      status: "ACTIVE",
      expiresAt: expiresAt,
      isAutoRequest: false
    });

    // ========== 6. SUCCESS RESPONSE ==========
    res.status(201).json({
      message: "Payment request created successfully",
      scanner,
      balance: {
        remaining: inrWallet.balance - requestAmount,
        deducted: requestAmount
      }
    });

  } catch (err) {
    // Clean up file if error occurs
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    }
    
    console.error("❌ Request to pay error:", err);
    res.status(500).json({ 
      message: err.message || "Failed to create payment request" 
    });
  }
};
/* =========================================================
   2️⃣ GET ALL ACTIVE REQUESTS
========================================================= */
// exports.getActiveRequests = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Get user for 7-day limit check
//     const user = await User.findById(userId);
    
//     // Check 7-day reset
//     user.checkAndResetSevenDay();

//     const requests = await Scanner.find({
//       $or: [
//         // System requests
//         {
//           user: null,
//           status: "ACTIVE",
//           isAutoRequest: true,
//           expiresAt: { $gt: new Date() }
//         },
//         // Other users active requests
//         {
//           user: { $nin: [userId, null] },
//           status: "ACTIVE",
//           expiresAt: { $gt: new Date() }
//         },
//         // Requests accepted by this user (any status except COMPLETED)
//         {
//           acceptedBy: userId,
//           status: { $in: ["ACCEPTED", "PAYMENT_SUBMITTED"] }
//         },
//         // ✅ FIXED: OWN REQUESTS - सगळे दाखवा (ACTIVE, ACCEPTED, PAYMENT_SUBMITTED, COMPLETED)
//         {
//           user: userId
//           // काहीही condition नको - सगळे requests दाखवा
//         }
//       ]
//     })
//     .populate("user", "name userId")
//     .populate("acceptedBy", "name userId")
//     .sort({ createdAt: -1 });

//     // ✅ Add remaining limit info to response headers or separate field
//     res.json({
//       requests,
//       limitInfo: {
//         dailyLimit: user.dailyAcceptLimit,
//         sevenDayTotalAccepted: user.sevenDayTotalAccepted,
//         remaining: user.dailyAcceptLimit - user.sevenDayTotalAccepted,
//         remainingDays: user.getRemainingDays()
//       }
//     });

//   } catch (err) {
//     console.error("❌ Error in getActiveRequests:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


/* =========================================================
   2️⃣ GET ALL ACTIVE REQUESTS (UPDATED - Hide accepted requests)
========================================================= */
exports.getActiveRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user for 7-day limit check
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check 7-day reset
    user.checkAndResetSevenDay();

    const requests = await Scanner.find({
      $or: [
        // ✅ System requests - फक्त ACTIVE (ACCEPTED नाही)
        {
          user: null,
          status: "ACTIVE",  // Only ACTIVE, not ACCEPTED
          isAutoRequest: true,
          expiresAt: { $gt: new Date() }
        },
        // ✅ Other users requests - फक्त ACTIVE (ACCEPTED नाही)
        {
          user: { $nin: [userId, null] },
          status: "ACTIVE",  // Only ACTIVE, not ACCEPTED
          expiresAt: { $gt: new Date() }
        },
        // ✅ Requests accepted by this user (सगळे status दाखवा - फक्त या यूजरला)
        {
          acceptedBy: userId,
          status: { $in: ["ACCEPTED", "PAYMENT_SUBMITTED"] }
        },
        // ✅ OWN REQUESTS - सगळे status दाखवा
        {
          user: userId
        }
      ]
    })
    .populate("user", "name userId")
    .populate("acceptedBy", "name userId")
    .sort({ createdAt: -1 });

    res.json({
      requests,
      limitInfo: {
        dailyLimit: user.dailyAcceptLimit || 0,
        sevenDayTotalAccepted: user.sevenDayTotalAccepted || 0,
        remaining: (user.dailyAcceptLimit || 0) - (user.sevenDayTotalAccepted || 0),
        remainingDays: user.getRemainingDays() || 0
      }
    });

  } catch (err) {
    console.error("❌ Error in getActiveRequests:", err);
    res.status(500).json({ message: err.message });
  }
};


  //  3️⃣ ACCEPT REQUEST (User B Accept) - UPDATED for Auto Request
// exports.acceptRequest = async (req, res) => {
//   try {
//     const { scannerId } = req.body;
//     const userId = req.user.id;

//     const user = await User.findById(userId);
//     const scanner = await Scanner.findById(scannerId);
    
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (!scanner) return res.status(404).json({ message: "Scanner not found" });
    
//     // Check if wallet is activated
//     if (!user.walletActivated) {
//       return res.status(400).json({ message: "Please activate your wallet first" });
//     }
    
//     // Check if activation expired (7 days)
//     if (user.isActivationExpired()) {
//       user.walletActivated = false;
//       await user.save();
//       return res.status(400).json({ message: "Wallet activation expired. Please activate again." });
//     }
    
//     // Check 7-day limit
//     user.checkAndResetSevenDay();
    
//     // ✅ FIX: Check if amount exceeds remaining 7-day limit
//     // BUT DO NOT DEDUCT YET - only check
//     if (user.sevenDayTotalAccepted + scanner.amount > user.dailyAcceptLimit) {
//       return res.status(400).json({ 
//         message: "7-day amount limit exceeded",
//         remaining: user.dailyAcceptLimit - user.sevenDayTotalAccepted
//       });
//     }

//     // ✅ UPDATE SCANNER ONLY - NO 7-DAY DEDUCTION
//     scanner.status = "ACCEPTED";
//     scanner.acceptedBy = userId;
//     scanner.acceptedAt = new Date();
//     await scanner.save();

//     // ✅ DO NOT UPDATE 7-DAY TOTAL HERE - REMOVED THIS LINE
//     // user.sevenDayTotalAccepted = (user.sevenDayTotalAccepted || 0) + scanner.amount; ❌ REMOVED
    
//     user.todayAcceptedCount = (user.todayAcceptedCount || 0) + 1;
    
//     if (!user.firstAcceptCompleted) {
//       user.firstAcceptCompleted = true;
//     }
    
//     await user.save();

//     // ✅ If it's an AUTO REQUEST, schedule auto-confirm
//     let autoConfirmMessage = null;
//     if (scanner.isAutoRequest) {
//       AutoRequestService.handleAcceptedRequest(scannerId);
//       autoConfirmMessage = "Auto request will be confirmed in 1 minute after proof submission.";
//     }

//     res.json({ 
//       message: "Request accepted successfully",
//       info: autoConfirmMessage || "Balance will be deducted after transaction completion"
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

/* =========================================================
   3️⃣ ACCEPT REQUEST (WITH CONCURRENCY CONTROL)
========================================================= */
exports.acceptRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { scannerId } = req.body;
    const userId = req.user.id;

    // Get user
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }
    
    // ✅ CRITICAL: फक्त ACTIVE आणि नॉन-एक्सपायर्ड requests शोधा
    const scanner = await Scanner.findOne({ 
      _id: scannerId, 
      status: "ACTIVE",  // Only ACTIVE requests can be accepted
      expiresAt: { $gt: new Date() } // Not expired
    }).session(session);
    
    if (!scanner) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        message: "This request has already been accepted by someone else or has expired",
        code: "ALREADY_ACCEPTED"
      });
    }
    
    // Check if user is trying to accept their own request
    if (scanner.user && scanner.user.toString() === userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "You cannot accept your own request" });
    }
    
    // Check if wallet is activated
    if (!user.walletActivated) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Please activate your wallet first" });
    }
    
    // Check if activation expired (7 days)
    if (user.isActivationExpired()) {
      user.walletActivated = false;
      await user.save({ session });
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Wallet activation expired. Please activate again." });
    }
    
    // Check 7-day limit
    user.checkAndResetSevenDay();
    
    // Check if amount exceeds remaining 7-day limit
    if (user.sevenDayTotalAccepted + scanner.amount > user.dailyAcceptLimit) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: "7-day amount limit exceeded",
        remaining: user.dailyAcceptLimit - user.sevenDayTotalAccepted
      });
    }

    // ✅ UPDATE SCANNER - Mark as accepted
    scanner.status = "ACCEPTED";
    scanner.acceptedBy = userId;
    scanner.acceptedAt = new Date();
    await scanner.save({ session });

    // Update user stats
    user.todayAcceptedCount = (user.todayAcceptedCount || 0) + 1;
    
    if (!user.firstAcceptCompleted) {
      user.firstAcceptCompleted = true;
    }
    
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    // If it's an AUTO REQUEST, schedule auto-confirm
    let autoConfirmMessage = null;
    if (scanner.isAutoRequest) {
      AutoRequestService.handleAcceptedRequest(scannerId);
      autoConfirmMessage = "Auto request will be confirmed in 1 minute after proof submission.";
    }

    res.json({ 
      message: "Request accepted successfully",
      info: autoConfirmMessage || "Balance will be deducted after transaction completion"
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Accept request error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================================================
   4️⃣ SUBMIT PAYMENT SCREENSHOT (User B) - UPDATED for Auto Request
========================================================= */
// exports.submitPayment = async (req, res) => {
//   try {
//     const { scannerId } = req.body;
//     const userId = req.user.id;

//     const scanner = await Scanner.findById(scannerId);

//     if (!scanner || scanner.status !== "ACCEPTED")
//       return res.status(400).json({ message: "Invalid state" });

//     if (scanner.acceptedBy.toString() !== userId)
//       return res.status(403).json({ message: "Not authorized" });

//     if (!req.file)
//       return res.status(400).json({ message: "Screenshot required" });

//     scanner.paymentScreenshot = `/uploads/${req.file.filename}`;
//     scanner.status = "PAYMENT_SUBMITTED";
//     scanner.paymentSubmittedAt = new Date();

//     await scanner.save();

//     // ✅ If it's an AUTO REQUEST, schedule auto-confirm
//     if (scanner.isAutoRequest) {
//       setTimeout(() => {
//         AutoRequestService.autoConfirmRequest(scannerId);
//       }, 60 * 1000);
      
//       return res.json({ 
//         message: "Payment proof submitted! Transaction will auto-confirm in 1 minute.",
//         autoConfirmIn: "1 minute"
//       });
//     }

//     res.json({ message: "Screenshot submitted successfully" });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


/* =========================================================
   4️⃣ SUBMIT PAYMENT SCREENSHOT (Multiple Support)
========================================================= */
exports.submitPayment = async (req, res) => {
  try {
    const { scannerId } = req.body;
    const userId = req.user.id;

    const scanner = await Scanner.findById(scannerId);

    if (!scanner || scanner.status !== "ACCEPTED")
      return res.status(400).json({ message: "Invalid state" });

    if (scanner.acceptedBy.toString() !== userId)
      return res.status(403).json({ message: "Not authorized" });

    if (!req.file)
      return res.status(400).json({ message: "Screenshot required" });

    // Initialize screenshots array if not exists
    if (!scanner.paymentScreenshots) {
      scanner.paymentScreenshots = [];
    }

    // Add new screenshot
    const newScreenshot = {
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
      isActive: true
    };

    scanner.paymentScreenshots.push(newScreenshot);
    scanner.paymentScreenshot = `/uploads/${req.file.filename}`; // Keep backward compatibility
    scanner.status = "PAYMENT_SUBMITTED";
    scanner.paymentSubmittedAt = new Date();

    await scanner.save();

    res.json({ 
      message: "Screenshot submitted successfully",
      screenshotCount: scanner.paymentScreenshots.length,
      latestScreenshot: newScreenshot
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================================================
   4️⃣.1️⃣ UPDATE/CHANGE SCREENSHOT
========================================================= */
exports.updateScreenshot = async (req, res) => {
  try {
    const { scannerId, screenshotIndex, reason } = req.body;
    const userId = req.user.id;

    const scanner = await Scanner.findById(scannerId);

    if (!scanner)
      return res.status(404).json({ message: "Scanner not found" });

    // Check if user is authorized (either acceptor or creator)
    const isAcceptor = scanner.acceptedBy && scanner.acceptedBy.toString() === userId;
    const isCreator = scanner.user && scanner.user.toString() === userId;

    if (!isAcceptor && !isCreator) {
      return res.status(403).json({ message: "Not authorized to update screenshot" });
    }

    if (!req.file)
      return res.status(400).json({ message: "New screenshot required" });

    if (!scanner.paymentScreenshots || scanner.paymentScreenshots.length === 0) {
      return res.status(400).json({ message: "No screenshots to update" });
    }

    // Initialize screenshotHistory if not exists
    if (!scanner.screenshotHistory) {
      scanner.screenshotHistory = [];
    }

    let targetIndex = screenshotIndex;

    // If no index provided, update the latest active screenshot
    if (targetIndex === undefined || targetIndex === null) {
      // Find the latest active screenshot
      const activeScreenshots = scanner.paymentScreenshots.filter(s => s.isActive);
      if (activeScreenshots.length === 0) {
        return res.status(400).json({ message: "No active screenshots found" });
      }
      
      // Get the latest active screenshot index
      const latestActive = activeScreenshots[activeScreenshots.length - 1];
      targetIndex = scanner.paymentScreenshots.findIndex(s => s.url === latestActive.url);
    }

    // Validate index
    if (targetIndex < 0 || targetIndex >= scanner.paymentScreenshots.length) {
      return res.status(400).json({ message: "Invalid screenshot index" });
    }

    // Save old screenshot to history
    scanner.screenshotHistory.push({
      oldScreenshot: scanner.paymentScreenshots[targetIndex].url,
      newScreenshot: `/uploads/${req.file.filename}`,
      changedAt: new Date(),
      changedBy: userId,
      reason: reason || "Screenshot updated"
    });

    // Update the screenshot
    scanner.paymentScreenshots[targetIndex] = {
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
      isActive: true
    };

    // Update main paymentScreenshot field (for backward compatibility)
    // Set to the latest active screenshot
    const activeScreenshots = scanner.paymentScreenshots.filter(s => s.isActive);
    if (activeScreenshots.length > 0) {
      scanner.paymentScreenshot = activeScreenshots[activeScreenshots.length - 1].url;
    }

    await scanner.save();

    res.json({ 
      message: "Screenshot updated successfully",
      screenshotCount: scanner.paymentScreenshots.length,
      updatedScreenshot: scanner.paymentScreenshots[targetIndex]
    });

  } catch (err) {
    console.error("Error updating screenshot:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================================================
   4️⃣.2️⃣ GET ALL SCREENSHOTS FOR A SCANNER
========================================================= */
exports.getScannerScreenshots = async (req, res) => {
  try {
    const { scannerId } = req.params;
    const userId = req.user.id;

    const scanner = await Scanner.findById(scannerId)
      .populate("user", "userId name")
      .populate("acceptedBy", "userId name");

    if (!scanner)
      return res.status(404).json({ message: "Scanner not found" });

    // Check if user is authorized
    const isAcceptor = scanner.acceptedBy && scanner.acceptedBy._id.toString() === userId;
    const isCreator = scanner.user && scanner.user._id.toString() === userId;

    if (!isAcceptor && !isCreator) {
      return res.status(403).json({ message: "Not authorized to view screenshots" });
    }

    res.json({
      scannerId: scanner._id,
      amount: scanner.amount,
      status: scanner.status,
      screenshots: scanner.paymentScreenshots || [],
      screenshotHistory: scanner.screenshotHistory || [],
      createdAt: scanner.createdAt,
      acceptedAt: scanner.acceptedAt
    });

  } catch (err) {
    console.error("Error fetching screenshots:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================================================
   4️⃣.3️⃣ DELETE SCREENSHOT (Soft delete)
========================================================= */
exports.deleteScreenshot = async (req, res) => {
  try {
    const { scannerId, screenshotIndex } = req.body;
    const userId = req.user.id;

    const scanner = await Scanner.findById(scannerId);

    if (!scanner)
      return res.status(404).json({ message: "Scanner not found" });

    // Only acceptor can delete their screenshots
    if (!scanner.acceptedBy || scanner.acceptedBy.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete screenshot" });
    }

    if (!scanner.paymentScreenshots || screenshotIndex >= scanner.paymentScreenshots.length) {
      return res.status(400).json({ message: "Invalid screenshot index" });
    }

    // Soft delete - mark as inactive
    scanner.paymentScreenshots[screenshotIndex].isActive = false;

    // Update main paymentScreenshot to latest active
    const activeScreenshots = scanner.paymentScreenshots.filter(s => s.isActive);
    if (activeScreenshots.length > 0) {
      scanner.paymentScreenshot = activeScreenshots[activeScreenshots.length - 1].url;
    } else {
      scanner.paymentScreenshot = null;
      scanner.status = "ACCEPTED"; // Revert status if no screenshots
    }

    await scanner.save();

    res.json({ 
      message: "Screenshot deleted successfully",
      activeScreenshots: activeScreenshots.length
    });

  } catch (err) {
    console.error("Error deleting screenshot:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================================================
   5️⃣ CONFIRM FINAL PAYMENT (User A Confirms) - BALANCE DEDUCTION HERE
========================================================= */
/* =========================================================
   5️⃣ CONFIRM FINAL PAYMENT (User A Confirms) - 7-DAY DEDUCTION HERE
========================================================= */
exports.confirmFinalPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { scannerId } = req.body;
    const userId = req.user.id; // This is User A (Creator)

    const scanner = await Scanner.findById(scannerId).session(session);
    if (!scanner) throw new Error("Request not found");
    if (scanner.status !== "PAYMENT_SUBMITTED") throw new Error("Payment proof not yet submitted");
    if (scanner.user.toString() !== userId) throw new Error("Unauthorized: Only creator can confirm");

    const acceptorId = scanner.acceptedBy; // This is User B (Acceptor)
    const amount = scanner.amount;

    // ✅ STEP 1: Debit from Creator (User A) - BALANCE DEDUCTION
    const creatorWallet = await Wallet.findOne({ user: userId, type: "INR" }).session(session);
    if (!creatorWallet || creatorWallet.balance < amount) {
      throw new Error("Creator's INR balance is too low");
    }
    creatorWallet.balance -= amount;
    await creatorWallet.save({ session });

    // ✅ STEP 2: Credit to Acceptor (User B)
    let acceptorWallet = await Wallet.findOne({ user: acceptorId, type: "INR" }).session(session);
    if (!acceptorWallet) {
      acceptorWallet = new Wallet({ user: acceptorId, type: "INR", balance: 0 });
    }
    acceptorWallet.balance += amount;
    await acceptorWallet.save({ session });

    // ✅ STEP 3: UPDATE 7-DAY TOTAL FOR ACCEPTOR (User B) - येथे DEDUCT करा
    const acceptorUser = await User.findById(acceptorId).session(session);
    if (acceptorUser) {
      acceptorUser.sevenDayTotalAccepted = (acceptorUser.sevenDayTotalAccepted || 0) + amount;
      await acceptorUser.save({ session });
    }

    /* ================ CASHBACK DISTRIBUTION ================ */
    // 🔥 Cashback for Creator (User A) - 4%
    const creatorCashback = Number((amount * 0.04).toFixed(2));
    let creatorCashbackWallet = await Wallet.findOne({ user: userId, type: "CASHBACK" }).session(session);
    if (!creatorCashbackWallet) {
      creatorCashbackWallet = new Wallet({ user: userId, type: "CASHBACK", balance: 0 });
    }
    creatorCashbackWallet.balance += creatorCashback;
    await creatorCashbackWallet.save({ session });

    // 🔥 Cashback for Acceptor (User B) - 5%
    const acceptorCashback = Number((amount * 0.05).toFixed(2));
    let acceptorCashbackWallet = await Wallet.findOne({ user: acceptorId, type: "CASHBACK" }).session(session);
    if (!acceptorCashbackWallet) {
      acceptorCashbackWallet = new Wallet({ user: acceptorId, type: "CASHBACK", balance: 0 });
    }
    acceptorCashbackWallet.balance += acceptorCashback;
    await acceptorCashbackWallet.save({ session });

    // Update scanner status
    scanner.status = "COMPLETED";
    scanner.completedAt = new Date();
    await scanner.save({ session });

    // Create ledger transactions
    const transactions = [
      { user: userId, type: "DEBIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId, meta: { type: "PAYMENT_SENT_TO_ACCEPTOR" } },
      { user: acceptorId, type: "CREDIT", fromWallet: "INR", toWallet: "INR", amount, relatedScanner: scannerId, meta: { type: "PAYMENT_RECEIVED_FROM_CREATOR" } },
      { user: userId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: creatorCashback, relatedScanner: scannerId, meta: { type: "CREATOR_CASHBACK" } },
      { user: acceptorId, type: "CASHBACK", fromWallet: "INR", toWallet: "CASHBACK", amount: acceptorCashback, relatedScanner: scannerId, meta: { type: "ACCEPTOR_CASHBACK" } }
    ];

    await Transaction.insertMany(transactions, { session });

    await session.commitTransaction();
    session.endSession();

    // ✅ Team cashback processing
    try {
      await ReferralService.processTeamCashback(userId, creatorCashback, 'CREATOR_CASHBACK', scannerId);
    } catch (err) {
      console.error("Error processing team cashback for creator:", err);
    }
    
    try {
      await ReferralService.processTeamCashback(acceptorId, acceptorCashback, 'ACCEPTOR_CASHBACK', scannerId);
    } catch (err) {
      console.error("Error processing team cashback for acceptor:", err);
    }
    
    res.json({ 
      message: "Transaction successful",
      transaction: {
        amount,
        creatorId: userId,
        acceptorId,
        creatorCashback,
        acceptorCashback
      }
    });

  } catch (err) {
    console.error("Confirm payment error:", err);
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

/* =========================================================
   6️⃣ ACTIVATE WALLET (7-Day Limit)
========================================================= */
// exports.activateWallet = async (req, res) => {
//   const session = await mongoose.startSession();
  
//   try {
//     session.startTransaction();

//     const userId = req.user.id;
//     const { dailyLimit, activationAmount, isIncrease } = req.body;

//     const user = await User.findById(userId).session(session);
//     if (!user) {
//       throw new Error("User not found");
//     }

//     // ✅ MINIMUM ACTIVATION AMOUNT CHECK - $50 USDT for first time
//     const MIN_ACTIVATION_USDT = 50;
    
//     if (!user.walletActivated && activationAmount < MIN_ACTIVATION_USDT) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ 
//         message: `Minimum activation amount is $${MIN_ACTIVATION_USDT} USDT` 
//       });
//     }

//     // Calculate expiry date (7 days from now)
//     const expiryDate = new Date();
//     expiryDate.setDate(expiryDate.getDate() + 7);

//     // Save previous activation to history if exists
//     if (user.walletActivated) {
//       user.activationHistory.push({
//         date: user.activationDate,
//         limit: user.dailyAcceptLimit,
//         amount: activationAmount,
//         expiryDate: user.activationExpiryDate,
//         status: 'EXPIRED'
//       });
//     }

//     // USDT wallet update
//     let usdtWallet = await Wallet.findOne({ user: userId, type: "USDT" }).session(session);
//     if (!usdtWallet) {
//       usdtWallet = new Wallet({ user: userId, type: "USDT", balance: 0 });
//     }
//     usdtWallet.balance += activationAmount;
//     await usdtWallet.save({ session });

//     // INR wallet update
//     const conversionRate = 95;
//     const inrAmount = activationAmount * conversionRate;

//     let inrWallet = await Wallet.findOne({ user: userId, type: "INR" }).session(session);
//     if (!inrWallet) {
//       inrWallet = new Wallet({ user: userId, type: "INR", balance: 0 });
//     }
//     inrWallet.balance += inrAmount;
//     await inrWallet.save({ session });

//     // Transaction records with proper currency symbols
//     await Transaction.create([
//       {
//         user: userId,
//         type: "DEPOSIT",
//         fromWallet: null,
//         toWallet: "USDT",
//         amount: activationAmount,
//         meta: {
//           currency: "USDT",
//           symbol: "$",
//           type: "ACTIVATION_DEPOSIT"
//         }
//       },
//       {
//         user: userId,
//         type: "CONVERSION",
//         fromWallet: "USDT",
//         toWallet: "INR",
//         amount: inrAmount,
//         meta: {
//           rate: conversionRate,
//           originalAmount: activationAmount,
//           originalCurrency: "USDT",
//           symbol: "₹",
//           type: "ACTIVATION_CONVERSION"
//         }
//       },
//       {
//         user: userId,
//         type: "WALLET_ACTIVATION",
//         fromWallet: "USDT",
//         toWallet: "INR",
//         amount: activationAmount,
//         meta: {
//           usdtAmount: activationAmount,
//           inrAmount: inrAmount,
//           rate: conversionRate,
//           dailyLimit: dailyLimit,
//           symbol: "$",
//           type: "ACTIVATION"
//         }
//       }
//     ], { session });

//     // User activation status update
//     user.walletActivated = true;
//     user.activationDate = new Date();
//     user.activationExpiryDate = expiryDate;
//     user.dailyAcceptLimit = dailyLimit;
//     user.sevenDayTotalAccepted = 0;
//     user.sevenDayResetDate = expiryDate;
//     user.todayAcceptedCount = 0;
//     await user.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.json({ 
//       message: user.walletActivated ? "Wallet limit updated successfully" : "Wallet activated successfully",
//       dailyLimit,
//       activationAmount,
//       inrAmount,
//       usdtBalance: usdtWallet.balance,
//       inrBalance: inrWallet.balance,
//       validUntil: expiryDate,
//       remainingDays: 7
//     });

//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Wallet activation error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// scanner.controller.js - activateWallet function

exports.activateWallet = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const userId = req.user.id;
    const { dailyLimit, activationAmount, isIncrease } = req.body;

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    // Calculate INR amount
    const conversionRate = 95;
    const inrAmount = activationAmount * conversionRate;
    
    // ✅ FIX: Calculate new limit (INR × 10)
    const calculatedLimit = inrAmount * 10;

    // USDT wallet update
    let usdtWallet = await Wallet.findOne({ user: userId, type: "USDT" }).session(session);
    if (!usdtWallet) {
      usdtWallet = new Wallet({ user: userId, type: "USDT", balance: 0 });
    }
    usdtWallet.balance += activationAmount;
    await usdtWallet.save({ session });

    // INR wallet update
    let inrWallet = await Wallet.findOne({ user: userId, type: "INR" }).session(session);
    if (!inrWallet) {
      inrWallet = new Wallet({ user: userId, type: "INR", balance: 0 });
    }
    inrWallet.balance += inrAmount;
    await inrWallet.save({ session });

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    // Update user activation
    if (!user.walletActivated) {
      // First time activation
      user.walletActivated = true;
      user.activationDate = new Date();
      user.activationExpiryDate = expiryDate;
      user.dailyAcceptLimit = calculatedLimit;
      user.sevenDayTotalAccepted = 0;
      user.sevenDayResetDate = expiryDate;
    } else {
      // Extension
      const oldLimit = user.dailyAcceptLimit;
      user.dailyAcceptLimit = oldLimit + calculatedLimit;
      user.activationDate = new Date();
      user.activationExpiryDate = expiryDate;
      user.sevenDayResetDate = expiryDate;
    }

    await user.save({ session });

    // Create transactions
    await Transaction.create([
      {
        user: userId,
        type: "DEPOSIT",
        fromWallet: null,
        toWallet: "USDT",
        amount: activationAmount,
        meta: {
          currency: "USDT",
          symbol: "$",
          type: "ACTIVATION_DEPOSIT"
        }
      },
      {
        user: userId,
        type: "CONVERSION",
        fromWallet: "USDT",
        toWallet: "INR",
        amount: inrAmount,
        meta: {
          rate: conversionRate,
          originalAmount: activationAmount,
          originalCurrency: "USDT",
          symbol: "₹",
          type: "ACTIVATION_CONVERSION"
        }
      },
      {
        user: userId,
        type: "WALLET_ACTIVATION",
        fromWallet: "USDT",
        toWallet: "INR",
        amount: activationAmount,
        meta: {
          usdtAmount: activationAmount,
          inrAmount: inrAmount,
          rate: conversionRate,
          dailyLimit: calculatedLimit,
          symbol: "$",
          type: "ACTIVATION"
        }
      }
    ], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ 
      message: user.walletActivated ? "Wallet limit updated successfully" : "Wallet activated successfully",
      dailyLimit: user.dailyAcceptLimit,
      activationAmount,
      inrAmount,
      usdtBalance: usdtWallet.balance,
      inrBalance: inrWallet.balance,
      validUntil: expiryDate,
      remainingDays: 7,
      calculation: `${inrAmount} × 10 = ${calculatedLimit}`
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Wallet activation error:", err);
    res.status(500).json({ message: err.message });
  }
};
/* =========================================================
   7️⃣ CHECK WALLET ACTIVATION STATUS (7-Day Logic)
========================================================= */
// exports.checkWalletActivation = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
    
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if activation expired (7 days)
//     if (user.walletActivated && user.isActivationExpired()) {
//       console.log("7 days completed - resetting activation");
//       user.walletActivated = false;
//       user.sevenDayTotalAccepted = 0;
//       user.todayAcceptedCount = 0;
//       user.activationExpiryDate = null;
//       await user.save();
//     }

//     // Check if 7-day reset needed
//     user.checkAndResetSevenDay();

//     // Calculate remaining days
//     const remainingDays = user.walletActivated ? user.getRemainingDays() : 0;
    
//     // Calculate reset date
//     const resetDate = user.activationExpiryDate || 
//       (user.activationDate ? new Date(user.activationDate.getTime() + (7 * 24 * 60 * 60 * 1000)) : null);

//     res.json({
//       activated: user.walletActivated || false,
//       dailyLimit: user.walletActivated ? user.dailyAcceptLimit : 0,
//       sevenDayTotal: user.sevenDayTotalAccepted || 0,
//       remaining: user.walletActivated ? (user.dailyAcceptLimit - (user.sevenDayTotalAccepted || 0)) : 0,
//       activationDate: user.activationDate,
//       expiryDate: user.activationExpiryDate,
//       remainingDays: remainingDays,
//       resetDate: resetDate,
//       firstDepositCompleted: user.firstDepositCompleted || false,
//       firstAcceptCompleted: user.firstAcceptCompleted || false,
//       // Daily average for display
//       dailyAverage: user.walletActivated ? (user.dailyAcceptLimit / 7).toFixed(2) : 0
//     });

//   } catch (err) {
//     console.error("Check activation error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


// scanner.controller.js - checkWalletActivation function

exports.checkWalletActivation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if activation expired (7 days)
    if (user.walletActivated && user.isActivationExpired()) {
      console.log("7 days completed - resetting activation");
      user.walletActivated = false;
      user.sevenDayTotalAccepted = 0;
      user.todayAcceptedCount = 0;
      user.activationExpiryDate = null;
      await user.save();
    }

    // Check if 7-day reset needed
    user.checkAndResetSevenDay();

    // Calculate remaining days
    const remainingDays = user.walletActivated ? user.getRemainingDays() : 0;
    
    // Calculate reset date
    const resetDate = user.activationExpiryDate || 
      (user.activationDate ? new Date(user.activationDate.getTime() + (7 * 24 * 60 * 60 * 1000)) : null);

    res.json({
      activated: user.walletActivated || false,
      dailyLimit: user.walletActivated ? user.dailyAcceptLimit : 0,
      sevenDayTotal: user.sevenDayTotalAccepted || 0,
      remaining: user.walletActivated ? (user.dailyAcceptLimit - (user.sevenDayTotalAccepted || 0)) : 0,
      activationDate: user.activationDate,
      expiryDate: user.activationExpiryDate,
      remainingDays: remainingDays,
      resetDate: resetDate,
      firstDepositCompleted: user.firstDepositCompleted || false,
      firstAcceptCompleted: user.firstAcceptCompleted || false,
      // ✅ Daily average for display
      dailyAverage: user.walletActivated ? (user.dailyAcceptLimit / 7).toFixed(2) : 0,
      // ✅ Show calculation
      calculation: user.walletActivated ? `₹${user.sevenDayTotalAccepted || 0} / ₹${user.dailyAcceptLimit}` : null
    });

  } catch (err) {
    console.error("Check activation error:", err);
    res.status(500).json({ message: err.message });
  }
};
/* =========================================================
   8️⃣ SELF PAY
========================================================= */
exports.selfPay = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount } = req.body;
    const userId = req.user.id;

    const wallet = await Wallet.findOne({ user: userId, type: "INR" }).session(session);
    if (!wallet || wallet.balance < amount)
      throw new Error("Insufficient balance");

    wallet.balance -= amount;
    await wallet.save({ session });

    const cashback = Number((amount * 0.01).toFixed(2));

    let cashbackWallet = await Wallet.findOne({ user: userId, type: "CASHBACK" }).session(session);
    if (!cashbackWallet) {
      cashbackWallet = new Wallet({ user: userId, type: "CASHBACK", balance: 0 });
    }
    cashbackWallet.balance += cashback;
    await cashbackWallet.save({ session });

    const currentUser = await User.findById(userId).session(session);

    if (currentUser.referredBy) {
      const referralBonus = Number((amount * 0.01).toFixed(2));
      const referrerId = currentUser.referredBy;

      let refWallet = await Wallet.findOne({ user: referrerId, type: "CASHBACK" }).session(session);
      if (!refWallet) {
        refWallet = new Wallet({ user: referrerId, type: "CASHBACK", balance: 0 });
      }
      refWallet.balance += referralBonus;
      await refWallet.save({ session });

      await User.findByIdAndUpdate(referrerId, {
        $inc: { referralEarnings: referralBonus }
      }).session(session);

      await Transaction.create([{
        user: referrerId,
        type: "CASHBACK",
        fromWallet: "INR",
        toWallet: "CASHBACK",
        amount: referralBonus,
        meta: { type: "SELF_PAY_REFERRAL" }
      }], { session });
    }

    await Transaction.create([{
      user: userId,
      type: "SELF_PAY",
      fromWallet: "INR",
      toWallet: "CASHBACK",
      amount: amount,
      meta: { 
        type: "SELF_PAY",
        cashbackEarned: cashback 
      }
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Self payment successful",
      cashbackEarned: cashback
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

/* =========================================================
   9️⃣ ADMIN: GET ALL SCANNERS
========================================================= */
exports.getAllScanners = async (req, res) => {
  try {
    const allScanners = await Scanner.find()
      .populate("user", "name email")
      .populate("acceptedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(allScanners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};