const express = require("express");
const router = express.Router();
const {
  findAccount,
  verifyOtpAndGetUserId,
  requestPinReset,
  resetPin
} = require("../controllers/findAccount.controller");

router.post("/find-account", findAccount);
router.post("/verify-otp-userid", verifyOtpAndGetUserId);
router.post("/request-pin-reset", requestPinReset);
router.post("/reset-pin", resetPin);

module.exports = router;