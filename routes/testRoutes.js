const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const {authorize} = require('../middleware/authorize');

router.get('/send-email', testController.sendEmail);

module.exports = router;
