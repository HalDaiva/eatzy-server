const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const {authorize} = require('../middleware/authorize');

//===================== Menu =====================//

//ambil semua menu v
router.get('/menu', authorize(), menuController.getMenusWithCategories);

// Tambah menu v
router.post('/menu/createMenu',  authorize('canteen'), menuController.createMenu);

//Update nama kategori menu v
router.patch('/categories', authorize('canteen'), menuController.updateCategoryName);

//Hapus kategori menu berdasarkan ID v
router.delete('/deleteCategoriesMenu', authorize('canteen'), menuController.deleteCategory);

//Hapus menu berdasarkan ID v
router.delete('/deleteMenus', authorize('canteen'), menuController.deleteMenu);

//Update ketersediaan menu v
router.patch('/availableMenu', authorize('canteen'), menuController.toggleMenuAvailability);

//Update menu by id v
router.patch('/updateMenu', authorize('canteen'), menuController.updateMenu);

//ambil item menu v
router.get('/menuItem/:id', authorize(), menuController.getMenuItem);

//ambil list kategori menu v
router.get('/categoryList/:id', authorize(), menuController.getMenuCategoryList);

//create kategori menu




//===================== AddOn =====================//

//ambil semua addon dan kategorinya
router.get('/addon', authorize(), menuController.getAddonWithCategories);

module.exports = router;
