const db = require("../config/db");
const bcrypt = require("bcryptjs");

const Menu = {
    async getAllMenuCategoryByCanteen(id) {
        const [rows] = await db.query(
            "SELECT mc.menu_category_id, mc.menu_category_name, m.menu_id, m.menu_name, m.preparation_time, m.menu_image, m.menu_is_available, m.menu_price FROM menu_categories mc LEFT JOIN menus m ON mc.menu_category_id = m.menu_category_id WHERE mc.canteen_id = ? ORDER BY mc.menu_category_name, m.menu_name;",
            [id]
        );

        let menuCategories = [];

        for (const row of rows) {
            let menuCategory = menuCategories.find(
                (mc) => mc.menu_category_id === row.menu_category_id
            );

            if (!menuCategory) {
                menuCategory = {
                    menu_category_id: row.menu_category_id,
                    menu_category_name: row.menu_category_name,
                    menus: [],
                };
                menuCategories.push(menuCategory);
            }

            let menu = menuCategory.menus.find(
                (m) => m.menu_id === row.menu_id
            );
            if (!menu) {
                menu = {
                    menu_id: row.menu_id,
                    menu_name: row.menu_name,
                    menu_image: row.menu_image,
                    menu_price: row.menu_price,
                    menu_is_available: row.menu_is_available === 1,
                };
                menuCategory.menus.push(menu);
            }
        }

        return menuCategories;
    },

    async getMenuById(id) {
        const [rows] = await db.query(
            "SELECT m.menu_id, m.menu_name, m.preparation_time, m.menu_image, m.menu_is_available, m.menu_price, ac.addon_category_id, ac.addon_category_name, ac.is_multiple_choice, a.addon_id, a.addon_name, a.addon_price, a.addon_is_available FROM menus m LEFT JOIN menu_addon_categories mac ON m.menu_id = mac.menu_id LEFT JOIN addon_categories ac ON mac.addon_category_id = ac.addon_category_id LEFT JOIN addons a ON ac.addon_category_id = a.addon_category_id WHERE m.menu_id = ? ORDER BY ac.addon_category_name, a.addon_name;",
            [id]
        );

        let addOnCategories = [];

        for (const row of rows) {
            let addOnCategory = addOnCategories.find(
                (ac) => ac.addon_category_id === row.addon_category_id
            );

            if (!addOnCategory) {
                addOnCategory = {
                    addon_category_id: row.addon_category_id,
                    addon_category_name: row.addon_category_name,
                    is_multiple_choice: row.is_multiple_choice === 1,
                    addon: [],
                };
                addOnCategories.push(addOnCategory);
            }

            let addOn = addOnCategory.addon.find(
                (a) => a.addon_id === row.addon_id
            );
            if (!addOn) {
                addOn = {
                    addon_id: row.addon_id,
                    addon_name: row.addon_name,
                    addon_price: row.addon_price,
                    addon_is_available: row.addon_is_available === 1,
                };
                addOnCategory.addon.push(addOn);
            }
        }

        const menu = {
            menu_id: rows[0].menu_id,
            menu_name: rows[0].menu_name,
            preparation_time: rows[0].preparation_time,
            menu_image: rows[0].menu_image,
            menu_is_available: rows[0].menu_is_available === 1,
            menu_price: rows[0].menu_price,
            addon_categories: addOnCategories,
        };
        return menu;
    },

    async getMenuByQuery(menuName) {
        const keyword = `%${menuName}%`;
        const [rows] = await db.query(
            "SELECT m.menu_id, m.menu_name, m.menu_image, m.menu_is_available, m.menu_price, cte.canteen_id, cte.canteen_name, cte.canteen_is_open FROM menus AS m JOIN menu_categories AS mc ON m.menu_category_id = mc.menu_category_id JOIN canteens AS cte ON mc.canteen_id = cte.canteen_id WHERE m.menu_is_available = 1 AND cte.canteen_is_open = 1 AND m.menu_name LIKE ?",
            [keyword]
        );
        let menus = [];

        for (const row of rows) {
            const menu = {
                menu_id: row.menu_id,
                menu_name: row.menu_name,
                menu_image: row.menu_image,
                menu_is_available: row.menu_is_available === 1,
                menu_price: row.menu_price,
                canteen_id: row.canteen_id,
                canteen_name: row.canteen_name,
                canteen_is_open: row.canteen_is_open === 1,
            };
            menus.push(menu);
        }
        return menus;
    },

    async createFavorite(buyerId, menuId) {
        const [checkFav] = await db.query(
            "SELECT COUNT(*) FROM favorites WHERE buyer_id = ? AND menu_id = ?;",
            [buyerId, menuId]
        );
        if (checkFav[0]["COUNT(*)"] === 0) {    
            const [result] = await db.query(
                "INSERT INTO `favorites`(`buyer_id`, `menu_id`) VALUES (?,?)",
                [buyerId, menuId]
            );
            return { message: "Succesfully added to favorites", alreadyExists: false };
        } else {
            return { message: "Already in favorites", alreadyExists: true };
        }
    },
};

module.exports = Menu;
