const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/cart', cartController.getAllCarts);
router.get('/cart/:id', cartController.getCartById);
router.delete('/cart/:id', cartController.deleteCart);

module.exports = router;