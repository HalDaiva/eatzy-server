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
    }
};

module.exports = Menu;
