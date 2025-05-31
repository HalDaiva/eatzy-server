const nodemailer = require("nodemailer");
const transporter = require("../config/transporter");

exports.sendEmail = async (req, res) => {
    try {
        const mailOptions = {
            from: {
                name: 'Eatzy',
                address: process.env.EMAIL_ADDRESS
            },
            to: "akunta1990@gmail.com", // MASUKIN NAMA PENERIMA EMAIL DISINI
            subject: "Eatzy Email Verification",
            text: "Your verification code: 987654", // MASUKAN ISI PLAIN TEXT DISINI
            html: "Your verification code: <b>987654</b>", // JIKA PERLLU, MASUKAN ISI HTML BODY DISINI
        }

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: error.message });
    }
};




