const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const {authorize} = require('../middleware/authorize');

router.get('/', authorize("buyer"), orderController.getOrdersByBuyer);
router.get('/:id', authorize(), orderController.getOrdersById);
router.post('/duplicate/:id', authorize(), orderController.duplicateOrder);

module.exports = router;
