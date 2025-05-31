const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const {authorize} = require("../middleware/authorize");

router.get('/', authorize("buyer"), favoriteController.getFavoritesByBuyer);
router.delete('/:menuId', authorize("buyer"), favoriteController.deleteFavorite)

module.exports = router;
