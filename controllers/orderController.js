const Order = require('../models/orderModel')

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.getAll()
    res.json(orders)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id)
    res.json(order)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body)
    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    await Order.updateStatus(req.params.id, status)
    res.json({ id: req.params.id, status })
  } catch (err) {
    res.status(500).send(err.message)
  }
}
