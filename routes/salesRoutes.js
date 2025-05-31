// routes/salesRoutes.js
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authorize } = require('../middleware/authorize');

router.get('/monthly', authorize('canteen'), salesController.getMonthlySales);

module.exports = router;