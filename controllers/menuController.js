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


exports.deleteMenu = async (req, res) => {
    try {
        const menuId = req.params.id;
        const result = await Menu.deleteMenuById(menuId);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        res.json({ message: 'Menu deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
