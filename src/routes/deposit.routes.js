const express = require("express");
const router = express.Router();

const { createDeposit, getMyDeposits } = require("../controllers/deposit.controller");
const userAuth = require("../middlewares/userAuth.middleware");

router.post("/", userAuth, createDeposit);
router.get("/my", userAuth, getMyDeposits);

module.exports = router;
