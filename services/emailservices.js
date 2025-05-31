const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendOTPEmail(email, name, otp) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Kode Verifikasi OTP - Eatzy Buyer',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #F59A2F;">Verifikasi Akun Anda</h2>
                    <p>Halo ${name},</p>
                    <p>Terima kasih telah mendaftar di Eatzy Buyer. Gunakan kode OTP berikut untuk verifikasi akun Anda:</p>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #F59A2F; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
                    </div>
                    <p>Kode ini akan kadaluarsa dalam 10 menit.</p>
                    <p>Jika Anda tidak mendaftar akun ini, abaikan email ini.</p>
                    <br>
                    <p>Salam,<br>Tim Eatzy Buyer</p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
}

module.exports = new EmailService();