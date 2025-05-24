const Order = require('../models/orderModel');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.getOrdersById = async (req, res) => {
    try {
        const order = await Order.getById(req.params.id);
        if(order.buyer_id !== req.user.id && order.canteen_id !== req.user.id) throw new Error("Access Denied.");
        res.json(order);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

exports.getOrdersByBuyer = async (req, res) => {
    try {
        const orders = await Order.getByBuyer(req.user.id);
        res.json(orders);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};


