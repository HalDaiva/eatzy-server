const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Get all menus with categories
router.get('/menus/with-categories', menuController.getMenusWithCategories);

// Toggle menu visibility
router.patch('/menu/:id/visibility', menuController.toggleMenuVisibility);

// Delete a menu
router.delete('/menu/:id', menuController.deleteMenu);

module.exports = router;
