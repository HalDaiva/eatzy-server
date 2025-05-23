const Cart = require('../models/cartModel');

exports.getAllCarts = async(req, res) => {
    try {
        const carts = await Cart.getAll();
        res.json(carts);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getCartById = async(req, res) => {
    try {
        const cart = await Cart.getById(req.params.id);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json(cart);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.deleteCart = async(req, res) => {
    try {
        const result = await Cart.deleteCart(req.params.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};