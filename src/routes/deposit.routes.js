const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload.middleware");
const userAuth = require("../middlewares/userAuth.middleware");

const {
  createDeposit,
  getMyDeposits
} = require("../controllers/deposit.controller");

router.post(
  "/",
  userAuth,
  upload.single("paymentScreenshot"),
  createDeposit
);

router.get("/my", userAuth, getMyDeposits);

module.exports = router;
