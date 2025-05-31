// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Import model User Anda

exports.authorize = (role = null) => {
    return async (req, res, next) => {
        try {
            const token = req.headers['authorization']?.split(' ')[1];
            console.log('Authorize - Token:', token ? token.substring(0, 20) + '...' : 'No token');
            
            if (!token) {
                throw new Error('Access Denied: No token provided.');
            }

            const data = jwt.verify(token, process.env.TOKEN_KEY);
            console.log('Authorize - Decoded JWT:', data);
            
            if (!data || !data.id) {
                throw new Error('Invalid token: No user ID found.');
            }

            // Cek apakah user masih ada di database menggunakan model User
            const user = await User.getById(data.id);
            console.log('Authorize - User lookup result:', user ? 'Found' : 'Not found');
            
            if (!user) {
                console.log(`Authorize - User not found for ID: ${data.id}`);
                throw new Error('User not found. Please login again.');
            }

            // Optional: Cek apakah user sudah terverifikasi
            if (!user.is_verified) {
                throw new Error('Account not verified. Please verify your account first.');
            }

            req.user = data;
            req.userDetails = user; // Menyimpan detail user lengkap
            console.log('Authorize - Set req.user:', req.user);

            if (role && data.role !== role) {
                throw new Error('Access Denied: Insufficient role.');
            }

            next();
        } catch (e) {
            console.error('Authorize error:', e.message);
            
            // Tentukan response berdasarkan jenis error
            if (e.name === 'JsonWebTokenError' || 
                e.name === 'TokenExpiredError' ||
                e.message.includes('User not found') ||
                e.message.includes('Account not verified')) {
                return res.status(401).json({ 
                    error: e.message,
                    code: 'AUTHENTICATION_FAILED'
                });
            }
            
            if (e.message.includes('Insufficient role')) {
                return res.status(403).json({ 
                    error: e.message,
                    code: 'INSUFFICIENT_ROLE'
                });
            }
            
            // Error lainnya (database error, dll)
            res.status(500).json({ 
                error: 'Internal server error',
                code: 'SERVER_ERROR'
            });
        }
    };
};