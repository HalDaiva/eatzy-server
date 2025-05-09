const Menu = require('../models/menuModel');

exports.getMenusWithCategories = (req, res) => {
    Menu.getMenusWithCategories((err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        // Format ke bentuk list of category, masing-masing dengan array menus
        const categoryMap = {};

        results.forEach(row => {
            const categoryName = row.category_name;
            if (!categoryMap[categoryName]) {
                categoryMap[categoryName] = {
                    name: categoryName,
                    menus: []
                };
            }

            categoryMap[categoryName].menus.push({
                title: row.menu_name,
                price: row.menu_price,
                imageRes: row.menu_image,
                visibleMenu: row.menu_status === 1
            });
            
        });

        res.json(Object.values(categoryMap));
    });
};
