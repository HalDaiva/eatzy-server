const db = require('../config/db')

const OrderModel = {
  // Ambil semua pesanan
  // getAll: async () => {
  //   const [rows] = await db.query('SELECT order_id, order_status, order_time, estimation_time, total_price FROM orders')
  //   return rows
  // },

//   getAllWithItems: async (status) => {
//   let query = `
//     SELECT 
//       o.order_id, o.order_status, o.order_time, o.estimation_time, o.total_price, o.canteen_id
//       oi.item_details,
//       m.menu_name, m.menu_image, m.menu_price
//     FROM orders o
//     JOIN order_items oi ON o.order_id = oi.order_id
//     JOIN menus m ON oi.menu_id = m.menu_id
//     WHERE orders.canteen_id = ?
//   `;
//   // const params = [];
//   const params = [canteenId];
//   // let params = [userId];

//   if (status && status !== 'Semua') {
//     query += ' WHERE o.order_status = ?';
//     params.push(status);
//   }

//   const [rows] = await db.query(query, params);

//   // Grouping data by order_id
//   const grouped = {};
//   for (const row of rows) {
//     if (!grouped[row.order_id]) {
//       grouped[row.order_id] = {
//         order_id: row.order_id,
//         canteen_id: rows[0].canteen_id,
//         order_status: row.order_status,
//         order_time: row.order_time,
//         estimation_time: row.estimation_time,
//         total_price: row.total_price,
//         items: []
//       };
//     }
//     grouped[row.order_id].items.push({
//       menu_name: row.menu_name,
//       // quantity: row.quantity,
//       item_details: row.item_details,
//       menu_image: row.menu_image,
//       menu_price: row.menu_price
//     });
//   }

//   return Object.values(grouped);
// },

  getAllByCanteen: async (status, canteenId) => {
  let query = `
    SELECT 
      o.order_id, o.canteen_id, o.order_status, o.order_time, o.estimation_time, o.total_price,
      oi.item_details,
      m.menu_name, m.menu_image, m.menu_price
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN menus m ON oi.menu_id = m.menu_id
    WHERE o.canteen_id = ?
  `;

  const params = [canteenId];

  if (status !== 'Semua') {
    query += ` AND o.order_status = ?`;
    params.push(status);
  }

  const [rows] = await db.query(query, params);

  // Gabungkan item per order
  const ordersMap = {};
  for (const row of rows) {
    if (!ordersMap[row.order_id]) {
      ordersMap[row.order_id] = {
        order_id: row.order_id,
        canteen_id: row.canteen_id,
        order_status: row.order_status,
        order_time: row.order_time,
        estimation_time: row.estimation_time,
        total_price: row.total_price,
        items: []
      };
    }

    ordersMap[row.order_id].items.push({
      menu_name: row.menu_name,
      item_details: row.item_details,
      menu_image: row.menu_image,
      menu_price: row.menu_price
    });
  }

  return Object.values(ordersMap); // kembalikan dalam bentuk array
},

  getById: async (order_id) => {
  const query = `
    SELECT 
      o.order_id, o.canteen_id, o.order_status, o.order_time, o.estimation_time, o.total_price,
      oi.item_details,
      m.menu_name, m.menu_image, m.menu_price
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN menus m ON oi.menu_id = m.menu_id
    WHERE o.order_id = ?
  `;

  const [rows] = await db.query(query, [order_id]);

  if (rows.length === 0) return null;

  const result = {
    order_id: rows[0].order_id,
    canteen_id: rows[0].canteen_id,
    order_status: rows[0].order_status,
    order_time: rows[0].order_time,
    estimation_time: rows[0].estimation_time,
    total_price: rows[0].total_price,
    items: []
  };

  for (const row of rows) {
    result.items.push({
      menu_name: row.menu_name,
      item_details: row.item_details,
      menu_image: row.menu_image,
      menu_price: row.menu_price
    });
  }

  return result;
},

  // Update status pesanan
  updateStatus: async (order_id, order_status) => {
    const [result] = await db.query(
      'UPDATE orders SET order_status = ? WHERE order_id = ?',
      [order_status, order_id]
    )
    return result
  }
}

module.exports = OrderModel
