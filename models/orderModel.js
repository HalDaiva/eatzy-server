const db = require('../config/db');
const bcrypt = require("bcryptjs");

const Order = {
    async getAll() {
        const [rows] = await db.query('SELECT * FROM orders');
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query("SELECT o.order_id, o.buyer_id, m.menu_id, c.canteen_id, c.canteen_name, m.menu_name, m.menu_image, m.menu_price, oi.order_item_id, oi.item_details, a.addon_id, a.addon_name, a.addon_price, o.estimation_time, o.order_status, o.order_time, o.order_finished_time, o.schedule_time, o.total_price FROM orders AS o LEFT JOIN order_items oi ON oi.order_id = o.order_id LEFT JOIN menus m ON oi.menu_id = m.menu_id LEFT JOIN order_item_addons oia ON oia.order_item_id = oi.order_item_id LEFT JOIN addons a ON oia.addon_id = a.addon_id LEFT JOIN canteens c ON o.canteen_id = c.canteen_id WHERE o.order_id = ?",[id]);

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
            if(!orderItem) {
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
        const [rows] = await db.query("SELECT o.order_id, o.buyer_id, m.menu_id, c.canteen_id, c.canteen_name, m.menu_name, m.menu_image, m.menu_price, oi.order_item_id, oi.item_details, a.addon_id, a.addon_name, a.addon_price, o.estimation_time, o.order_status, o.order_time, o.order_finished_time, o.schedule_time, o.total_price FROM orders AS o LEFT JOIN order_items oi ON oi.order_id = o.order_id LEFT JOIN menus m ON oi.menu_id = m.menu_id LEFT JOIN order_item_addons oia ON oia.order_item_id = oi.order_item_id LEFT JOIN addons a ON oia.addon_id = a.addon_id LEFT JOIN canteens c ON o.canteen_id = c.canteen_id WHERE buyer_id = ?",[id]);

        let orders = [];

        for (const row of rows) {

            if(row.order_status === "in_cart") continue;

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
            if(!orderItem) {
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
