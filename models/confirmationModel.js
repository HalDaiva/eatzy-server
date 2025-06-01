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

    async getOrderByIdAndUserId(order_id, user_id) {
        const [orders] = await db.query(`
            SELECT * FROM orders
            WHERE order_id = ? AND buyer_id = ? AND order_status = 'in_cart'
        `, [order_id, user_id]);

        return orders.length > 0 ? orders[0] : null;
    },

    async updateOrderStatusToWaiting(order_id, scheduleTime) {
        const totalPreparationTime = await this.getTotalPreparationTimeByOrderId(order_id);
        console.log(">>>>>>> totalPreparationTime = " + totalPreparationTime);
        // Jika scheduleTime tidak diberikan, set default ke NOW()
        const time = scheduleTime || new Date().toISOString().slice(0, 19).replace('T', ' ');
        await db.query(`
            UPDATE orders
            SET order_status = 'waiting',
                schedule_time = ?,
                order_time = NOW(),
                estimation_time = ?
            WHERE order_id = ?
        `, [time, totalPreparationTime, order_id]);
    },

    async getTotalPreparationTimeByOrderId(order_id) {

        const [menus] = await db.query("SELECT m.preparation_time, m.menu_name FROM orders as o LEFT JOIN order_items oi ON oi.order_id = o.order_id LEFT JOIN menus m ON oi.menu_id = m.menu_id WHERE o.order_id = ?", [order_id]);


        let totalPreparationTime = 0;
        menus.forEach((menu) => {
            totalPreparationTime += menu.preparation_time;
        })
        return totalPreparationTime;
    }
};

module.exports = Confirmation;