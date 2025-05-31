const db = require('../config/db');

const getMonthlySales = async (canteenId, month, year) => {
  try {
    console.log(`Querying for canteenId: ${canteenId}, month: ${month}, year: ${year}`);
    
    // Use MySQL MONTH() and YEAR() functions instead of SQLite's strftime
    const query = `
      SELECT SUM(total_price) as total_sales
      FROM orders
      WHERE canteen_id = ?
        AND order_status = 'finished'
        AND MONTH(created_at) = ?
        AND YEAR(created_at) = ?
    `;
    
    // MONTH() expects 1-12, so adjust month (JavaScript months are 0-11)
    const monthValue = month + 1;
    const [rows] = await db.query(query, [canteenId, monthValue, year]);
    
    const totalSales = rows[0].total_sales || 0;
    console.log(`Total sales: ${totalSales}`);
    return totalSales;
  } catch (err) {
    console.error('Database error:', err);
    throw err;
  }
};

module.exports = { getMonthlySales };