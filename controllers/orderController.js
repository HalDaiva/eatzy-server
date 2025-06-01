const Order = require('../models/orderModel');
const {sendNotification} = require("../services/notificationService");

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

    const order = await Order.getOrderById(orderId);

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

exports.updateOrderStatus = async (req, res) => {

  const orderId = req.params.order_id;
  const { order_status } = req.body;

  const order = await Order.getOrderById(orderId);

  if (!order) return res.status(404).json({ message: "Order not found" });

  // Contoh validasi transisi status
  if (order_status === "finished") {
    if (order.order_status !== "processing") {
      return res.status(400).json({ message: "Order must be in processing status to finish" });
    }

    await Order.updateStatusToFinished(orderId);  // misal update khusus finished

      console.log(order.buyer_id);

      sendNotification(
        order.buyer_id,
          "Pesanan Anda telah selesai",
          "Silahkan ambil pesanan Anda di kantin kami",
      )
  } else {
    await Order.updateStatus(orderId, order_status);
  }

  res.json({ message: "Order status updated successfully" });
};
