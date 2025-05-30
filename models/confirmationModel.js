const db = require('../config/db');

const Confirmation = {
    async getOrderById(order_id) {
        const [orders] = await db.query(`
            SELECT o.order_id, o.schedule_time, o.total_price, c.canteen_name, o.canteen_id
            FROM orders o
            JOIN canteens c ON o.canteen_id = c.canteen_id
            WHERE o.order_id = ? AND o.order_status = 'in_cart'
        `, [order_id]);

        if (orders.length === 0) return null;

        const order = orders[0];

        const [items] = await db.query(`
            SELECT oi.order_item_id, oi.menu_id, m.menu_name, m.menu_price, oi.item_details AS note,
                   m.menu_image
            FROM order_items oi
            JOIN menus m ON oi.menu_id = m.menu_id
            WHERE oi.order_id = ?
        `, [order_id]);

        for (const item of items) {
            const [addons] = await db.query(`
                SELECT a.addon_name
                FROM order_item_addons oia
                JOIN addons a ON oia.addon_id = a.addon_id
                WHERE oia.order_item_id = ?
            `, [item.order_item_id]);

            item.addons = addons.map(a => a.addon_name);
            delete item.order_item_id;
        }

        order.items = items;
        return order;
    },

    async updateOrderStatusToWaiting(order_id) {
        await db.query(`
            UPDATE orders
            SET order_status = 'waiting'
            WHERE order_id = ?
        `, [order_id]);
    }
};

module.exports = Confirmation;