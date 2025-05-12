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
        return { id: result.insertId, ...user };

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
