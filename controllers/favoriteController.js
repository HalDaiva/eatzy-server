const Favorite = require('../models/favoriteModel');
const {sendNotification} = require("../services/notificationService");

exports.getFavoritesByBuyer = async (req, res) => {
    try {
        const favorites = await Favorite.getByBuyer(req.user.id);
        res.json(favorites);

    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

exports.deleteFavorite = async (req, res) => {
    console.log("YEAYYYYY");
    try {
        const result = await Favorite.delete(req.user.id, req.params.menuId);
        res.json(result);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}


