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

/* =====================================================
   REQUEST TO PAY (User A)
===================================================== */
router.post(
  "/request",
  userAuth,
  upload.single("image"),
  scannerController.requestToPay
);

/* =====================================================
   GET ALL ACTIVE REQUESTS
===================================================== */
router.get(
  "/active",
  userAuth,
  scannerController.getActiveRequests
);

/* =====================================================
   ACCEPT REQUEST (User B)
===================================================== */
router.post(
  "/accept",
  userAuth,
  scannerController.acceptRequest
);

/* =====================================================
   SUBMIT PAYMENT SCREENSHOT (User B)
===================================================== */
router.post(
  "/submit-payment",
  userAuth,
  upload.single("screenshot"),
  scannerController.submitPayment
);

/* =====================================================
   FINAL CONFIRM (User A clicks DONE)
===================================================== */
router.post(
  "/confirm",
  userAuth,
  scannerController.confirmFinalPayment
);

/* =====================================================
   SELF PAY (1% Cashback)
===================================================== */
router.post(
  "/self-pay",
  userAuth,
  scannerController.selfPay
);

module.exports = router;


router.get('/all', adminAuthMiddleware, scannerController.getAllScanners);