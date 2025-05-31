const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authorize } = require('../middleware/authorize');

router.get('/', authorize('buyer'), cartController.getCartByUser);
router.delete('/', authorize('buyer'), cartController.deleteCart);

module.exports = router;