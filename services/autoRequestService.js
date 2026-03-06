const Scanner = require("../src/models/Scanner");
const User = require("../src/models/User");
const Wallet = require("../src/models/Wallet");
const Transaction = require("../src/models/Transaction");
const mongoose = require("mongoose");


class AutoRequestService {
  
  // 📌 नवीन यूजरसाठी ऑटो request create करा - SYSTEM REQUEST (user = null)
  static async createAutoRequestForUser(userId, amount = 1000) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error("User not found");
      
      if (!user.autoRequest?.enabled) {
        await session.abortTransaction();
        session.endSession();
        return null;
      }
      
      const defaultQRPath = "/uploads/auto-request-qr.png";
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      const scanner = await Scanner.create([{
        user: null,
        amount: amount,
        image: defaultQRPath,
        status: "ACTIVE",
        expiresAt: expiresAt,
        isAutoRequest: true,
        autoRequestCycle: (user.autoRequest?.totalAutoRequests || 0) + 1,
        createdFor: userId
      }], { session });
      
      user.autoRequest = {
        ...user.autoRequest,
        currentRequestId: scanner[0]._id,
        lastRequestAt: new Date(),
        nextRequestAt: expiresAt,
        totalAutoRequests: (user.autoRequest?.totalAutoRequests || 0) + 1,
        enabled: true,
        autoRequestAmount: amount
      };
      
      await user.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      console.log(`✅ System Auto request created for user ${user.userId}: ₹${amount} (expires: ${expiresAt.toLocaleTimeString()})`);
      
      return scanner[0];
      
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("❌ Error creating auto request:", error);
      return null;
    }
  }
  
  // 📌 एक्सपायर झालेल्या requests चे मॅनेजमेंट
  static async handleExpiredRequests() {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const now = new Date();
      
      const expiredRequests = await Scanner.find({
        isAutoRequest: true,
        status: "ACTIVE",
        expiresAt: { $lt: now }
      }).session(session);
      
      console.log(`🔄 Found ${expiredRequests.length} expired auto requests`);
      
      for (const request of expiredRequests) {
        request.status = "EXPIRED";
        await request.save({ session });
        
        if (request.createdFor) {
          const user = await User.findById(request.createdFor).session(session);
          if (user) {
            setTimeout(() => {
              this.createAutoRequestForUser(user._id, request.amount);
            }, 60 * 1000);
            
            console.log(`⏰ Expired request for user ${user.userId} - new request in 1 min`);
          }
        }
      }
      
      await session.commitTransaction();
      session.endSession();
      
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("❌ Error handling expired requests:", error);
    }
  }
  
  // 📌 ACCEPTED request वर auto-confirm
  static async handleAcceptedRequest(scannerId) {
    try {
      console.log(`🔄 Scheduling auto-confirm for request ${scannerId} in 60 seconds`);
      setTimeout(async () => {
        await this.autoConfirmRequest(scannerId);
      }, 60 * 1000);
    } catch (error) {
      console.error("❌ Error handling accepted request:", error);
    }
  }
  
  // 📌 Auto-confirm function - FIXED
  static async autoConfirmRequest(scannerId) {
    console.log(`🔄 Auto-confirm triggered for request ${scannerId}`);
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const scanner = await Scanner.findById(scannerId)
        .populate("acceptedBy")
        .session(session);
      
      if (!scanner) {
        console.log(`❌ Scanner ${scannerId} not found`);
        await session.abortTransaction();
        session.endSession();
        return;
      }
      
      console.log(`📊 Scanner status: ${scanner.status}, isAutoRequest: ${scanner.isAutoRequest}`);
      
      if (scanner.status !== "PAYMENT_SUBMITTED") {
        console.log(`❌ Scanner status is ${scanner.status}, not PAYMENT_SUBMITTED`);
        await session.abortTransaction();
        session.endSession();
        return;
      }
      
      if (!scanner.acceptedBy) {
        console.log(`❌ No acceptedBy found for scanner ${scannerId}`);
        await session.abortTransaction();
        session.endSession();
        return;
      }
      
      const acceptorId = scanner.acceptedBy._id;
      const amount = scanner.amount;
      
      console.log(`✅ Auto-confirming request: Acceptor=${acceptorId}, Amount=${amount}`);
      
      // 💰 Acceptor ला पैसे credit करा
      let acceptorWallet = await Wallet.findOne({ user: acceptorId, type: "INR" }).session(session);
      if (!acceptorWallet) {
        acceptorWallet = new Wallet({ user: acceptorId, type: "INR", balance: 0 });
      }
      acceptorWallet.balance += amount;
      await acceptorWallet.save({ session });
      console.log(`💰 Credited ₹${amount} to acceptor's INR wallet`);
      
      // 🎁 Cashback for Acceptor - 5%
      const acceptorCashback = Number((amount * 0.05).toFixed(2));
      
      let acceptorCashbackWallet = await Wallet.findOne({ user: acceptorId, type: "CASHBACK" }).session(session);
      if (!acceptorCashbackWallet) {
        acceptorCashbackWallet = new Wallet({ user: acceptorId, type: "CASHBACK", balance: 0 });
      }
      acceptorCashbackWallet.balance += acceptorCashback;
      await acceptorCashbackWallet.save({ session });
      console.log(`💰 Credited ₹${acceptorCashback} cashback to acceptor`);
      
      // Scanner COMPLETED mark करा
      scanner.status = "COMPLETED";
      scanner.completedAt = new Date();
      await scanner.save({ session });
      console.log(`✅ Scanner marked as COMPLETED`);
      
      // Update user's auto request accepted count
      if (scanner.createdFor) {
        const creatorUser = await User.findById(scanner.createdFor).session(session);
        if (creatorUser && creatorUser.autoRequest) {
          creatorUser.autoRequest.autoRequestsAccepted = (creatorUser.autoRequest.autoRequestsAccepted || 0) + 1;
          creatorUser.autoRequest.currentRequestId = null;
          await creatorUser.save({ session });
          console.log(`📊 Updated auto request stats for creator`);
        }
      }
      
      // 📝 Transactions create करा
      await Transaction.create([
        {
          user: acceptorId,
          type: "CREDIT",
          fromWallet: "SYSTEM",
          toWallet: "INR",
          amount: amount,
          relatedScanner: scanner._id,
          meta: { 
            type: "SYSTEM_REQUEST_RECEIVED", 
            isAutoRequest: true,
            note: "Welcome bonus from system"
          }
        },
        {
          user: acceptorId,
          type: "CASHBACK",
          fromWallet: "SYSTEM",
          toWallet: "CASHBACK",
          amount: acceptorCashback,
          relatedScanner: scanner._id,
          meta: { 
            type: "SYSTEM_REQUEST_CASHBACK", 
            isAutoRequest: true,
            note: "5% cashback on system request"
          }
        }
      ], { session });
      
      console.log(`📝 Transactions created`);
      
      await session.commitTransaction();
      session.endSession();
      
      console.log(`✅✅✅ System Auto request ${scanner._id} completed successfully!`);
      console.log(`   Acceptor got: ₹${amount} + ₹${acceptorCashback} cashback`);
      
      // ✅ नवीन auto request create करा
      if (scanner.createdFor) {
        console.log(`🔄 Scheduling new auto request for user ${scanner.createdFor} in 60 seconds`);
        setTimeout(() => {
          this.createAutoRequestForUser(scanner.createdFor, amount);
        }, 60 * 1000);
      }
      
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("❌❌❌ Error in auto confirm:", error);
    }
  }
  
  // 📌 सगळ्या users साठी initial auto requests create करा
  static async initializeAutoRequestsForAllUsers() {
    try {
      const users = await User.find({
        "autoRequest.enabled": true,
        $or: [
          { "autoRequest.currentRequestId": null },
          { "autoRequest.currentRequestId": { $exists: false } }
        ]
      });
      
      console.log(`📋 Initializing auto requests for ${users.length} users`);
      
      for (const user of users) {
        await this.createAutoRequestForUser(user._id);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.error("❌ Error initializing auto requests:", error);
    }
  }
}

module.exports = AutoRequestService;

