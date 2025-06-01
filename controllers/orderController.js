const Order = require('../models/orderModel');

exports.getOrders = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const canteenId = user.id;
    const status = req.query.status || 'Semua';

    // Memanggil getAllByCanteen untuk dapatkan list orders dengan filter status
    const orders = await Order.getAllByCanteen(status, canteenId);

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.order_id;

    const order = await Order.getById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validasi agar hanya kantin yang punya order yg bisa akses
    if (order.canteen_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.test = async (req, res) => {
  console.log("wowWWW")
  res.json({"wow" : "wow"});
}

exports.updateOrderStatus = async (req, res) => {

  const orderId = req.params.order_id;
  const { order_status } = req.body;

  const order = await Order.getById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  // Contoh validasi transisi status
  if (order_status === "finished") {
    if (order.order_status !== "processing") {
      return res.status(400).json({ message: "Order must be in processing status to finish" });
    }
    
    await Order.updateStatusToFinished(orderId);  // misal update khusus finished
  } else {
    await Order.updateStatus(orderId, order_status);
  }

  res.json({ message: "Order status updated successfully" });
};
