// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/authorize');
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/user', authorize(), authController.getUser);
router.post('/logout',authController.logout);

module.exports = router;