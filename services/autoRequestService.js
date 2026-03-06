const Scanner = require("../src/models/Scanner");
const User = require("../src/models/User");
const Wallet = require("../src/models/Wallet");
const Transaction = require("../src/models/Transaction");
const mongoose = require("mongoose");

class AutoRequestService {
  
  // 📌 नवीन यूजरसाठी FIRST AUTO REQUEST create करा - फक्त एकदाच
  static async createFirstAutoRequestForUser(userId, amount = 1000) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error("User not found");
      
      // ✅ Check if user already got first auto request
      if (user.autoRequest?.firstRequestCreated) {
        console.log(`⏭️ User ${user.userId} already got first auto request, skipping...`);
        await session.abortTransaction();
        session.endSession();
        return null;
      }
      
      const defaultQRPath = "/uploads/auto-request-qr.png";
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      const scanner = await Scanner.create([{
        user: null, // System request
        amount: amount,
        image: defaultQRPath,
        status: "ACTIVE",
        expiresAt: expiresAt,
        isAutoRequest: true,
        autoRequestCycle: 1,
        createdFor: userId
      }], { session });
      
      // ✅ Update user's auto request status
      user.autoRequest = {
        ...user.autoRequest,
        firstRequestCreated: true,
        firstRequestId: scanner[0]._id,
        firstRequestAmount: amount,
        firstRequestCreatedAt: new Date(),
        firstRequestExpiresAt: expiresAt,
        // ✅ Schedule next request after 30 minutes
        nextRequestScheduledAt: new Date(Date.now() + 30 * 60 * 1000)
      };
      
      await user.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      console.log(`✅ FIRST AUTO REQUEST created for NEW user ${user.userId}: ₹${amount} (expires: ${expiresAt.toLocaleTimeString()})`);
      console.log(`⏰ Next request scheduled after 30 minutes at: ${new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString()}`);
      
      return scanner[0];
      
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("❌ Error creating first auto request:", error);
      return null;
    }
  }
  
  // 📌 SECOND AUTO REQUEST - 30 minutes नंतर
  static async createSecondAutoRequestForUser(userId, amount = 1000) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error("User not found");
      
      // ✅ Check if user already got second request
      if (user.autoRequest?.secondRequestCreated) {
        console.log(`⏭️ User ${user.userId} already got second auto request, stopping...`);
        await session.abortTransaction();
        session.endSession();
        return null;
      }
      
      // ✅ Check if first request was created
      if (!user.autoRequest?.firstRequestCreated) {
        console.log(`⏭️ User ${user.userId} hasn't received first request yet`);
        await session.abortTransaction();
        session.endSession();
        return null;
      }
      
      const defaultQRPath = "/uploads/auto-request-qr.png";
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      const scanner = await Scanner.create([{
        user: null, // System request
        amount: amount,
        image: defaultQRPath,
        status: "ACTIVE",
        expiresAt: expiresAt,
        isAutoRequest: true,
        autoRequestCycle: 2,
        createdFor: userId
      }], { session });
      
      // ✅ Update user's auto request status - SECOND REQUEST DONE
      user.autoRequest = {
        ...user.autoRequest,
        secondRequestCreated: true,
        secondRequestId: scanner[0]._id,
        secondRequestAmount: amount,
        secondRequestCreatedAt: new Date(),
        secondRequestExpiresAt: expiresAt,
        // No more requests scheduled
        autoRequestCompleted: true
      };
      
      await user.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      console.log(`✅ SECOND AUTO REQUEST created for user ${user.userId}: ₹${amount} (30 min after first)`);
      console.log(`🎉 Auto request cycle completed for user ${user.userId}`);
      
      return scanner[0];
      
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("❌ Error creating second auto request:", error);
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
        
        // ✅ If this was first request and expired, schedule second request after 30 min from creation
        if (request.createdFor && request.autoRequestCycle === 1) {
          const user = await User.findById(request.createdFor).session(session);
          if (user) {
            const timeSinceCreation = Date.now() - new Date(request.createdAt).getTime();
            const thirtyMinutes = 30 * 60 * 1000;
            
            // If expired before 30 minutes, wait for remaining time
            if (timeSinceCreation < thirtyMinutes) {
              const remainingTime = thirtyMinutes - timeSinceCreation;
              console.log(`⏰ First request expired early. Scheduling second request in ${remainingTime/1000} seconds`);
              
              setTimeout(() => {
                this.createSecondAutoRequestForUser(user._id, request.amount);
              }, remainingTime);
            } else {
              // If expired after 30 minutes, create second request immediately
              console.log(`⏰ First request expired after 30 minutes. Creating second request now.`);
              await this.createSecondAutoRequestForUser(user._id, request.amount);
            }
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
  
  // 📌 Auto-confirm function
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
      
      // Update user's auto request stats
      if (scanner.createdFor) {
        const creatorUser = await User.findById(scanner.createdFor).session(session);
        if (creatorUser && creatorUser.autoRequest) {
          // Update based on which request was completed
          if (scanner.autoRequestCycle === 1) {
            creatorUser.autoRequest.firstRequestCompleted = true;
            creatorUser.autoRequest.firstRequestCompletedAt = new Date();
          } else if (scanner.autoRequestCycle === 2) {
            creatorUser.autoRequest.secondRequestCompleted = true;
            creatorUser.autoRequest.secondRequestCompletedAt = new Date();
          }
          
          creatorUser.autoRequest.currentRequestId = null;
          creatorUser.autoRequest.autoRequestsAccepted = (creatorUser.autoRequest.autoRequestsAccepted || 0) + 1;
          
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
            cycle: scanner.autoRequestCycle,
            note: scanner.autoRequestCycle === 1 ? "First welcome bonus" : "Second bonus"
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
            cycle: scanner.autoRequestCycle,
            note: "5% cashback on system request"
          }
        }
      ], { session });
      
      console.log(`📝 Transactions created`);
      
      await session.commitTransaction();
      session.endSession();
      
      console.log(`✅✅✅ System Auto request ${scanner._id} (Cycle ${scanner.autoRequestCycle}) completed successfully!`);
      console.log(`   Acceptor got: ₹${amount} + ₹${acceptorCashback} cashback`);
      
      // ✅ Schedule next request if this was first request and it was completed
      if (scanner.createdFor && scanner.autoRequestCycle === 1) {
        const user = await User.findById(scanner.createdFor);
        if (user) {
          const timeSinceCreation = Date.now() - new Date(scanner.createdAt).getTime();
          const thirtyMinutes = 30 * 60 * 1000;
          
          // Calculate when to send second request
          if (timeSinceCreation < thirtyMinutes) {
            const remainingTime = thirtyMinutes - timeSinceCreation;
            console.log(`⏰ First request completed early. Scheduling second request in ${remainingTime/1000} seconds`);
            
            setTimeout(() => {
              this.createSecondAutoRequestForUser(scanner.createdFor, amount);
            }, remainingTime);
          } else {
            // If completed after 30 minutes, send second request immediately
            console.log(`⏰ First request completed after 30 minutes. Creating second request now.`);
            await this.createSecondAutoRequestForUser(scanner.createdFor, amount);
          }
        }
      }
      
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("❌❌❌ Error in auto confirm:", error);
    }
  }
  
  // 📌 नवीन यूजरसाठी initial auto request create करा
  static async initializeForNewUser(userId) {
    try {
      console.log(`🎉 Creating first auto request for new user: ${userId}`);
      await this.createFirstAutoRequestForUser(userId, 1000);
    } catch (error) {
      console.error("❌ Error initializing auto request for new user:", error);
    }
  }
  
  // 📌 Start background job to check for scheduled requests
  static startScheduledJobs() {
    // Check every minute for requests that need to be created
    setInterval(async () => {
      try {
        const users = await User.find({
          "autoRequest.firstRequestCreated": true,
          "autoRequest.secondRequestCreated": { $ne: true },
          "autoRequest.nextRequestScheduledAt": { $lte: new Date() }
        });
        
        for (const user of users) {
          console.log(`⏰ Creating scheduled second request for user ${user.userId}`);
          await this.createSecondAutoRequestForUser(user._id, user.autoRequest?.firstRequestAmount || 1000);
        }
      } catch (error) {
        console.error("❌ Error in scheduled jobs:", error);
      }
    }, 60 * 1000); // Check every minute
    
    // Check for expired requests every minute
    setInterval(async () => {
      await this.handleExpiredRequests();
    }, 60 * 1000);
  }
}

module.exports = AutoRequestService;