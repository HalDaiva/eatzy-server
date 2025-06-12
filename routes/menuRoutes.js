const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const {authorize} = require('../middleware/authorize');

//===================== Menu =====================//

//ambil semua menu vv
router.get('/menu', authorize(), menuController.getMenusWithCategories);

// Tambah menu v
router.post('/menu/createMenu',  authorize('canteen'), menuController.createMenu);

//Update nama kategori menu vv
router.put('/categories/:id', authorize('canteen'), menuController.updateCategoryName);

//Hapus kategori menu berdasarkan ID vv
router.delete('/deleteCategoriesMenu/:id', authorize('canteen'), menuController.deleteCategory);

//Hapus menu berdasarkan ID vv
router.delete('/deleteMenu/:id', authorize('canteen'), menuController.deleteMenu);

//Update ketersediaan menu vv
router.put('/availableMenu/:id', authorize('canteen'), menuController.toggleMenuAvailability);

//Update menu by id v
router.put('/menus/:id', authorize('canteen'), menuController.updateMenu);

//ambil item menu v
router.get('/menuItem/:id', authorize(), menuController.getMenuItem);

//ambil list kategori menu v
router.get('/categoryList', authorize(), menuController.getMenuCategoryList);

//create kategori menu v
router.post('/createMenuCategory',authorize('canteen'), menuController.createMenuCategory);


//===================== AddOn =====================//

//ambil semua addon dan kategorinya vv
router.get('/addon', authorize(), menuController.getAddonWithCategories);

// create kategori addOn v
router.post('/addon', authorize('canteen'), menuController.createAddonCategory);

// Edit kategori yang sudah ada v
router.put('/addon/:id', authorize('canteen'), menuController.updateAddonCategory);

//buka tutup addon item v
router.put('/availableAddon/:id', authorize('canteen'), menuController.toggleAddOnAvailability);

//Hapus kategori Addon berdasarkan ID v
router.delete('/deleteCategoriesAddon/:id', authorize('canteen'), menuController.deleteAddonCategory);

//Hapus Addon berdasarkan ID v
router.delete('/deleteAddons/:id', authorize('canteen'), menuController.deleteAddon);

//update addon item
router.patch('/updateAddon/:id', authorize('canteen'), menuController.editAddon);

//ambil list kategori addon v
router.get('/categoryAddonList', authorize(), menuController.getAddonCategoryList);



module.exports = router;
