const express = require('express');
const router = express.Router();
const scannerController = require('../controllers/scanner.controller');
const userAuth = require('../middlewares/userAuth.middleware');

router.post('/create', userAuth, scannerController.createScanner);
router.get('/active', userAuth, scannerController.getActiveScanners);
router.post('/pay', userAuth, scannerController.payScanner);
router.get('/my', userAuth, scannerController.getUserScanners);

module.exports = router;
