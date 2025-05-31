const Confirmation = require('../models/confirmationModel');
const jwt = require("jsonwebtoken");
const { authorize } = require('../middleware/authorize');


exports.confirmOrder = async(req, res) => {
    try {
        const userId = req.user.id;
        const order_id = req.params.order_id;
        const scheduleTime = req.query.time; // nullable

        const order = await Confirmation.getOrderByIdAndUserId(order_id, userId);

        if (!order) {
            return res.status(404).json({ message: 'No in-cart order found with this ID for this user' });
        }

        await Confirmation.updateOrderStatusToWaiting(order_id, scheduleTime);

        return res.json({ message: 'Order confirmed and status updated to waiting' });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};

exports.getOrderById = async(req, res) => {
    try {
        const order_id = req.params.order_id;
        const order = await Confirmation.getOrderById(order_id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.json(order);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};