const db = require('../config/db');
const bcrypt = require("bcryptjs");

const Order = {
    async getAll() {
        const [rows] = await db.query('SELECT * FROM orders');
        return rows;
    },

    // async duplicateById(id) {
    //     const [result] = await db.query('INSERT INTO orders (buyer_id, canteen_id, total_price) SELECT buyer_id, canteen_id, total_price FROM orders WHERE order_id = ?', [id]);
    //
    //     const [result2] = await db.query('INSERT INTO order_items (order_id, menu_id, item_details) SELECT ?, menu_id, item_details FROM order_items WHERE order_id = ?', [result.insertId, id]);
    //
    //     const [result3] = await db.query('INSERT INTO order_item_addons (order_item_id, addon_id) SELECT ?, addon_id FROM order_item_addons WHERE order_item_id = ?', [result2.insertId, result2.insertId]);
    // },

    async duplicateById(id, buyerId) {

        const [result] = await db.query(`DELETE FROM orders WHERE buyer_id = ? AND order_status = 'in_cart'`, [buyerId]);

        // Duplicate the order
        const [orderResult] = await db.query(`
            INSERT INTO orders (buyer_id, canteen_id, total_price)
            SELECT buyer_id, canteen_id, total_price
            FROM orders
            WHERE order_id = ?
        `, [id]);
        const newOrderId = orderResult.insertId;

        // Get original order_items
        const [oldItems] = await db.query(`SELECT *
                                           FROM order_items
                                           WHERE order_id = ?`, [id]);

        const newItemIds = [];

        // Duplicate each order_item and remember the mapping
        for (const item of oldItems) {
            const [insertItem] = await db.query(`
                        INSERT INTO order_items (order_id, menu_id, item_details)
                        VALUES (?, ?, ?)`,
                [newOrderId, item.menu_id, item.item_details]
            );
            newItemIds.push({
                oldId: item.order_item_id,
                newId: insertItem.insertId,
            });
        }

        // Now duplicate the addons for each order_item
        for (const pair of newItemIds) {
            const [addons] = await db.query(`
                        SELECT addon_id
                        FROM order_item_addons
                        WHERE order_item_id = ?`,
                [pair.oldId]
            );

            for (const addon of addons) {
                await db.query(`
                            INSERT INTO order_item_addons (order_item_id, addon_id)
                            VALUES (?, ?)`,
                    [pair.newId, addon.addon_id]
                );
            }
        }

        return newOrderId;
    },


    async getByStatusAndBuyer(status, buyerId) {
        const [rows] = await db.query('SELECT * FROM orders WHERE order_status = ? AND buyer_id = ?', [status, buyerId]);
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query("SELECT o.order_id, o.buyer_id, m.menu_id, c.canteen_id, c.canteen_name, m.menu_name, m.menu_image, m.menu_price, oi.order_item_id, oi.item_details, a.addon_id, a.addon_name, a.addon_price, o.estimation_time, o.order_status, o.order_time, o.order_finished_time, o.schedule_time, o.total_price FROM orders AS o LEFT JOIN order_items oi ON oi.order_id = o.order_id LEFT JOIN menus m ON oi.menu_id = m.menu_id LEFT JOIN order_item_addons oia ON oia.order_item_id = oi.order_item_id LEFT JOIN addons a ON oia.addon_id = a.addon_id LEFT JOIN canteens c ON o.canteen_id = c.canteen_id WHERE o.order_id = ?", [id]);

        let order = {
            order_id: rows[0].order_id,
            buyer_id: rows[0].buyer_id,
            canteen: {
                canteen_id: rows[0].canteen_id,
                canteen_name: rows[0].canteen_name
            },
            estimation_time: rows[0].estimation_time,
            order_status: rows[0].order_status,
            order_time: rows[0].order_time,
            order_finished_time: rows[0].order_finished_time,
            schedule_time: rows[0].schedule_time,
            total_price: rows[0].total_price,
            order_items: []
        }

        for (const row of rows) {

            let orderItem = order.order_items.find(oi => oi.order_item_id === row.order_item_id);
            if (!orderItem) {
                orderItem = {
                    order_item_id: row.order_item_id,
                    item_details: row.item_details,
                    menu: {
                        menu_id: row.menu_id,
                        menu_name: row.menu_name,
                        menu_image: row.menu_image,
                        menu_price: row.menu_price
                    },
                    addons: []
                }
                order.order_items.push(orderItem);
            }

            if (row.addon_id) {
                let addon = orderItem.addons.find(a => a.addon_id === row.addon_id);
                if (!addon) {
                    addon = {
                        addon_id: row.addon_id,
                        addon_name: row.addon_name,
                        addon_price: row.addon_price
                    }
                    orderItem.addons.push(addon);
                }
            }
        }

        return order;
    },

    async getByBuyer(id) {
        const [rows] = await db.query("SELECT o.order_id, o.buyer_id, m.menu_id, c.canteen_id, c.canteen_name, m.menu_name, m.menu_image, m.menu_price, oi.order_item_id, oi.item_details, a.addon_id, a.addon_name, a.addon_price, o.estimation_time, o.order_status, o.order_time, o.order_finished_time, o.schedule_time, o.total_price FROM orders AS o LEFT JOIN order_items oi ON oi.order_id = o.order_id LEFT JOIN menus m ON oi.menu_id = m.menu_id LEFT JOIN order_item_addons oia ON oia.order_item_id = oi.order_item_id LEFT JOIN addons a ON oia.addon_id = a.addon_id LEFT JOIN canteens c ON o.canteen_id = c.canteen_id WHERE buyer_id = ? ORDER BY o.order_time DESC", [id]);

        let orders = [];

        for (const row of rows) {

            if (row.order_status === "in_cart") continue;

            let order = orders.find(o => o.order_id === row.order_id);

            if (!order) {
                order = {
                    order_id: row.order_id,
                    buyer_id: row.buyer_id,
                    canteen: {
                        canteen_id: row.canteen_id,
                        canteen_name: row.canteen_name
                    },
                    estimation_time: row.estimation_time,
                    order_status: row.order_status,
                    order_time: row.order_time,
                    order_finished_time: row.order_finished_time,
                    schedule_time: row.schedule_time,
                    total_price: row.total_price,
                    order_items: []
                }
                orders.push(order);
            }

            let orderItem = order.order_items.find(oi => oi.order_item_id === row.order_item_id);
            if (!orderItem) {
                orderItem = {
                    order_item_id: row.order_item_id,
                    item_details: row.item_details,
                    menu: {
                        menu_id: row.menu_id,
                        menu_name: row.menu_name,
                        menu_image: row.menu_image,
                        menu_price: row.menu_price
                    },
                    addons: []
                }
                order.order_items.push(orderItem);
            }

            if (row.addon_id) {
                let addon = orderItem.addons.find(a => a.addon_id === row.addon_id);
                if (!addon) {
                    addon = {
                        addon_id: row.addon_id,
                        addon_name: row.addon_name,
                        addon_price: row.addon_price
                    }
                    orderItem.addons.push(addon);
                }
            }
        }

        return orders;
    },
};

module.exports = Order;
