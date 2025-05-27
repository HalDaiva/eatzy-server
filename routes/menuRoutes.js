const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const {authorize} = require('../middleware/authorize');

//amsil semua menu v
router.get('/menu', authorize(), menuController.getMenusWithCategories);

// Tambah menuv
router.post('/menu/create',  authorize('canteen'), menuController.createMenu);

// PUT: Update nama kategori menu v
router.put('/categories', authorize('canteen'), menuController.updateCategoryName);

// DELETE: Hapus kategori menu berdasarkan ID v
router.delete('/categoriesName', authorize('canteen'), menuController.deleteCategory);

// DELETE: Hapus menu berdasarkan ID
router.delete('/menus/', authorize('canteen'), menuController.deleteMenu);

// PATCH: Toggle ketersediaan menu
router.patch('/menus/', authorize('canteen'), menuController.toggleMenuAvailability);

router.get('/addon', authorize(), menuController.getAddonWithCategories);

module.exports = router;
