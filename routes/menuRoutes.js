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
router.put('/categories', authorize('canteen'), menuController.updateCategoryName);

//Hapus kategori menu berdasarkan ID v
router.delete('/deleteCategoriesMenu', authorize('canteen'), menuController.deleteCategory);

//Hapus menu berdasarkan ID v
router.delete('/deleteMenus', authorize('canteen'), menuController.deleteMenu);

//Update ketersediaan menu v
router.put('/availableMenu', authorize('canteen'), menuController.toggleMenuAvailability);

//Update menu by id v
router.put('/menus/:id', authorize('canteen'), menuController.updateMenu);

//ambil item menu v
router.get('/menuItem/:id', authorize(), menuController.getMenuItem);

//ambil list kategori menu v
router.get('/categoryList/:id', authorize(), menuController.getMenuCategoryList);

//create kategori menu v
router.post('/createMenuCategory',authorize('canteen'), menuController.createMenuCategory);


//===================== AddOn =====================//

//ambil semua addon dan kategorinya v
router.get('/addon', authorize(), menuController.getAddonWithCategories);

// create and edit kategori addOn v
router.post('/addon', authorize('canteen'), menuController.createAddonCategory);

// Edit kategori yang sudah ada v
router.put('/addon/:id', authorize('canteen'), menuController.updateAddonCategory);











module.exports = router;
