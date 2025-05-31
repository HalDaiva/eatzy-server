const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')
//tambah utk authorize
const { authorize } = require('../middleware/authorize');

router.get('/', authorize(), orderController.getOrders)
// router.get('/:order_id', orderController.getOrderById)
//ambil order (harus login)
router.get('/:order_id', authorize('canteen'), orderController.getOrderById)
// router.put('/:order_id', orderController.updateOrderStatus)
//update order (harus login)
router.put('/:order_id', authorize('canteen'), orderController.updateOrderStatus)

module.exports = router
