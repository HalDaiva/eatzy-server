const salesService = require('../services/salesService');
const db = require('../config/db');

exports.getMonthlySales = async (req, res) => {
    try {
        const { canteenId, month, year } = req.query;
        console.log('GET /sales/monthly - canteenId:', canteenId, 'month:', month, 'year:', year);
        if (!canteenId || !month || !year) {
            return res.status(400).json({ error: 'canteenId, month, and year are required' });
        }
        const [rows] = await db.query(
            'SELECT SUM(total_price) as totalSales FROM orders WHERE canteen_id = ? AND order_status = "finished" AND MONTH(created_at) = ? AND YEAR(created_at) = ?',
            [canteenId, month, year]
        );
        const totalSales = rows[0].totalSales || 0;
        res.status(200).json({ totalSales });
    } catch (e) {
        console.error('GET /sales/monthly error:', e.message, e.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
};