const User = require('../models/userModel');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


exports.getAllUsers = (req, res) => {
    User.getAll((err, results) => {
        if (err) throw err;
        res.json(results);
    });
};

exports.getUserById = (req, res) => {
    User.getById(req.params.id, (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
};

exports.updateUser = (req, res) => {
    User.update(req.params.id, req.body, err => {
        if (err) throw err;
        res.json({ id: req.params.id, ...req.body });
    });
};

exports.deleteUser = (req, res) => {
    User.delete(req.params.id, err => {
        if (err) throw err;
        res.json({ message: 'User deleted' });
    });
};
