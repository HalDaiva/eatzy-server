const db = require('../config/db');

const Menu = {
    // Ambil menu beserta kategori dan add-on
    async getMenusWithAddOnsByUserId(userId) {
        const query = `
            SELECT 
                mc.menu_category_id,
                mc.canteen_id,
                mc.menu_category_name,
                m.menu_id,
                m.menu_name,
                m.menu_price,
                m.preparation_time,
                m.menu_image,
                m.menu_is_available,
                ac.addon_category_id,
                ac.addon_category_name,
                ac.is_multiple_choice,
                a.addon_id,
                a.addon_name,
                a.addon_price,
                a.addon_is_available
            FROM users u
            JOIN canteens c ON c.canteen_id = u.user_id
            JOIN menu_categories mc ON mc.canteen_id = c.canteen_id
            JOIN menus m ON m.menu_category_id = mc.menu_category_id
            LEFT JOIN menu_addon_categories mac ON mac.menu_id = m.menu_id
            LEFT JOIN addon_categories ac ON ac.addon_category_id = mac.addon_category_id
            LEFT JOIN addons a ON a.addon_category_id = ac.addon_category_id
            WHERE u.user_id = ? AND u.role = 'canteen'
        `;
        const [rows] = await db.query(query, [userId]);
        return rows;
    },

    // Hapus menu berdasarkan ID
    async deleteMenuById(id) {
        const [result] = await db.query('DELETE FROM menus WHERE menu_id = ?', [id]);
        return result;
    },

    async createMenu(menuData, connection) {
        const {
            menu_category_id,
            menu_name,
            menu_price,
            preparation_time,
            menu_image,
            menu_is_available,
        } = menuData;

        const [result] = await connection.query(
            `INSERT INTO menus 
         (menu_category_id, menu_name, menu_price, preparation_time, menu_image, menu_is_available) 
         VALUES (?, ?, ?, ?, ?, ?)`,
            [
                menu_category_id,
                menu_name,
                menu_price,
                preparation_time,
                menu_image,
                menu_is_available ? 1 : 0,
            ]
        );

        return result.insertId;
    },

    async linkMenuWithAddonCategories(menuId, addonCategoryIds, connection) {
        for (const addonCategoryId of addonCategoryIds) {
            await connection.query(
                `INSERT INTO menu_addon_categories (menu_id, addon_category_id) VALUES (?, ?)`,
                [menuId, addonCategoryId]
            );
        }
    },

    async updateCategoryName(menu_category_id, menu_category_name) {
        return await db.query(
            'UPDATE menu_categories SET menu_category_name = ? WHERE menu_category_id = ?',
            [menu_category_name, menu_category_id]
        );
    },

    async deleteCategoryById(id) {
        return await db.query('DELETE FROM menu_categories WHERE menu_category_id = ?', [id]);
    },

    async toggleMenuAvailability(menu_id, isAvailable) {
        return await db.query(
            'UPDATE menus SET menu_is_available = ? WHERE menu_id = ?',
            [isAvailable ? 1 : 0, menu_id]
        );
    }
};

module.exports = Menu;
