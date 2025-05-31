const db = require("../config/db");
const Menu = require("../models/menuModel");

const Order = {
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

        console.log(rows);

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
