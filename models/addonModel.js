const db = require('../config/db');

const Addon = {
    async getAddOnsByUserId(userId) {
        const query = `
            SELECT 
                ac.addon_category_id,
                ac.addon_category_name,
                ac.is_multiple_choice,
                a.addon_id,
                a.addon_name,
                a.addon_price,
                a.addon_is_available
            FROM users u
            JOIN canteens c ON c.canteen_id = u.user_id
            LEFT JOIN addon_categories ac ON ac.canteen_id = c.canteen_id
            LEFT JOIN addons a ON a.addon_category_id = ac.addon_category_id
            WHERE u.user_id = ? AND u.role = 'canteen'
        `;
        const [rows] = await db.query(query, [userId]);
        return rows;
    },

    async createAddonCategory(canteenId, name, isMultiple) {
        const query = `INSERT INTO addon_categories (canteen_id, addon_category_name, is_multiple_choice) VALUES (?, ?, ?)`;
        const [result] = await db.query(query, [canteenId, name, isMultiple]);
        return result.insertId;
    },

    async updateAddonCategory(addon_category_id, name, is_multiple_choice) {
    const query = `
      UPDATE addon_categories
      SET addon_category_name = ?, is_multiple_choice = ?
      WHERE addon_category_id = ?
    `;
    await db.query(query, [name, is_multiple_choice, addon_category_id]);
  },

   async syncAddons(addons, categoryId) {
    const existing = await db.query(
      `SELECT addon_id FROM addons WHERE addon_category_id = ?`,
      [categoryId]
    );
    const existingIds = new Set(existing[0].map(row => row.addon_id));

    const sentIds = new Set();

    for (const addon of addons) {
      if (addon.addon_id) {
        // Update existing
        await db.query(
          `UPDATE addons SET addon_name = ?, addon_price = ?, updated_at = NOW()
           WHERE addon_id = ? AND addon_category_id = ?`,
          [addon.addon_name, addon.addon_price, addon.addon_id, categoryId]
        );
        sentIds.add(addon.addon_id);
      } else {
        // Insert new
        await db.query(
          `INSERT INTO addons (addon_name, addon_price, addon_category_id)
           VALUES (?, ?, ?)`,
          [addon.addon_name, addon.addon_price, categoryId]
        );
      }
    }

    // Delete addons not in the request
    const toDelete = [...existingIds].filter(id => !sentIds.has(id));
    if (toDelete.length > 0) {
      await db.query(
        `DELETE FROM addons WHERE addon_id IN (?) AND addon_category_id = ?`,
        [toDelete, categoryId]
      );
    }
  }
};

module.exports = Addon;
