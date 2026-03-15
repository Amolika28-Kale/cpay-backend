// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const scannerController = require("../controllers/scanner.controller");
// const userAuth = require("../middlewares/userAuth.middleware");
// const adminAuthMiddleware = require("../middlewares/adminAuth.middleware");

// /* ================= MULTER ================= */

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// /* =====================================================
//    REQUEST TO PAY (User A)
// ===================================================== */
// router.post(
//   "/request",
//   userAuth,
//   upload.single("image"),
//   scannerController.requestToPay
// );

// /* =====================================================
//    GET ALL ACTIVE REQUESTS
// ===================================================== */
// router.get(
//   "/active",
//   userAuth,
//   scannerController.getActiveRequests
// );

// // routes/scanner.routes.js - Add these endpoints
// router.get("/activation-status", userAuth, scannerController.checkWalletActivation);
// router.post("/activate-wallet", userAuth, scannerController.activateWallet);


// /* =====================================================
//    ACCEPT REQUEST (User B)
// ===================================================== */
// router.post(
//   "/accept",
//   userAuth,
//   scannerController.acceptRequest
// );

// /* =====================================================
//    SUBMIT PAYMENT SCREENSHOT (User B)
// ===================================================== */
// router.post(
//   "/submit-payment",
//   userAuth,
//   upload.single("screenshot"),
//   scannerController.submitPayment
// );

// /* =====================================================
//    FINAL CONFIRM (User A clicks DONE)
// ===================================================== */
// router.post(
//   "/confirm",
//   userAuth,
//   scannerController.confirmFinalPayment
// );

// /* =====================================================
//    SELF PAY (1% Cashback)
// ===================================================== */
// router.post(
//   "/self-pay",
//   userAuth,
//   scannerController.selfPay
// );

// module.exports = router;


// router.get('/all', adminAuthMiddleware, scannerController.getAllScanners);

// // scanner.routes.js मध्ये हे routes add करा

// // Get all screenshots for a scanner
// router.get('/screenshots/:scannerId', auth, scannerController.getScannerScreenshots);

// // Update screenshot
// router.post('/update-screenshot', auth, upload.single('screenshot'), scannerController.updateScreenshot);

// // Delete screenshot (soft delete)
// router.post('/delete-screenshot', auth, scannerController.deleteScreenshot);


const express = require("express");
const router = express.Router();
const multer = require("multer");
const scannerController = require("../controllers/scanner.controller");
const userAuth = require("../middlewares/userAuth.middleware");
const adminAuthMiddleware = require("../middlewares/adminAuth.middleware");

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

/* ================= USER ROUTES ================= */
router.post("/request", userAuth, upload.single("image"), scannerController.requestToPay);
router.get("/active", userAuth, scannerController.getActiveRequests);
router.get("/activation-status", userAuth, scannerController.checkWalletActivation);
router.post("/activate-wallet", userAuth, scannerController.activateWallet);
router.post("/accept", userAuth, scannerController.acceptRequest);
router.post("/submit-payment", userAuth, upload.single("screenshot"), scannerController.submitPayment);
router.post("/confirm", userAuth, scannerController.confirmFinalPayment);
router.post("/self-pay", userAuth, scannerController.selfPay);
// Cancel request
router.delete("/cancel/:scannerId", userAuth, scannerController.cancelRequest);

/* ================= SCREENSHOT MANAGEMENT ROUTES ================= */
router.get("/screenshots/:scannerId", userAuth, scannerController.getScannerScreenshots);
router.post("/update-screenshot", userAuth, upload.single("screenshot"), scannerController.updateScreenshot);
router.post("/delete-screenshot", userAuth, scannerController.deleteScreenshot);

/* ================= ADMIN ROUTES ================= */
router.get('/all', adminAuthMiddleware, scannerController.getAllScanners);
router.post("/request-utr", userAuth, scannerController.requestUTR);
module.exports = router;