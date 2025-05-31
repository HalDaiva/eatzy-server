const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Menu = require("../models/menuModel");

exports.getMenuById = async (req, res) => {
    try {
        const menu = await Menu.getMenuById(req.params.id);
        res.json(menu);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getMenuByQuery = async (req, res) => {
    try {
        const menus = await Menu.getMenuByQuery(req.params.query);
        res.json(menus);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createFavorite = async (req, res) => {
    try {
        const favoriteMenus = await Menu.createFavorite(
            req.user.id,
            req.params.menuId
        );
        res.json(favoriteMenus);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
