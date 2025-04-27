const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

module.exports = transporter;