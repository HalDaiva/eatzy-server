
const Order = require('../models/orderModel')
const { authorize } = require('../middleware/authorize') 


//coba 
exports.getOrders = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const canteenId = user.id; // asumsi ini ID kantin
    const status = req.query.status || 'Semua';

    const orders = await Order.getAllByCanteen(status, canteenId); 

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.order_id
    const order = await Order.getById(orderId)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    if(order.buyer_id !== req.user.id && order.canteen_id !== req.user.id) throw new Error("Access Denied.");

    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateOrderStatus = async (req, res) => {
  try {
    const order_id = req.params.order_id;
    const { order_status } = req.body;

    console.log("RAW BODY:", req.body);
    console.log("UPDATE REQUEST:", { order_id, order_status });

    if (!order_id || !order_status) {
      return res.status(400).json({ error: "Missing order_id or order_status" });
    }

  
    //2 function di bawah ini tambahan untuk cek apakah yg punya order sesuai dengan token
    // Ambil detail pesanan terlebih dahulu
    const order = await Order.getById(order_id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    console.log("Order.canteen_id:", order);
    console.log("req.user.id:", req.user.id);

    // Cek apakah user yang login adalah pemilik kantin dari pesanan tersebut
    if (order.canteen_id !== req.user.id) {
      return res.status(403).json({ error: "Access Denied. You are not the owner of this canteen." });
    }

    const result = await Order.updateStatus(order_id, order_status);
    res.json({ message: "Order status updated", order_id });
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
}


