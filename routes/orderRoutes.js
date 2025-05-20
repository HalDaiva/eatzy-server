const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const {authorize} = require('../middleware/authorize');

router.post('/', authorize('buyer'), orderController.createOrder);
module.exports = router;

