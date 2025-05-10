const Menu = require('../models/menuModel');

exports.getMenusWithCategories = (req, res) => {
    Menu.getMenusWithCategories((err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        // Format ke bentuk list of category, masing-masing dengan array menus
        const categoryMap = {};

        results.forEach(row => {
            const categoryId = row.category_id;
            if (!categoryMap[categoryId]) {
                categoryMap[categoryId] = {
                    idCategory: categoryId,
                    idCanteen: row.canteen_id,
                    categoryName: row.category_name,
                    menus: []
                };
            }

            categoryMap[categoryId].menus.push({
                idMenu : row.menu_id,
                namaMenu: row.menu_name,
                price: row.menu_price,
                imageRes: row.menu_image,
                visibleMenu: row.menu_status === 1
            });
            
        });

        res.json(Object.values(categoryMap));
    });
};

exports.deleteMenu = (req, res) => {
    const menuId = req.params.id;
    
    Menu.deleteMenuById(menuId, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Menu not found' });

        res.json({ message: 'Menu deleted successfully' });
    });
};
