const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/:id', menuController.getMenuById);
module.exports = router;

