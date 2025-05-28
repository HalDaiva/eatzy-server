const db = require('../config/db');
const bcrypt = require("bcryptjs");

const User = {
    async getAll() {
        const [rows] = await db.query('SELECT * FROM users');
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
        return rows[0];
    },

    async getByEmail(user) {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?",[user.email]);
        return rows[0];
    },

    async create(user) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const [result] = await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [user.name, user.email, hashedPassword, user.role]);

        if(user.role === "buyer") {
            await db.query('INSERT INTO buyers (buyer_id) VALUES (?)', [result.insertId]);
        }
        return { id: result.insertId, ...user };
    },

    async updateDeviceToken(id, deviceToken) {
        await db.query('UPDATE users SET device_token = ? WHERE user_id = ?', [deviceToken, id]);
        return { id, deviceToken };
    },

    async getDeviceToken(id) {
        const [result] = await db.query('SELECT device_token FROM users WHERE user_id = ?', [id]);
        return result[0].device_token;
    },

    async update(id, user){
        const [result] = await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [user.name, user.email, id]);
        return { id, ...user };
    },

    async delete(id) {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        return {message: 'User Deleted'}
    }
};

module.exports = User;
