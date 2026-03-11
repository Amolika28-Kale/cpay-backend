// const express = require("express");
// const router = express.Router();

// const upload = require("../middlewares/upload.middleware");
// const userAuth = require("../middlewares/userAuth.middleware");

// const {
//   createDeposit,
//   getMyDeposits
// } = require("../controllers/deposit.controller");

// router.post(
//   "/",
//   userAuth,
//   upload.single("paymentScreenshot"),
//   createDeposit
// );

// router.get("/my", userAuth, getMyDeposits);

// module.exports = router;


const express = require("express");
const router = express.Router();
const multer = require("multer");
const depositController = require("../controllers/deposit.controller");
const userAuth = require("../middlewares/userAuth.middleware");
const adminAuth = require("../middlewares/adminAuth.middleware");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ==================== USER ROUTES ====================
router.post("/", userAuth, upload.single("paymentScreenshot"), depositController.createDeposit);
router.get("/my", userAuth, depositController.getMyDeposits);
router.get("/:id", userAuth, depositController.getDepositById);

// ✅ Update deposit screenshot (while pending)
router.post("/update-screenshot", userAuth, upload.single("paymentScreenshot"), depositController.updateDepositScreenshot);

// ==================== ADMIN ROUTES ====================
router.get("/", adminAuth, depositController.getAllDeposits);
router.put("/:id/approve", adminAuth, depositController.approveDeposit);
router.put("/:id/reject", adminAuth, depositController.rejectDeposit);

module.exports = router;