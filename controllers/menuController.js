const MenuModel = require('../models/menuModel');

exports.getMenusWithCategories = async (req, res) => {
    try {
        const data = await MenuModel.getMenusWithCategories();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.toggleMenuVisibility = async (req, res) => {
    const menuId = req.params.id;
    try {
        await MenuModel.toggleVisibility(menuId);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMenu = async (req, res) => {
    const menuId = req.params.id;
    try {
        await MenuModel.deleteMenu(menuId);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
