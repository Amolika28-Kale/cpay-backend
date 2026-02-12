const express = require("express");
const router = express.Router();

const {
  createWithdraw,
  getMyWithdraws
} = require("../controllers/withdraw.controller");

const userAuth = require("../middlewares/userAuth.middleware");

router.post("/", userAuth, createWithdraw);
router.get("/my", userAuth, getMyWithdraws);

module.exports = router;
