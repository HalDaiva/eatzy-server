const db = require('../config/db');
const bcrypt = require("bcryptjs");

const Canteen = {
    async getAll() {
        const [rows] = await db.query('SELECT `canteen_id`, `canteen_name`, `canteen_image`, `canteen_is_open` FROM `canteens`');
        return rows;
    },
};

module.exports = Canteen;
