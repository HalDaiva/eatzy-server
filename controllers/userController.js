const User = require('../models/userModel');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};


exports.getUserById = async (req, res) => {
    try {
        const user = await User.getById(req.params.id);
        res.json(user);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.update(req.params.id, req.body);
        res.json(user);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

exports.updateDeviceToken = async (req, res) => {
    try {
        const result = await User.updateDeviceToken(req.user.id, req.body.deviceToken);
        console.log(result);
        res.json(result);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const result = await User.delete(req.params.id)
        res.json(result);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};
