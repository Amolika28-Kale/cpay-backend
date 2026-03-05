// routes/transaction.routes.js
const express = require("express");
const router = express.Router();

const userAuth = require("../middlewares/userAuth.middleware");
const adminAuth = require("../middlewares/adminAuth.middleware");

const {
  getMyTransactions,
  getAllTransactions,
  getTodayTeamStats  // ✅ नवीन function import करा
} = require("../controllers/transaction.controller");

// Existing routes
router.get("/my", userAuth, getMyTransactions);
router.get("/all", adminAuth, getAllTransactions);

// ✅ NEW: Today's team statistics route
router.get("/today-team-stats", userAuth, getTodayTeamStats);

module.exports = router;