const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Canteen = require('../models/canteenModel');
const Menu = require('../models/menuModel');


exports.getAllCanteens = async (req, res) => {
    try {
        const canteens = await Canteen.getAll();
        res.json(canteens);
    } catch (e) {
        res.status(500).json({error: e});
    }
};

exports.getCanteenById = async (req, res) => {
    try {
        const canteen = await Canteen.getCanteenById(req.params.id);
        res.json(canteen);
    } catch (e) {
        res.status(500).json({error: e});
    }
};

exports.getAllMenuCategoryByCanteen = async (req, res) => {
    try {
        const menuCategories = await Menu.getAllMenuCategoryByCanteen(req.params.id);
        res.json(menuCategories);
    } catch (e) {
        res.status(500).json({error: e});
    }
};