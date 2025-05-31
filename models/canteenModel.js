const db = require("../config/db");
const bcrypt = require("bcryptjs");

const Canteen = {
  async getAll() {
    const [rows] = await db.query(
      "SELECT `canteen_id`, `canteen_name`, `canteen_image`, `canteen_is_open` FROM `canteens`"
    );
    let canteens = [];
    for (const row of rows) {
      let canteen = {
        canteen_id: row.canteen_id,
        canteen_name: row.canteen_name,
        canteen_image: row.canteen_image,
        canteen_is_open: row.canteen_is_open === 1,
      };
      canteens.push(canteen);
    }

    return canteens;
  },
  async getCanteenById(id) {
    const [rows] = await db.query(
      "SELECT `canteen_id`, `canteen_name`, `canteen_image`, `canteen_is_open` FROM `canteens` WHERE `canteen_id` = ?", [id]
    );
    let canteen = {
        canteen_id: rows[0].canteen_id,
        canteen_name: rows[0].canteen_name,
        canteen_image: rows[0].canteen_image,
        canteen_is_open: rows[0].canteen_is_open === 1,
      };

    return canteen;
  },
};

module.exports = Canteen;
