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
                        addon_is_available: row.addon_is_available,
                    });
                }
            }
        }

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
                        addon_is_available: row.addon_is_available,
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
            menu_is_available : true,
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
        const { menu_category_id, menu_category_name } = req.body;

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
        const menu_category_id = req.body.menu_category_id;
        
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
        const menuId = req.body.id;
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
        const menuId = req.body.id;
        const { menu_is_available } = req.body;
        
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
exports.getMenuItem = async(req, res) =>{
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
        const userId = req.user.id;
        const {
            menu_id,
            menu_category_id,
            menu_name,
            menu_price,
            preparation_time,
            menu_image
        } = req.body;

        // Validasi input
        if (!menu_id || !menu_category_id || !menu_name || !menu_price) {
            return res.status(400).json({ error: 'Field tidak lengkap' });
        }

        // Cek kepemilikan menu
        const isOwner = await Menu.checkMenuOwnership(menu_id, userId);
        if (!isOwner) {
            return res.status(403).json({ error: 'Menu tidak ditemukan atau bukan milik Anda' });
        }

        await Menu.updateMenu(menu_id, {
            menu_category_id,
            menu_name,
            menu_price,
            preparation_time,
            menu_image
        });

        res.status(200).json({ message: 'Menu berhasil diperbarui' });
    } catch (error) {
        console.error("Error in updateMenu:", error);
        res.status(500).json({ error: 'Gagal memperbarui menu' });
    }
};

//ambil menu by id
exports.getMenuCategoryList = async(req, res) =>{
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
            menu_is_available : true,
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