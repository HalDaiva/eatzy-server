const express = require('express');
const router = express.Router();
const confirmationController = require('../controllers/confirmationController');
const { authorize } = require('../middleware/authorize');

// Konfirmasi order (ubah status jadi 'waiting')
router.patch('/confirm/:order_id', authorize('buyer'), confirmationController.confirmOrder);

// Ambil detail order berdasarkan order_id
router.get('/:order_id', authorize('buyer'), confirmationController.getOrderById);

module.exports = router;