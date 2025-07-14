const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET || 'mySecretKey';

// ✅ Register user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, profilePic, bio } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      profilePic,
      bio
    });

    await newUser.save();

    // ✅ Send verification email
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '1d' });
    const verifyUrl = `http://localhost:5000/api/auth/verify-email?token=${token}`;
    const html = `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verifyUrl}">Verify Email</a>
    `;

    await sendEmail(email, 'Verify Your Email', html);

    res.status(201).json({ msg: 'User registered successfully. Check email for verification.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ✅ Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    if (!user.isActive) {
      return res.status(403).json({ msg: 'Account is deactivated. Please contact support.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ msg: 'Please verify your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        bio: user.bio
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ✅ Email verification
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(400).send('Invalid verification link.');
    if (user.isVerified) return res.status(400).send('Email already verified.');

    user.isVerified = true;
    await user.save();

    res.send('Email verified successfully!');
  } catch (err) {
    res.status(400).send('Invalid or expired token.');
  }
};

// ✅ Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;
    const html = `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `;

    await sendEmail(user.email, 'Reset Your Password', html);
    res.json({ msg: 'Password reset link sent to email.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ✅ Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ msg: 'Invalid or expired token' });

    if (newPassword !== confirmPassword) {
      console.log('Password:', newPassword);
      console.log('Confirm:', confirmPassword);
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ msg: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
