const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const {authorize} = require('../middleware/authorize');

router.get('/menu', authorize('canteen'), menuController.getMenusWithCategories);
router.get('/addon', authorize('canteen'), menuController.getAddonWithCategories);
router.delete('/menu/:id', authorize('canteen'), menuController.deleteMenu);

module.exports = router;
