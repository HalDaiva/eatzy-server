const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const {authorize} = require('../middleware/authorize');

router.get('/', authorize("buyer"), orderController.getOrdersByBuyer);
router.get('/:id', authorize(), orderController.getOrdersById);
router.post('/duplicate/:id', authorize(), orderController.duplicateOrder);
router.post('/', authorize('buyer'), orderController.createOrder);
router.post('/order-item', authorize('buyer'), orderController.createOrderItem);
router.get('/order-item/:id', authorize('buyer'), orderController.getOrderItemById);
router.post('/get-order-items/',authorize('buyer'),orderController.getOrderItemsByIds);
router.delete('/order-items/',authorize('buyer'),orderController.deleteOrderItemsByIds);
router.post('/order-items/',authorize('buyer'),orderController.createOrderItems);
router.get('/:id/calculate-total-price', authorize('buyer'), orderController.calculateTotalPrice);

module.exports = router;
