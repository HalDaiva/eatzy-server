const db = require('../config/db');

const Addon = {
    // Ambil menu beserta kategori dan add-on
    async getAddOnsByUserId(userId) {
        const query = `
            SELECT 
                ac.addon_category_id,
                ac.addon_category_name,
                ac.is_multiple_choice,
                a.addon_id,
                a.addon_name,
                a.addon_price,
                a.addon_is_available
            FROM users u
            JOIN canteens c ON c.canteen_id = u.user_id
            LEFT JOIN addon_categories ac ON ac.canteen_id = c.canteen_id
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

module.exports = Addon;
