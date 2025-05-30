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
  const [rawRows] = await db.query(`
    SELECT 
      o.order_id,
      o.order_status,
      o.order_time,
      o.estimation_time,
      o.total_price,
      oi.item_details,
      m.menu_name,
      m.menu_image,
      m.menu_price,
      a.addon_name,
      a.addon_price
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN menus m ON oi.menu_id = m.menu_id
    LEFT JOIN order_item_addons oia ON oi.order_item_id = oia.order_item_id
    LEFT JOIN addons a ON oia.addon_id = a.addon_id
    WHERE o.canteen_id = ?
    ${status !== 'Semua' ? 'AND o.order_status = ?' : ''}
  `, [canteenId, ...(status !== 'Semua' ? [status] : [])]);

  // Proses grouping dan hitung total
  const ordersMap = {};
  
  for (const row of rawRows) {
    if (!ordersMap[row.order_id]) {
      ordersMap[row.order_id] = {
        order_id: row.order_id,
        order_status: row.order_status,
        order_time: row.order_time,
        estimation_time: row.estimation_time,
        total_price: row.total_price, 
        items: []
      };
    }

    // Cari item yang sama
    const existingItem = ordersMap[row.order_id].items.find(
      item => item.menu_name === row.menu_name && item.item_details === row.item_details
    );

    // Hitung harga item + add-ons
    // const itemBasePrice = parseFloat(row.menu_price) || 0;
    // const addonPrice = row.addon_price ? parseFloat(row.addon_price) : 0;

    if (!existingItem) {
      ordersMap[row.order_id].items.push({
        order_id: row.order_id,
        menu_name: row.menu_name,
        item_details: row.item_details,
        menu_image: row.menu_image,
        menu_price: row.menu_price,
        add_on: row.addon_name || "" // Hanya string nama add-on
      });
    } else if (row.addon_name) {
      existingItem.add_on += existingItem.add_on ? `, ${row.addon_name}` : row.addon_name;
    }

    // Tambahkan ke total_price (harga menu + add-on)
    // ordersMap[row.order_id].total_price += itemBasePrice + addonPrice;
  }

  return Object.values(ordersMap);
},

  // Update status pesanan berdasarkan id
  updateStatus: async (order_id, order_status) => {
    const [result] = await db.query(
      'UPDATE orders SET order_status = ? WHERE order_id = ?',
      [order_status, order_id]
    )
    return result
  }
}

module.exports = OrderModel
