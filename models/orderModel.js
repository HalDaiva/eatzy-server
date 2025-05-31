const db = require('../config/db');
const bcrypt = require("bcryptjs");
const Menu = require("../models/menuModel");

const Order = {
    async getAll() {
        const [rows] = await db.query('SELECT * FROM orders');
        return rows;
    },

    async create(order) {
        const [result] = await db.query(
            "INSERT INTO orders (`buyer_id`, `canteen_id`, `total_price`) VALUES (?, ?, ?)",
            [order.buyerId, order.canteenId, order.totalPrice]
        );
        order.orderItems.forEach((element) => {
            const orderItem = {
                orderId: result.insertId,
                menuId: element.menu_id,
                itemDetails: element.item_details,
                orderItemAddons: element.order_item_addons,
            };
            this.createOrderItem(orderItem);
        });
        return { id: result.insertId, ...order };
    },

    async createOrderItem(orderItem) {
        const [result] = await db.query(
            "INSERT INTO `order_items`(`order_id`, `menu_id`, `item_details`) VALUES (?, ?, ?)",
            [orderItem.orderId, orderItem.menuId, orderItem.itemDetails]
        );
        orderItem.orderItemAddons.forEach((element) => {
            const orderItemAddon = {
                orderItemId: result.insertId,
                addonId: element.addon_id,
            };
            this.createOrderItemAddOn(orderItemAddon);
        });

        await this.updatePrice(orderItem.orderId);
        return { id: result.insertId, ...orderItem };
    },

    async createOrderItems(orderItems) {
        for (const orderItem of orderItems) {
            const [result] = await db.query(
                "INSERT INTO `order_items`(`order_id`, `menu_id`, `item_details`) VALUES (?, ?, ?)",
                [orderItem.orderId, orderItem.menuId, orderItem.itemDetails]
            );
            orderItem.orderItemAddons.forEach((element) => {
                const orderItemAddon = {
                    orderItemId: result.insertId,
                    addonId: element.addon_id,
                };
                this.createOrderItemAddOn(orderItemAddon);
            });
        }
        await this.updatePrice(orderItems[0].orderId);
        return { orderItems };
    },


    async duplicateById(id, buyerId) {

        const [result] = await db.query(`DELETE
                                         FROM orders
                                         WHERE buyer_id = ?
                                           AND order_status = 'in_cart'`, [buyerId]);

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

    async createOrderItemAddOn(orderItemAddOn) {
        const [result] = await db.query(
            "INSERT INTO `order_item_addons`(`order_item_id`,`addon_id`) VALUES (?, ?)",
            [orderItemAddOn.orderItemId, orderItemAddOn.addonId]
        );
        let [orderId] = await db.query(
            "SELECT `order_id` FROM order_items WHERE order_item_id = ?",
            [orderItemAddOn.orderItemId]
        );
        await this.updatePrice(orderId[0].order_id);
        return { id: result.insertId, ...orderItemAddOn };
    },

    async getAddonsByOrderItemId(orderItemId) {
        const [rows] = await db.query(
            "SELECT a.addon_id, a.addon_name FROM order_item_addons oia JOIN addons a ON oia.addon_id = a.addon_id WHERE oia.order_item_id = ?;",
            [orderItemId]
        );
        return rows;
    },

    async getOrderItemsByOrderId(orderId) {
        const [rows] = await db.query(
            "SELECT `order_item_id`, `menu_id`, `item_details` FROM `order_items` WHERE `order_id` = ?",
            [orderId]
        );

        let orderItems = [];

        for (const row of rows) {
            addons = await this.getAddonsByOrderItemId(row.order_item_id);
            const [resultMenu] = await db.query(
                "SELECT `menu_name`, `menu_image` FROM `menus` WHERE `menu_id` = ?",
                [row.menu_id]
            );

            let orderItem = {
                order_item_id: row.order_item_id,
                menu_id: row.menu_id,
                item_details: row.item_details,
                menu_name: resultMenu[0].menu_name,
                menu_image: resultMenu[0].menu_image,
                order_item_addons: addons,
            };
            orderItems.push(orderItem);
        }
        return orderItems;
    },



    async getByStatusAndBuyer(status, buyerId) {
        const [rows] = await db.query('SELECT * FROM orders WHERE order_status = ? AND buyer_id = ?', [status, buyerId]);
        return rows;
    },

    async getOrderItemById(orderItemId) {
        const [rows] = await db.query(
            "SELECT `order_item_id`, `menu_id`, `item_details` FROM `order_items` WHERE `order_item_id` = ?",
            [orderItemId]
        );

        let orderItemResult;

        for (const row of rows) {
            addons = await this.getAddonsByOrderItemId(row.order_item_id);
            const [resultMenu] = await db.query(
                "SELECT `menu_name`, `menu_image` FROM `menus` WHERE `menu_id` = ?",
                [row.menu_id]
            );

            let orderItem = {
                order_item_id: row.order_item_id,
                menu_id: row.menu_id,
                item_details: row.item_details,
                menu_name: resultMenu[0].menu_name,
                menu_image: resultMenu[0].menu_image,
                order_item_addons: addons,
            };
            orderItemResult = orderItem;
        }
        return orderItemResult;
    },

    async getOrderItemsByIds(orderItemIds) {
        let rows = [];

        for (const orderItemId of orderItemIds) {
            const [row] = await db.query(
                "SELECT `order_item_id`, `menu_id`, `item_details` FROM `order_items` WHERE `order_item_id` = ?",
                [orderItemId]
            );
            rows.push(row[0]);
        }

        let orderItems = [];

        for (const row of rows) {
            addons = await this.getAddonsByOrderItemId(row.order_item_id);
            const [resultMenu] = await db.query(
                "SELECT `menu_name`, `menu_image` FROM `menus` WHERE `menu_id` = ?",
                [row.menu_id]
            );
            console.log(resultMenu);

            let orderItem = {
                order_item_id: row.order_item_id,
                menu_id: row.menu_id,
                item_details: row.item_details,
                menu_name: resultMenu[0].menu_name,
                menu_image: resultMenu[0].menu_image,
                order_item_addons: addons,
            };
            orderItems.push(orderItem);
        }
        return orderItems;
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

    async deleteOrderItems(orderItemIds) {
        const [orderId] = await db.query(
            "SELECT `order_id`, `menu_id` FROM order_items WHERE order_item_id = ?",
            [orderItemIds[0]]
        );
        const placeholders = orderItemIds.map(() => "?").join(","); // menghasilkan ?,?,? dst
        const sql = `DELETE FROM order_items WHERE order_item_id IN (${placeholders})`;
        const [result] = await db.query(sql, orderItemIds);

        await this.updatePrice(orderId[0].order_id);
        return result;
    },

    async getByBuyerAndCanteen(buyerId, canteenId) {
        const [resultOrder] = await db.query(
            "SELECT `order_id`, `order_status`, `total_price` FROM `orders` WHERE `buyer_id` = ? AND `canteen_id` = ? AND `order_status`= 'in_cart'",
            [buyerId, canteenId]
        );

        if (resultOrder.length === 0) {
            return null;
        }

        orderItems = await this.getOrderItemsByOrderId(resultOrder[0].order_id);

        const order = {
            order_id: resultOrder[0].order_id,
            order_status: resultOrder[0].order_status,
            total_price: resultOrder[0].total_price,
            order_items: orderItems,
        };

        return order;
    },

    async calculateTotalPrice(orderId) {
        const [rows] = await db.query(
            "SELECT `order_item_id`, `menu_id` FROM `order_items` WHERE `order_id` = ?",
            [orderId]
        );
        let totalPrice = 0.0;
        for (const row of rows) {
            const [orderItems] = await db.query(
                "SELECT `menu_price` FROM `menus` WHERE `menu_id` = ?",
                [row.menu_id]
            );
            let menuPrice = parseFloat(orderItems[0].menu_price);
            totalPrice += menuPrice;

            // totalPrice += orderItems[0].menu_price;
        }
        for (const row of rows) {
            const [orderItemAddons] = await db.query(
                "SELECT `addon_id` FROM `order_item_addons` WHERE `order_item_id` = ?",
                [row.order_item_id]
            );
            for (const orderItemAddOn of orderItemAddons) {
                const [addon] = await db.query(
                    "SELECT `addon_price` FROM `addons` WHERE `addon_id` = ?",
                    [orderItemAddOn.addon_id]
                );
                let addonPrice = parseFloat(addon[0].addon_price);
                totalPrice += addonPrice;
                // totalPrice += addon[0].addon_price;
            }
        }
        return totalPrice;
    },

    async updatePrice(orderId) {
        totalPrice = await this.calculateTotalPrice(orderId);
        const [result] = await db.query(
            "UPDATE `orders` SET `total_price` = ? WHERE `order_id` = ?",
            [totalPrice, orderId]
        );
        return result;
    },
};
module.exports = Order;
