const express = require("express");
const router = express.Router();

const userAuth = require("../middlewares/userAuth.middleware");
const adminAuth = require("../middlewares/adminAuth.middleware");

const {
  getMyTransactions,
  getAllTransactions
} = require("../controllers/transaction.controller");

router.get("/my", userAuth, getMyTransactions);
router.get("/all", adminAuth, getAllTransactions);

module.exports = router;
