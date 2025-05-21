const db = require('../config/db');

const Menu = {
    getMenusWithCategoriesByUserId: (userId, callback) => {
        const query = `
            SELECT 
                mc.menu_category_id AS category_id,
                mc.canteen_id,
                mc.menu_category_name AS category_name,
                m.menu_id,
                m.menu_name,
                m.menu_price,
                m.menu_image,
                m.menu_is_available AS menu_status
            FROM users u
            JOIN canteens c ON c.canteen_id = u.user_id
            JOIN menu_categories mc ON mc.canteen_id = c.canteen_id
            LEFT JOIN menus m ON m.menu_category_id = mc.menu_category_id
            WHERE u.user_id = ? AND u.role = 'canteen'
        `;

        db.query(query, [userId], callback);
    },

    deleteMenuById: (id, callback) => {
        const query = 'DELETE FROM menus WHERE menu_id = ?';
        db.query(query, [id], callback);
    }
};

module.exports = Menu;
