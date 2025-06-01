const db = require('../config/db')

const OrderModel = {
  //untuk transisi ke detail pesanan
  getById: async (order_id) => {
  const [rawRows] = await db.query(`
    SELECT 
      o.order_id,
      o.canteen_id,
      o.order_status,
      o.order_time,
      o.schedule_time,
      o.total_price,
      oi.item_details,
      m.menu_id,
      m.menu_name,
      m.menu_image,
      m.menu_price,
      a.addon_id,
      a.addon_name,
      a.addon_price
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN menus m ON oi.menu_id = m.menu_id
    LEFT JOIN order_item_addons oia ON oi.order_item_id = oia.order_item_id
    LEFT JOIN addons a ON oia.addon_id = a.addon_id
    WHERE o.order_id = ?
  `, [order_id]);

  if (rawRows.length === 0) return null;

  // Proses nested items dan add-ons
  const orderData = {
    order_id: rawRows[0].order_id,
    canteen_id: rawRows[0].canteen_id,
    order_status: rawRows[0].order_status,
    order_time: rawRows[0].order_time,
    schedule_time: rawRows[0].schedule_time,
    total_price: rawRows[0].total_price,
    items: []
  };

  for (const row of rawRows) {
    let existingItem = orderData.items.find(item =>
      item.menu_id === row.menu_id &&
      item.item_details === row.item_details &&
      JSON.stringify(item.add_ons.map(a => a.id).sort()) === JSON.stringify([row.addon_id].filter(Boolean).sort())
    );

    if (!existingItem) {
      existingItem = {
        menu_id: row.menu_id,
        menu_name: row.menu_name,
        item_details: row.item_details,
        menu_image: row.menu_image,
        menu_price: row.menu_price,
        add_ons: []
      };
      orderData.items.push(existingItem);
    }

    if (row.addon_id && row.addon_name) {
      const alreadyExists = existingItem.add_ons.some(addOn => addOn.id === row.addon_id);
      if (!alreadyExists) {
        existingItem.add_ons.push({
          id: row.addon_id,
          name: row.addon_name
        });
      }
    }
  }

  return orderData;
},

  //untuk tampilan state, ubah state
  getAllByCanteen: async (status, canteenId) => {
    const queryParams = [canteenId];
    let statusCondition = '';
    if (status !== 'Semua') {
      statusCondition = 'AND o.order_status LIKE ?';
      queryParams.push(`%${status}%`);
    }
    const [rawRows] = await db.query(`
      SELECT 
        o.order_id,
        o.order_status,
        o.order_time,
        o.schedule_time,
        o.total_price,
        oi.item_details,
        m.menu_id,
        m.menu_name,
        m.menu_image,
        m.menu_price,
        a.addon_id,
        a.addon_name,
        a.addon_price
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN menus m ON oi.menu_id = m.menu_id
      LEFT JOIN order_item_addons oia ON oi.order_item_id = oia.order_item_id
      LEFT JOIN addons a ON oia.addon_id = a.addon_id
      WHERE o.canteen_id = ?
      ${statusCondition}
    `, queryParams);

    const ordersMap = {};

    for (const row of rawRows) {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          order_id: row.order_id,
          order_status: row.order_status,
          order_time: row.order_time,
          schedule_time: row.schedule_time,
          total_price: row.total_price,
          items: []
        };
      }

      let existingItem = ordersMap[row.order_id].items.find(item =>
        item.menu_id === row.menu_id &&
        item.item_details === row.item_details &&
        JSON.stringify(item.add_ons.map(a => a.id).sort()) === JSON.stringify([row.addon_id].filter(Boolean).sort())
      );

      if (!existingItem) {
        existingItem = {
          menu_id: row.menu_id,
          menu_name: row.menu_name,
          item_details: row.item_details,
          menu_image: row.menu_image,
          menu_price: row.menu_price,
          add_ons: []
        };
        ordersMap[row.order_id].items.push(existingItem);
      }

      if (row.addon_id && row.addon_name) {
        const alreadyExists = existingItem.add_ons.some(addOn => addOn.id === row.addon_id);
        if (!alreadyExists) {
          existingItem.add_ons.push({
            id: row.addon_id,
            name: row.addon_name
          });
        }
      }
    }

    return Object.values(ordersMap);
  },

  updateStatus: async (order_id, order_status) => {
    const [result] = await db.query(
      'UPDATE orders SET order_status = ? WHERE order_id = ?',
      [order_status, order_id]
    )
    return result;
  }
}

module.exports = OrderModel;
