const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/', menuController.getMenusWithCategories);
router.delete('/menu/:id', menuController.deleteMenu);

module.exports = router;
