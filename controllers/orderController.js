const Order = require('../models/orderModel');

exports.getOrdersById = async (req, res) => {
    try {
        const order = await Order.getById(req.params.id);
        if (order.buyer_id !== req.user.id && order.canteen_id !== req.user.id) throw new Error("Access Denied.");
        res.json(order);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

exports.checkIfOrderExistByStatus = async (req, res) => {
    try {
        const orders = await Order.getByStatusAndBuyer(req.params.status, req.user.id);
        res.json(orders.length > 0);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.duplicateOrder = async (req, res) => {
    try {
        const orderId = await Order.duplicateById(req.params.id, req.user.id);
        res.json(orderId);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.getOrdersByBuyer = async (req, res) => {
    try {
        const orders = await Order.getByBuyer(req.user.id);
        res.json(orders);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};


