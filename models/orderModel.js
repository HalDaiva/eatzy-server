const db = require('../config/db')

const OrderModel = {
  getAll: async() => {
    const [rows] = await db.query('SELECT * FROM orders')
    return rows
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id])
    return rows[0]
  },

  create: async (order) => {
    const { order_id, buyer_id, items, status } = order
    const [result] = await db.query(
      'INSERT INTO orders (id, customer_name, items, status) VALUES (?, ?, ?, ?)',
      [id, customerName, items.join(','), status]
    )
    return result
  },

  updateStatus: async (id, newStatus) => {
    const [result] = await db.query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [newStatus, id]
    )
    return result
  }

}

module.exports = OrderModel
