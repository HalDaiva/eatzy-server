const User = require('../models/userModel');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const transporter = require('../config/transporter');

exports.login = async (req,res) => {
    try {
        const results = await User.getByEmail(req.body);
        console.log(req.body);

        if (!results) return res.status(401).json({
            error: "Email atau password salah.",
        });
        const user = results;
        console.log(user);
        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Email atau password salah." });
        }

        const token = jwt.sign(
            { id: user.user_id, email: user.email },
            "kunci",
            { expiresIn: 3600 }
        );

        res.status(200).json({ token });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};


exports.register = async (req, res) => {
    try{

        const results = await User.getByEmail(req.body);

        if(results) {
            return res.status(401).json({ error: "Akun dengan email ini telah terdaftar" });
        } else {
            const registredUser = await User.create(req.body);
            res.status(200).json(registredUser);
        }

    } catch (e) {
        res.status(500).json({ error: e.message });
    }

        // INI BUAT NYOBA FITUR OTP TAPI MASIH GAGAL

        // Send email asynchronously
        // const info = await transporter.sendMail({
        //     from: 'whitney95@ethereal.email', // sender address
        //     to: req.body.email, // list of receivers
        //     subject: "Hello ✔", // Subject line
        //     text: "OTP: 123456", // plain text body
        //     html: "<b>OTP: </b>123456", // html body
        // });
        //
        // console.log("Email sent: ", info.response);

};