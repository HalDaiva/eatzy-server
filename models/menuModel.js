const db = require('../config/db');

const getMenusWithCategories = async () => {
    const [categories] = await db.query(`
        SELECT c.category_id, c.category_name, m.*
        FROM categories c
        LEFT JOIN menus m ON m.category_id = c.category_id
        ORDER BY c.category_name
    `);

    const grouped = {};

    categories.forEach(row => {
        if (!grouped[row.category_id]) {
            grouped[row.category_id] = {
                name: row.category_name,
                menus: []
            };
        }
        if (row.menu_id) {
            grouped[row.category_id].menus.push({
                id: row.menu_id,
                title: row.menu_name,
                price: row.menu_price,
                imageRes: row.menu_image,
                visibleMenu: !!row.visible
            });
        }
    });

    return Object.values(grouped);
};

const toggleVisibility = async (menuId) => {
    await db.query(`
        UPDATE menus
        SET visible = NOT visible
        WHERE menu_id = ?
    `, [menuId]);
};

const deleteMenu = async (menuId) => {
    await db.query(`
        DELETE FROM menus
        WHERE menu_id = ?
    `, [menuId]);
};

module.exports = {
    getMenusWithCategories,
    toggleVisibility,
    deleteMenu
};
