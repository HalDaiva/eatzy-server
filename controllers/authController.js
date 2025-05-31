const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const transporter = require('../config/transporter');
const { sendNotification } = require('../services/notificationService');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const user = await User.getByEmail({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(401).json({ error: 'Email atau password salah.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        // const isMatch = password === user.password;
        if (!isMatch) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }
        if (user.user_id) {
            await sendNotification(
                user.user_id,
                'Anda telah login ke Eatzy!',
                `Selamat datang di Eatzy. Kamu telah login sebagai ${user.role}.`
            );
        }
        const token = jwt.sign(
            { id: user.user_id, email: user.email, role: user.role },
            process.env.TOKEN_KEY,
            { expiresIn: '5m' }
        );
        res.status(200).json({ token });
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.register = async (req, res) => {
    try {
        let { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required.' });
        }
        const existingUser = await User.getByEmail({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Akun dengan email ini telah terdaftar.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        password = hashedPassword;
        const registeredUser = await User.create({ email, password, name });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await User.storeOtp(registeredUser.user_id, otp);
        const info = await transporter.sendMail({
            from: `"Eatzy" <${process.env.EMAIL_ADDRESS}>`,
            to: email,
            subject: 'Your OTP for Eatzy Registration',
            text: `Your OTP is: ${otp}`,
            html: `<b>Your OTP is: ${otp}</b>`,
        });
        console.log('Email sent:', info.response);
        res.status(201).json({ message: 'User registered successfully. OTP sent to email.' });
    } catch (e) {
        console.error('Register error:', e);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required.' });
        }
        const user = await User.getByEmail({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const storedOtp = await User.getOtp(user.user_id);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(401).json({ error: 'Invalid OTP.' });
        }
        await User.updateVerificationStatus(user.user_id);
        await User.clearOtp(user.user_id);
        res.status(200).json({ message: 'OTP verified successfully.' });
    } catch (e) {
        console.error('Verify OTP error:', e);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }
        const user = await User.getByEmail({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if (user.is_verified) {
            return res.status(400).json({ error: 'User is already verified.' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await User.storeOtp(user.user_id, otp);
        const info = await transporter.sendMail({
            from: `"Eatzy" <${process.env.EMAIL_ADDRESS}>`,
            to: email,
            subject: 'Your New OTP for Eatzy Registration',
            text: `Your new OTP is: ${otp}`,
            html: `<b>Your new OTP is: ${otp}</b>`,
        });
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'New OTP sent to email.' });
    } catch (e) {
        console.error('Resend OTP error:', e);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getUser = async (req, res) => {
    try {
        console.log('GET /auth/user - req.user:', req.user);
        if (!req.user || !req.user.id) {
            console.log('GET /auth/user - No user ID in req.user');
            return res.status(401).json({ error: 'Unauthorized: No user ID provided.' });
        }

        const user = await User.getById(req.user.id);
        if (!user) {
            console.log('GET /auth/user - User not found for ID:', req.user.id);
            return res.status(404).json({ error: 'User not found.' });
        }

        console.log('GET /auth/user - User found:', user);
        res.status(200).json({
            id: user.user_id, // Map user_id to id for app compatibility
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (e) {
        console.error('GET /auth/user error:', e.message, e.stack);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// New endpoint for forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }
        const user = await User.getByEmail({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await User.storeOtp(user.user_id, otp); // Reuse OTP mechanism
        const info = await transporter.sendMail({
            from: `"Eatzy" <${process.env.EMAIL_ADDRESS}>`,
            to: email,
            subject: 'Your OTP for Eatzy Password Reset',
            text: `Your OTP for password reset is: ${otp}`,
            html: `<b>Your OTP for password reset is: ${otp}</b>`,
        });
        console.log('Password reset OTP sent:', info.response);
        res.status(200).json({ message: 'Password reset OTP sent to email.' });
    } catch (e) {
        console.error('Forgot password error:', e);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// New endpoint to reset password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
        }
        const user = await User.getByEmail({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const storedOtp = await User.getOtp(user.user_id);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(401).json({ error: 'Invalid OTP.' });
        }
        await User.resetPasswordByEmail(email, newPassword);
        await User.clearOtp(user.user_id);
        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (e) {
        console.error('Reset password error:', e);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.logout = (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        
        if (token) {
            exports.blacklistToken(token);
        }
        
        res.json({ 
            message: 'Logged out successfully',
            success: true 
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            error: 'Failed to logout',
            success: false 
        });
    }
};