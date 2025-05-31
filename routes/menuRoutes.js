const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const {authorize} = require('../middleware/authorize');

router.get('/:id', menuController.getMenuById);
router.get('/search/:query', menuController.getMenuByQuery);
router.post('/:menuId/favorites', authorize('buyer'),menuController.createFavorite);

module.exports = router;