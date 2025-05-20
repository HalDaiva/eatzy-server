const Order = require('../models/orderModel');

exports.createOrder = async (req, res) => {
    try {
        const order = {
            buyerId: req.user.id,
            canteenId: req.body.canteen_id, 
            totalPrice: req.body.total_price,
            orderItems: req.body.order_items
        }
        const orderResult = await Order.create(order)
        res.json(orderResult);
    } catch (e) {
        res.status(500).json({error: e});
    }
};