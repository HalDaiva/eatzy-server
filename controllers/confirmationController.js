const Confirmation = require('../models/confirmationModel');
const jwt = require("jsonwebtoken");
const { authorize } = require('../middleware/authorize');

exports.getConfirmedOrder = async(req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Confirmation.getConfirmedOrderByUserId(userId);

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No in-cart orders found' });
        }

        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.confirmOrder = async(req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Confirmation.getConfirmedOrderByUserId(userId);

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No in-cart order found to confirm' });
        }

        // Asumsi hanya 1 order yang bisa dikonfirmasi
        await Confirmation.updateOrderStatusToWaiting(orders[0].order_id);

        res.json({ message: 'Order confirmed and status updated to waiting' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createNewOrder = async(req, res) => {
    try {
        const userId = req.user.id;
        const { canteenId, scheduleTime } = req.body;

        if (!canteenId || !scheduleTime) {
            return res.status(400).json({ message: 'canteenId and scheduleTime are required' });
        }

        const orderId = await Confirmation.createNewOrder({
            buyerId: userId,
            canteenId,
            scheduleTime
        });

        res.status(201).json({ message: 'New order created', orderId });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// ✅ GET /confirmation/confirmed/:order_id
exports.getOrderById = async(req, res) => {
    try {
        const orderId = req.params.order_id;
        const order = await Confirmation.getOrderById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};