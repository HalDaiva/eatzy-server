const User = require('../models/userModel');

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

exports.createUser = (req, res) => {
    console.log(req.body);
    User.create(req.body, (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, ...req.body });
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
