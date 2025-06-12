const Menu = require('../models/menuModel');
const Addon = require('../models/addonModel');

exports.getMenusWithCategories = async (req, res) => {
    try {
        const userId = req.user.id; // pastikan middleware auth mengisi req.user
        const rows = await Menu.getMenusWithAddOnsByUserId(userId);

        // Struktur data akhir: kategori → menu → addon kategori → addons
        const categoryMap = {};
        
        for (const row of rows) {
            if (!categoryMap[row.menu_category_id]) {
                categoryMap[row.menu_category_id] = {
                    menu_category_id: row.menu_category_id,
                    canteen_id: row.canteen_id,
                    menu_category_name: row.menu_category_name,
                    menus: {},
                };
            }

            const menuMap = categoryMap[row.menu_category_id].menus;

            if (!menuMap[row.menu_id]) {
                menuMap[row.menu_id] = {
                    menu_id: row.menu_id,
                    menu_name: row.menu_name,
                    menu_price: row.menu_price,
                    preparation_time: row.preparation_time,
                    menu_image: row.menu_image,
                    menu_is_available: row.menu_is_available === 1,
                    addon_categories: {},
                };
            }

            const addonCategoryMap = menuMap[row.menu_id].addon_categories;

            if (row.addon_category_id) {
                if (!addonCategoryMap[row.addon_category_id]) {
                    addonCategoryMap[row.addon_category_id] = {
                        addon_category_id: row.addon_category_id,
                        addon_category_name: row.addon_category_name,
                        is_multiple_choice: row.is_multiple_choice === 1,
                        addons: [],
                    };
                }

                if (row.addon_id) {
                    addonCategoryMap[row.addon_category_id].addons.push({
                        addon_id: row.addon_id,
                        addon_name: row.addon_name,
                        addon_price: row.addon_price,
                        addon_is_available: row.addon_is_available === 1,
                    });
                }
            }
        }
        console.log(categoryMap);

        // Format final: ubah object ke array dan bersihkan nested maps
        const finalResult = Object.values(categoryMap).map(category => ({
            ...category,
            menus: Object.values(category.menus).map(menu => ({
                ...menu,
                addon_categories: Object.values(menu.addon_categories),
            })),
        }));

        res.json(finalResult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

//buat menu
exports.createMenu = async (req, res) => {
    const connection = await require('../config/db').getConnection();
    try {
        await connection.beginTransaction();

        const {
            menu_category_id,
            menu_name,
            menu_price,
            preparation_time,
            menu_image,
            addon_category_ids = [], // array of addon category ids
        } = req.body;

        // Validasi sederhana
        if (!menu_category_id || !menu_name || !menu_price) {
            return res.status(400).json({ error: 'Field tidak lengkap' });
        }

        const userId = req.user.id;

        // Cek apakah kategori tersebut milik kantin user
        const isOwner = await Menu.checkCategoryOwnership(menu_category_id, userId);
        if (!isOwner) {
            return res.status(403).json({ error: 'Akses ditolak: kategori bukan milik Anda' });
        }

        const menuId = await Menu.createMenu({
            menu_category_id,
            menu_name,
            menu_price,
            preparation_time,
            menu_image,
            menu_is_available: true,
        }, connection);

        if (addon_category_ids.length > 0) {
            await Menu.linkMenuWithAddonCategories(menuId, addon_category_ids, connection);
        }

        await connection.commit();
        res.status(201).json({ message: 'Menu berhasil ditambahkan', menu_id: menuId });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Gagal menambahkan menu' });
    } finally {
        connection.release();
    }
};

// Update kategori menu
exports.updateCategoryName = async (req, res) => {
    try {
        const menu_category_id = req.params.id;
        const menu_category_name  = req.body.menu_category_name;

        const userId = req.user.id;

        const isOwner = await Menu.checkCategoryOwnership(menu_category_id, userId);
        if (!isOwner) {
            return res.status(403).json({ error: 'Akses ditolak: kategori bukan milik Anda' });
        }

        await Menu.updateCategoryName(menu_category_id, menu_category_name);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error in updateCategoryName:", error);
        res.status(500).json({ error: 'Failed to update category' });
    }
};

// Hapus kategori menu berdasarkan ID
exports.deleteCategory = async (req, res) => {
    try {
        const menu_category_id = req.params.id;
        const userId = req.user.id;

        const isOwner = await Menu.checkCategoryOwnership(menu_category_id, userId);
        if (!isOwner) {
            return res.status(403).json({ error: 'Akses ditolak: kategori bukan milik Anda' });
        }

        await Menu.deleteMenuByCategory(menu_category_id);
        await Menu.deleteCategoryById(menu_category_id);

        res.sendStatus(200);
    } catch (error) {
        console.error("Error in deleteCategory:", error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
};

// Hapus menu berdasarkan ID
exports.deleteMenu = async (req, res) => {
    try {
        const menuId = req.params.id;
        const userId = req.user.id;

        const isOwner = await Menu.checkMenuOwnership(menuId, userId);
        if (!isOwner) {
            return res.status(403).json({ error: 'Akses ditolak: menu bukan milik Anda' });
        }

        await Menu.deleteMenuById(menuId);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error in deleteMenu:", error);
        res.status(500).json({ error: 'Failed to delete menu' });
    }
};

// Toggle menu availability (aktif/nonaktif)
exports.toggleMenuAvailability = async (req, res) => {
    try {
        const menuId = req.params.id;
        const menu_is_available  = req.body;

        const userId = req.user.id;

        const isOwner = await Menu.checkMenuOwnership(menuId, userId);
        if (!isOwner) {
            return res.status(403).json({ error: 'Akses ditolak: menu bukan milik Anda' });
        }

        await Menu.toggleMenuAvailability(menuId, menu_is_available);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error in toggleMenuAvailability:", error);
        res.status(500).json({ error: 'Failed to toggle menu availability' });
    }
};

//ambil menu by id
exports.getMenuItem = async (req, res) => {
    try {
        const menuId = req.params.id;

        const userId = req.user.id;

        const isOwner = await Menu.checkMenuOwnership(menuId, userId);
        if (!isOwner) {
            return res.status(403).json({ error: 'Akses ditolak: menu bukan milik Anda' });
        }

        const menu = await Menu.getMenuItem(menuId);

        if (!menu) {
            return res.status(404).json({ message: "Menu not found." });
        }

        res.status(200).json(menu);
    } catch (error) {
        console.error("Error in getMenuItem:", error);
        res.status(500).json({ error: 'Failed to getMenuItem' });
    }
};

//update menu
exports.updateMenu = async (req, res) => {
    try {
        const menuId = req.params.id;
        const {
            menu_name,
            preparation_time,
            menu_image,
            menu_price,
            menu_is_available,
            menu_category_id,
            addon_category_ids = []
        } = req.body;

        // Update menu utama
        await Menu.updateMenu(menuId, {
            menu_name,
            preparation_time,
            menu_image,
            menu_price,
            menu_is_available,
            menu_category_id
        });

        // Update relasi addon categories jika ada
        if (Array.isArray(addon_category_ids)) {
            await Menu.updateMenuAddonCategories(menuId, addon_category_ids);
        }

        res.status(200).json({ message: 'Menu updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update menu.' });
    }
};

//ambil menu kategori by id
exports.getMenuCategoryList = async (req, res) => {
    try {
        const canteen_id = req.user.id;

        const categories = await Menu.getMenuCategoryList(canteen_id);

        if (!categories) {
            return res.status(404).json({ message: "categories not found." });
        }

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error in getMenuCategoryList:", error);
        res.status(500).json({ error: 'Failed to getMenuCategoryList' });
    }
};

//create kategori menu
exports.createMenuCategory = async (req, res) => {
    const connection = await require('../config/db').getConnection();
    try {
        const canteen_id = req.user.id;
        await connection.beginTransaction();

        const menu_category_name = req.body.menu_category_name;

        // Validasi sederhana
        if (!menu_category_name) {
            return res.status(400).json({ error: 'Field kosong' });
        }

        const menuCategoryId = await Menu.createMenuCategory({
            menu_category_name,
            canteen_id
        }, connection);

        await connection.commit();
        res.status(201).json({ message: 'Kategori menu berhasil ditambahkan', menuCategoryId: menuCategoryId });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Gagal menambahkan kategori menu' });
    } finally {
        connection.release();
    }
};


//===================== AddOn =====================//

exports.getAddonWithCategories = async (req, res) => {
    try {
        const userId = req.user.id;
        const rows = await Addon.getAddOnsByUserId(userId); // pastikan nama AddOn sudah diimport

        // addon_category_id => { addon_category_name, is_multiple_choice, addons: [] }
        const addonCategoryMap = {};

        for (const row of rows) {
            if (!row.addon_category_id) continue;

            if (row.addon_category_id) {
                if (!addonCategoryMap[row.addon_category_id]) {
                    addonCategoryMap[row.addon_category_id] = {
                        addon_category_id: row.addon_category_id,
                        addon_category_name: row.addon_category_name,
                        is_multiple_choice: row.is_multiple_choice === 1,
                        addons: [],
                    };
                }

                if (row.addon_id) {
                    addonCategoryMap[row.addon_category_id].addons.push({
                        addon_id: row.addon_id,
                        addon_name: row.addon_name,
                        addon_price: row.addon_price,
                        addon_is_available: row.addon_is_available=== 1,
                    });
                }
            }

        }

        // Format final: ubah object ke array dan bersihkan nested maps
        const finalResult = Object.values(addonCategoryMap);
        res.json(finalResult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.createAddonCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addon_category_name, is_multiple_choice = true, addons } = req.body;

        const categoryId = await Addon.createAddonCategory(userId, addon_category_name, is_multiple_choice ? 1 : 0);
        await Addon.insertAddons(addons, categoryId);

        res.status(201).json({ message: "Kategori Add-On berhasil dibuat", addon_category_id: categoryId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateAddonCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const {
            addon_category_name,
            is_multiple_choice,
            addons = []
        } = req.body;

        await Addon.updateAddonCategory(categoryId, addon_category_name, is_multiple_choice ? 1 : 0);
        // Update daftar item add-on
        if (Array.isArray(addons)) {
            await Addon.syncAddons(addons, categoryId);
        }

        res.status(200).json({ message: "Kategori Add-On berhasil diperbarui" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

//avail addon
exports.toggleAddOnAvailability = async (req, res) => {
    try {
        const addonId = req.params.id;
        const addon_is_available = req.body;

        const userId = req.user.id;

        const isOwner = await Addon.checkAddonOwnership(addonId, userId);
        if (!isOwner) {
            return res.status(403).json({ error: 'Akses ditolak: addon bukan milik Anda' });
        }

        await Addon.toggleAddonAvailability(addonId, addon_is_available);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error in toggleaddonAvailability:", error);
        res.status(500).json({ error: 'Failed to toggle addon availability' });
    }
};


// Hapus kategori addon berdasarkan ID
exports.deleteAddonCategory = async (req, res) => {
    try {
        const addon_category_id = req.params.id;
        const userId = req.user.id;

        const isOwner = await Addon.checkCategoryOwnership(addon_category_id, userId);
        console.log(isOwner);
        if (!isOwner) {
            return res.status(403).json({ error: 'Akses ditolak: kategori bukan milik Anda' });
        }

        await Addon.deleteAddonByCategory(addon_category_id);
        await Addon.deleteCategoryById(addon_category_id);

        res.sendStatus(200);
    } catch (error) {
        console.error("Error in deleteCategory:", error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
};

// Hapus addon berdasarkan ID
exports.deleteAddon = async (req, res) => {
    try {
        const addonId = req.params.id;
        const userId = req.user.id;

        const isOwner = await Addon.checkAddonOwnership(addonId, userId);
        if (!isOwner) {
            return res.status(403).json({ error: 'Akses ditolak: addon bukan milik Anda' });
        }

        await Addon.deleteAddonById(addonId);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error in deleteaddon:", error);
        res.status(500).json({ error: 'Failed to delete addon' });
    }
};

exports.editAddon = async (req, res) => {
  try {
    const addon_id = req.params.id;
    const {
      addon_name,
      addon_price,
      addon_is_available,
      addon_category_id
    } = req.body;

    const updateFields = {
      addon_name,
      addon_price,
      addon_is_available,
      addon_category_id
    };

    const result = await Addon.updateAddonById(addon_id, updateFields);

    res.status(200).json({
      message: 'Add-on berhasil diperbarui',
      result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

//ambil addon kategori by id
exports.getAddonCategoryList = async (req, res) => {
    try {
        const canteen_id = req.user.id;

        const categories = await Addon.getAddonCategoryList(canteen_id);

        if (!categories) {
            return res.status(404).json({ message: "categories not found." });
        }

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error in getaddonCategoryList:", error);
        res.status(500).json({ error: 'Failed to getaddonCategoryList' });
    }
};