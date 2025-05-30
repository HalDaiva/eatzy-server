const db = require('../config/db');

const Addon = {

  async checkAddonOwnership(addon_id, user_id) {
    const query = `
        SELECT 1 FROM addons m
        JOIN addon_categories mc ON m.addon_category_id = mc.addon_category_id
        JOIN canteens c ON mc.canteen_id = c.canteen_id
        WHERE m.addon_id = ? AND c.canteen_id = ?
        LIMIT 1
        `;
    const [rows] = await db.query(query, [addon_id, user_id]);
    return rows.length > 0;
  },

  async checkCategoryOwnership(category_id, user_id) {
    const query = `
        SELECT 1 FROM addon_categories mc
        JOIN canteens c ON mc.canteen_id = c.canteen_id
        WHERE mc.addon_category_id = ? AND c.canteen_id = ?
        LIMIT 1
        `;
    const [rows] = await db.query(query, [category_id, user_id]);
    return rows.length > 0;
  },

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
        const result = await db.query(
          `INSERT INTO addons (addon_name, addon_price, addon_category_id, addon_is_available)
         VALUES (?, ?, ?, true)`,
          [addon.addon_name, addon.addon_price, categoryId]
        );
        sentIds.add(result[0].insertId); // Tambahkan ID baru juga agar tidak terhapus di bawah
      }
    }

    // Hapus addon yang tidak ada di input
    for (const id of existingIds) {
      if (!sentIds.has(id)) {
        await db.query(
          `DELETE FROM addons WHERE addon_id = ? AND addon_category_id = ?`,
          [id, categoryId]
        );
      }
    }
  },

  async toggleAddonAvailability(addon_id, isAvailable) {
    return await db.query(
      'UPDATE addons SET addon_is_available = ? WHERE addon_id = ?',
      [isAvailable ? 1 : 0, addon_id]
    );
  },

  async deleteCategoryById(id) {
    return await db.query('DELETE FROM addon_categories WHERE addon_category_id = ?', [id]);
  },

  async deleteAddonByCategory(id) {
    return await db.query('DELETE FROM addons WHERE addon_category_id = ?', [id]);
  },

  async deleteAddonById(id) {
    const [result] = await db.query('DELETE FROM addons WHERE addon_id = ?', [id]);
    return result;
  },

  async updateAddonById(addon_id, updateFields) {
    // Buat array field yang dikirim saja
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateFields)) {
      if (typeof value !== 'undefined') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    // Tambahkan updated_at
    fields.push('updated_at = NOW()');

    // Jangan lanjut kalau tidak ada field yang mau di-update
    if (fields.length === 1) {
      throw new Error('Tidak ada data yang dikirim untuk di-update');
    }

    const query = `UPDATE addons SET ${fields.join(', ')} WHERE addon_id = ?`;
    values.push(addon_id);

    const [result] = await db.query(query, values);
    return result;
  },
  //ambil kategori
    async getAddonCategoryList(canteen_id) {
        const query = `
            SELECT * FROM addon_categories 
            WHERE canteen_id = ?
        `;
        const [rows] = await db.query(query, canteen_id);
        return rows;
    }

};

module.exports = Addon;
