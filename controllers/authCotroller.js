const User = require('../models/userModel');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const transporter = require('../config/transporter');

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
    User.create(req.body, async (err, result) => {
        if (err) throw err;

        // Send email asynchronously
        const info = await transporter.sendMail({
            from: 'whitney95@ethereal.email', // sender address
            to: req.body.email, // list of receivers
            subject: "Hello ✔", // Subject line
            text: "OTP: 123456", // plain text body
            html: "<b>OTP: </b>123456", // html body
        });

        console.log("Email sent: ", info.response);

        res.json({ id: result.insertId, ...req.body });
    });
};