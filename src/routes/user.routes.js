const express = require('express');
const router = express.Router();
const { register, login, getReferralStats } = require('../controllers/userAuth.controller');
const userAuth = require("../middlewares/userAuth.middleware");

router.post('/register', register);
router.post('/login', login);
router.get("/referral", userAuth, getReferralStats);

module.exports = router;
