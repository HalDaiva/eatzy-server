const express = require('express');
const router = express.Router();
const canteenController = require('../controllers/canteenController');
const menuController = require('../controllers/menuController');
const {authorize} = require('../middleware/authorize');

router.get('/', authorize('buyer'), canteenController.getAllCanteens);
router.get('/:id/menu-category', canteenController.getAllMenuCategoryByCanteen);

module.exports = router;
