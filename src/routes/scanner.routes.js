const express = require("express");
const router = express.Router();
const multer = require("multer");
const scannerController = require("../controllers/scanner.controller");
const userAuth = require("../middlewares/userAuth.middleware");

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

/* ================= ROUTES ================= */

router.post(
  "/create",
  userAuth,
  upload.single("image"),
  scannerController.createScanner
);

router.get(
  "/active",
  userAuth,
  scannerController.getActiveScanners
);

router.post(
  "/pay",
  userAuth,
  scannerController.payScanner
);

router.post(
  "/confirm",
  userAuth,
  upload.single("screenshot"),   // 🔥 Screenshot added
  scannerController.confirmPayment
);

module.exports = router;
