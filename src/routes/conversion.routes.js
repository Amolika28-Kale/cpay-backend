const express = require("express");
const router = express.Router();
const { convertUSDTtoINR } = require("../controllers/conversion.controller");
const userAuth = require("../middlewares/userAuth.middleware");

router.post("/convert", userAuth, convertUSDTtoINR);

module.exports = router;
