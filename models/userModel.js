const db = require('../config/db');
const bcrypt = require("bcryptjs");

const User = {
    getAll: callback => {
        db.query('SELECT * FROM users', callback);
    },

    getById: (id, callback) => {
        db.query('SELECT * FROM users WHERE user_id = ?', [id], callback);
    },

    create: async (user, callback) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [user.name, user.email, hashedPassword, user.role], callback);
    },

    update: (id, user, callback) => {
        db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [user.name, user.email, id], callback);
    },

    delete: (id, callback) => {
        db.query('DELETE FROM users WHERE id = ?', [id], callback);
    }
};

module.exports = User;
