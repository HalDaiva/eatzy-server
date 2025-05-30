const express = require('express');
const router = express.Router();
const confirmationController = require('../controllers/confirmationController');
const { authorize } = require('../middleware/authorize');

router.get('/confirmed', authorize('buyer'), confirmationController.getConfirmedOrder);
router.get('/confirmed/:order_id', authorize('buyer'), confirmationController.getOrderById);
router.post('/confirm', authorize('buyer'), confirmationController.confirmOrder);
router.post('/new', authorize('buyer'), confirmationController.createNewOrder);

module.exports = router;