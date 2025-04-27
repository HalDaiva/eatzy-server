const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require("../controllers/authCotroller");

router.post('/login',authController.login);
router.post('/register',authController.register);

module.exports = router;
