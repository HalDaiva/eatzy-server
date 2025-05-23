const db = require('../config/db');

const Cart = {
    async getAll() {
        const [rows] = await db.query(`
            SELECT o.order_id AS order_id, c.canteen_name, o.total_price AS total_price
            FROM orders o
            JOIN canteens c ON o.canteen_id = c.canteen_id
            WHERE o.order_status = 'in_cart'
        `);

        for (const cart of rows) {
            const [items] = await db.query(`
                SELECT 
                    oi.order_item_id,
                    oi.menu_id,
                    m.menu_name,
                    oi.item_details,
                    m.menu_image,
                    m.menu_price
                FROM order_items oi
                JOIN menus m ON oi.menu_id = m.menu_id
                WHERE oi.order_id = ?
            `, [cart.order_id]);

            for (const item of items) {
                const [addons] = await db.query(`
                    SELECT a.addon_name
                    FROM order_item_addons oia
                    JOIN addons a ON oia.addon_id = a.addon_id
                    WHERE oia.order_item_id = ?
                `, [item.order_item_id]);

                item.addons = addons.map(addon => addon.addon_name);

                // Hapus order_item_id agar tidak tampil di frontend jika tidak perlu
                delete item.order_item_id;
            }

            cart.items = items;
        }

        return rows;
    },

    async getById(cartId) {
        const [rows] = await db.query(`
            SELECT o.order_id AS order_id, c.canteen_name, o.total_price AS total_price
            FROM orders o
            JOIN canteens c ON o.canteen_id = c.canteen_id
            WHERE o.order_id = ? AND o.order_status = 'in_cart'
        `, [cartId]);

        if (rows.length === 0) return null;

        const cart = rows[0];

        const [items] = await db.query(`
            SELECT 
                oi.order_item_id,
                oi.menu_id,
                m.menu_name,
                oi.item_details,
                m.menu_image,
                m.menu_price
            FROM order_items oi
            JOIN menus m ON oi.menu_id = m.menu_id
            WHERE oi.order_id = ?
        `, [cartId]);

        for (const item of items) {
            const [addons] = await db.query(`
                SELECT a.addon_name
                FROM order_item_addons oia
                JOIN addons a ON oia.addon_id = a.addon_id
                WHERE oia.order_item_id = ?
            `, [item.order_item_id]);

            item.addons = addons.map(addon => addon.addon_name);
            delete item.order_item_id;
        }

        cart.items = items;

        return cart;
    },

    async deleteCart(cartId) {
        // Hapus data addons terlebih dahulu
        const [itemIds] = await db.query(`
            SELECT order_item_id FROM order_items WHERE order_id = ?
        `, [cartId]);

        for (const { order_item_id }
            of itemIds) {
            await db.query(`DELETE FROM order_item_addons WHERE order_item_id = ?`, [order_item_id]);
        }

        await db.query('DELETE FROM order_items WHERE order_id = ?', [cartId]);
        await db.query('DELETE FROM orders WHERE order_id = ?', [cartId]);

        return { message: 'Cart deleted' };
    }
};

module.exports = Cart;