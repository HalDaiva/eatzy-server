const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {authorize} = require('../middleware/authorize');

router.get('/', authorize(), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.patch('/device-token', authorize(), userController.updateDeviceToken);
router.delete('/:id', userController.deleteUser);

module.exports = router;
