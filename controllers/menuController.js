const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Menu = require("../models/menuModel");

exports.getMenuById = async (req, res) => {
    try {
        const menu = await Menu.getMenuById(req.params.id);
        res.json(menu);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getMenuByQuery = async (req, res) => {
    try {
        const menus = await Menu.getMenuByQuery(req.params.query);
        res.json(menus);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createFavorite = async (req, res) => {
    try {
        const favoriteMenus = await Menu.createFavorite(
            req.user.id,
            req.params.menuId
        );
        res.json(favoriteMenus);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};


exports.getMenusWithCategories = async (req, res) => {
    try {
        const userId = req.user.id; // Pastikan middleware auth mengisi req.user
        const rows = await Menu.getMenusWithAddOnsByUserId(userId);

        const categoryMap = {};

        for (const row of rows) {
            if (!row.menu_category_id) continue;

            // Inisialisasi kategori
            if (!categoryMap[row.menu_category_id]) {
                categoryMap[row.menu_category_id] = {
                    menu_category_id: row.menu_category_id,
                    canteen_id: row.canteen_id,
                    menu_category_name: row.menu_category_name,
                    menus: [],
                };
            }

            const category = categoryMap[row.menu_category_id];

            // Cari atau tambah menu
            let menu = category.menus.find(m => m.menu_id === row.menu_id);
            if (!menu && row.menu_id) {
                menu = {
                    menu_id: row.menu_id,
                    menu_name: row.menu_name,
                    menu_price: row.menu_price,
                    preparation_time: row.preparation_time,
                    menu_image: row.menu_image,
                    menu_is_available: row.menu_is_available === 1,
                    addon_categories: [],
                };
                category.menus.push(menu);
            }

            if (menu && row.addon_category_id) {
                // Cari atau tambah kategori addon
                let addonCategory = menu.addon_categories.find(ac => ac.addon_category_id === row.addon_category_id);
                if (!addonCategory) {
                    addonCategory = {
                        addon_category_id: row.addon_category_id,
                        addon_category_name: row.addon_category_name,
                        is_multiple_choice: row.is_multiple_choice === 1,
                        addons: [],
                    };
                    menu.addon_categories.push(addonCategory);
                }

                if (row.addon_id) {
                    // Tambah addon
                    addonCategory.addons.push({
                        addon_id: row.addon_id,
                        addon_name: row.addon_name,
                        addon_price: row.addon_price,
                        addon_is_available: row.addon_is_available === 1,
                    });
                }
            }
        }

        const finalResult = Object.values(categoryMap);
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
        const menu_category_name = req.body.menu_category_name;

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
        const menu_is_available = req.body.menuAvailable;

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
    try {
        const canteen_id = req.user.id;

        const { menu_category_name } = req.body;
        // Validasi sederhana
        if (!menu_category_name) {
            return res.status(400).json({ error: 'Field kosong' });
        }

        const menuCategoryId = await Menu.createMenuCategory({
            menu_category_name,
            canteen_id
        });

        res.status(201).json({ message: 'Kategori menu berhasil ditambahkan', menuCategoryId: menuCategoryId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal menambahkan kategori menu' });
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
                        addon_is_available: row.addon_is_available === 1,
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
        // Jika addons diberikan dan berbentuk array, masukkan ke DB
        if (Array.isArray(addons) && addons.length > 0) {
            await Addon.insertAddons(addons, categoryId);
        }

        // Berhasil
        res.status(201).json({
            message: "Kategori Add-On berhasil dibuat",
            addon_category_id: categoryId,
            addons_created: Array.isArray(addons) ? addons.length : 0
        });
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
        const addon_is_available = req.body.AddonAvailable;

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
