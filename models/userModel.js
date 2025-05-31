const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    async getAll() {
        try {
            const [rows] = await db.query('SELECT * FROM users');
            return rows;
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    },

    async getById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
            if (rows.length === 0) {
                console.log(`No user found with ID: ${id}`);
                return null;
            }
            return rows[0];
        } catch (error) {
            console.error(`Error fetching user by ID ${id}:`, error);
            throw error;
        }
    },

    async getByEmail({ email }) {
        try {
            console.log('Fetching user by email:', email);
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if (rows.length > 0) {
                const user = rows[0];
                console.log('User found:', {
                    user_id: user.user_id,
                    email: user.email,
                    is_verified: user.is_verified,
                    password_exists: !!user.password,
                    password_length: user.password ? user.password.length : 0,
                });
                return user;
            }
            console.log('No user found with email:', email);
            return null;
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw error;
        }
    },

    async create({ name, email, password, role = 'buyer' }) {
        try {
            console.log('Creating new user:', email);
            if (!name || !email || !password) {
                throw new Error('Name, email, and password are required');
            }
            const [result] = await db.query(
                'INSERT INTO users (name, email, password, role, is_verified, otp_code, otp_expired_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [name, email, password, role, false, null, null]
            );
            console.log('User created with ID:', result.insertId);
            if (role === 'buyer') {
                await db.query('INSERT INTO buyers (buyer_id) VALUES (?)', [result.insertId]);
            }
            return {
                user_id: result.insertId,
                name,
                email,
                role,
                is_verified: false,
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    async storeOtp(userId, otp) {
        try {
            console.log(`Storing OTP for user ID: ${userId}`);
            const expiry = new Date(Date.now() + 10 * 60 * 1000);
            await db.query(
                'UPDATE users SET otp_code = ?, otp_expired_at = ? WHERE user_id = ?',
                [otp, expiry, userId]
            );
            console.log(`OTP stored for user ID: ${userId}`);
        } catch (error) {
            console.error(`Error storing OTP for user ID ${userId}:`, error);
            throw error;
        }
    },

    async getOtp(userId) {
        try {
            console.log(`Fetching OTP for user ID: ${userId}`);
            const [result] = await db.query(
                'SELECT otp_code FROM users WHERE user_id = ? AND otp_expired_at > NOW()',
                [userId]
            );
            if (result.length === 0) {
                console.log(`No valid OTP found for user ID: ${userId}`);
                return null;
            }
            return result[0].otp_code;
        } catch (error) {
            console.error(`Error fetching OTP for user ID ${userId}:`, error);
            throw error;
        }
    },

    async clearOtp(userId) {
        try {
            console.log(`Clearing OTP for user ID: ${userId}`);
            await db.query(
                'UPDATE users SET otp_code = NULL, otp_expired_at = NULL WHERE user_id = ?',
                [userId]
            );
            console.log(`OTP cleared for user ID: ${userId}`);
        } catch (error) {
            console.error(`Error clearing OTP for user ID ${userId}:`, error);
            throw error;
        }
    },

    async updateVerificationStatus(id) {
        try {
            console.log('Updating verification status for user ID:', id);
            const [result] = await db.query(
                'UPDATE users SET is_verified = true, otp_code = NULL, otp_expired_at = NULL WHERE user_id = ?',
                [id]
            );
            console.log('Update verification result:', {
                affectedRows: result.affectedRows,
                changedRows: result.changedRows,
            });
            if (result.affectedRows === 0) {
                throw new Error(`No user found with ID: ${id}`);
            }
            return true;
        } catch (error) {
            console.error('Error updating verification status:', error);
            throw error;
        }
    },

    async update(id, userData) {
        try {
            if (!id) {
                throw new Error('User ID is required');
            }
            const fields = [];
            const values = [];
            if (userData.name) {
                fields.push('name = ?');
                values.push(userData.name);
            }
            if (userData.email) {
                fields.push('email = ?');
                values.push(userData.email);
            }
            if (userData.password) {
                fields.push('password = ?');
                values.push(userData.password);
            }
            if (userData.is_verified !== undefined) {
                fields.push('is_verified = ?');
                values.push(userData.is_verified);
            }
            if (fields.length === 0) {
                console.log('No fields provided for update for user ID:', id);
                throw new Error('No fields to update');
            }
            values.push(id);
            const query = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
            console.log('Executing update query:', query, values);
            const [result] = await db.query(query, values);
            if (result.affectedRows === 0) {
                throw new Error(`No user found with ID: ${id}`);
            }
            return { user_id: id, ...userData };
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);
            if (result.affectedRows === 0) {
                throw new Error(`No user found with ID: ${id}`);
            }
            return { message: 'User successfully deleted' };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    async updateDeviceToken(id, deviceToken) {
        try {
            const [result] = await db.query('UPDATE users SET device_token = ? WHERE user_id = ?', [deviceToken, id]);
            if (result.affectedRows === 0) {
                throw new Error(`No user found with ID: ${id}`);
            }
            return { id, deviceToken };
        } catch (error) {
            console.error(`Error updating device token for user ID ${id}:`, error);
            throw error;
        }
    },

    async getDeviceToken(id) {
        try {
            const [result] = await db.query('SELECT device_token FROM users WHERE user_id = ?', [id]);
            if (result.length === 0) {
                throw new Error(`No user found with ID: ${id}`);
            }
            return result[0].device_token;
        } catch (error) {
            console.error(`Error fetching device token for user ID ${id}:`, error);
            throw error;
        }
    },

    async resetPasswordByEmail(email, newPassword) {
        try {
            // const hashedPassword = await bcrypt.hash(newPassword, 10);
            const [result] = await db.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
            if (result.affectedRows === 0) {
                throw new Error(`No user found with email: ${email}`);
            }
            return true;
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    },
};

module.exports = User;