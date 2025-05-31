const express = require('express');
const router = express.Router();
const canteenController = require('../controllers/canteenController');
const {authorize} = require('../middleware/authorize');

router.get('/', authorize('buyer'), canteenController.getAllCanteens);
router.get('/:id', canteenController.getCanteenById);
router.get('/:id/menu-category', canteenController.getAllMenuCategoryByCanteen);
router.get('/:id/order', authorize('buyer'), canteenController.getOrderByBuyerAndCanteen);

module.exports = router;
