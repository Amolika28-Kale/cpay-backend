const express = require('express');
const { getActivePaymentMethods } = require('../controllers/paymentMethodController');
const router = express.Router();


router.get('/', getActivePaymentMethods);

module.exports = router;
