const Order = require("../models/orderModel");

exports.createOrder = async (req, res) => {
    try {
        const order = {
            buyerId: req.user.id,
            canteenId: req.body.canteen_id,
            totalPrice: req.body.total_price,
            orderItems: req.body.order_items,
        };
        const orderResult = await Order.create(order);
        res.json(orderResult);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createOrderItem = async (req, res) => {
    try {
        const orderItem = {
            orderId: req.body.order_id,
            menuId: req.body.menu_id,
            itemDetails: req.body.item_details,
            orderItemAddons: req.body.order_item_addons,
        };
        const orderItemResult = await Order.createOrderItem(orderItem);
        res.json(orderItemResult);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createOrderItems = async (req, res) => {
    try {
        const orderItems = [];
        req.body.forEach((element) => {
            const orderItem = {
                orderId: element.order_id,
                menuId: element.menu_id,
                itemDetails: element.item_details,
                orderItemAddons: element.order_item_addons,
            };
            orderItems.push(orderItem);
        });

        const orderItemResult = await Order.createOrderItems(orderItems);
        res.json(orderItemResult);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createOrderItemAddOn = async (req, res) => {
    try {
        const orderItemAddon = {
            orderItemId: req.body.order_item_id,
            addonId: req.body.addon_id,
        };
        const orderItemAddonResult = await Order.createOrderItemAddOn(
            orderItemAddon
        );
        res.json(orderItemAddonResult);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getOrderItemById = async (req, res) => {
    try {
        const orderItem = await Order.getOrderItemById(req.params.id);
        res.json(orderItem);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getOrderItemsByIds = async (req, res) => {
    try {
        const ids = req.body;
        const orderItems = await Order.getOrderItemsByIds(ids);
        res.json(orderItems);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.deleteOrderItemsByIds = async (req, res) => {
    try {
        const orderItemIds = req.body;
        const result = await Order.deleteOrderItems(orderItemIds);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.calculateTotalPrice = async (req, res) => {
    try {
        const orderId = req.params.id;
        const result = await Order.calculateTotalPrice(orderId);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
