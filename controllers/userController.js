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

exports.getUser =  (req,res) =>{
    User.getUser(req.body.email, async (err,results)=>{
        if(err) throw err;
        const user = results[0];

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).json({
              error: "Wrong email or password.",
            });
          }
          const token = jwt.sign({ id: user.user_id, email: user.email }, "kunci", {
            expiresIn: 3600,
          });
          res.status(200).json({ token });

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
