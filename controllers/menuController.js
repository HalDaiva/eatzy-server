const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Menu = require('../models/menuModel');

// exports.getAllMenuCategoryByCanteen = async (req, res) => {
//     try {
//         const menuCategories = await Menu.getAllMenuCategoryByCanteen(req.params.id);
//         res.json(menuCategories);
//     } catch (e) {
//         res.status(500).json({error: e});
//     }
// };

exports.getMenuById = async (req, res) => {
    try {
        const menu = await Menu.getMenuById(req.params.id);
        res.json(menu);
    } catch (e) {
        res.status(500).json({error: e});
    }
};