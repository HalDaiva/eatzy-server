const db = require('../config/db');

const Menu = {
    getMenusWithCategories: callback => {
        const query = `
            SELECT 
                c.category_id, c.canteen_id, c.category_name,
                m.menu_id, m.menu_name, m.menu_price, m.menu_image, m.menu_status
            FROM categories c
            JOIN menus m ON m.category_id = c.category_id
        `;

        db.query(query, callback);
    },
    
    deleteMenuById: (id, callback) => {
        const query = 'DELETE FROM menus WHERE menu_id = ?';
        db.query(query, [id], callback);
    }
};

module.exports = Menu;
