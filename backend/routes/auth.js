const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// ✅ Test route
router.get('/test', (req, res) => res.send('Auth route working!'));

// ✅ Register user
router.post('/register', registerUser);

// ✅ Login user
router.post('/login', loginUser);

// ✅ Verify email
router.get('/verify-email', verifyEmail);

// ✅ Forgot Password - Send reset link
router.post('/forgot-password', forgotPassword);

// ✅ Reset Password - Use token from email
router.post('/reset-password/:token', resetPassword);

module.exports = router;
