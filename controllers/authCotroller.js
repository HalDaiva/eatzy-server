const User = require('../models/userModel');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login =  (req,res) =>{
    User.getByEmail(req.body, async (err,results)=> {
        if(err) throw err;

        if (results.length === 0) return res.status(401).json({
            error: "Wrong email or password.",
        });

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


exports.register = (req, res) => {
    console.log(req.body);
    User.create(req.body, (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, ...req.body });
    });
};