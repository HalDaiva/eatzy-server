const Cart = require('../models/cartModel');
const jwt = require("jsonwebtoken");
const { authorize } = require('../middleware/authorize');

exports.getCartByUser = async(req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.getCartByUserId(userId);

        if (!cart || cart.length === 0) {
            return res.status(404).json({ message: 'No cart found' });
        }

        res.json(cart); // ✅ return sebagai array
    } catch (error) {
        console.error("Cart Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCart = async(req, res) => {
    try {
        const userId = req.user.id;

        const result = await Cart.deleteCart(userId);
        res.json(result);
    } catch (error) {
        console.error("Delete Cart Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};