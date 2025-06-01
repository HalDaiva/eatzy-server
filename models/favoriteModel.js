const db = require('../config/db');

const Favorite = {
    async getByBuyer(id) {
        const [rows] = await db.query('SELECT m.menu_id, m.menu_name, m.menu_image, m.menu_price, c.canteen_id, c.canteen_name FROM favorites as f LEFT JOIN menus m ON f.menu_id = m.menu_id LEFT JOIN menu_categories mc ON m.menu_category_id = mc.menu_category_id LEFT JOIN canteens c ON mc.canteen_id = c.canteen_id WHERE buyer_id = ?', [id]);

        let favorites = [];

        for (const row of rows) {
                favorite = {
                    menu_id: row.menu_id,
                    menu_category: {
                    canteen: {
                            canteen_id: row.canteen_id,
                            canteen_name: row.canteen_name
                    
                        }
                    },
                    menu_name: row.menu_name,
                    menu_image: row.menu_image,
                    menu_price: row.menu_price,
                }
                favorites.push(favorite);
        }
        return favorites;
    },
    async delete(buyerId, menuId) {
        console.log("YEAH IT GOES HERE: " + buyerId + " and " + menuId)
        await db.query('DELETE FROM favorites WHERE buyer_id = ? AND menu_id = ?', [buyerId, menuId]);
        return {message: "Delete Success"};
    },
};

module.exports = Favorite;
