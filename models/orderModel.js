const db = require("../config/db");

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
        // this.createOrderItem(result.insertId, order.orderItems);
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
            this.createOrderItemAddOns(orderItemAddon);
        });
        return { id: result.insertId, ...orderItem };
    },
    async createOrderItemAddOns(orderItemAddOns) {
        const [result] = await db.query(
            "INSERT INTO `order_item_addons`(`order_item_id`,`addon_id`) VALUES (?, ?)",
            [orderItemAddOns.orderItemId, orderItemAddOns.addonId]
        );
        return { id: result.insertId, ...orderItemAddOns };
    },
};
module.exports = Order;
