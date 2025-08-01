const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// ✅ Test GET route for /api/auth (for browser testing)
router.get('/', (req, res) => {
  res.json({ message: 'Auth API is live!' });
});

// ...your existing register, login, and profile routes here...

// @desc    Register new user
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { username, email, password, role, department } = req.body;
    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please enter all required fields: username, email, password');
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User with this email already exists');
    }
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'Employee',
      department,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  })
);

// @desc    Authenticate a user (login)
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      user.lastLogin = new Date();
      await user.save();
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  })
);

// @desc    Get user profile (protected route for the logged-in user)
router.get(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    res.json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      status: req.user.status,
      createdAt: req.user.createdAt,
    });
  })
);

module.exports = router;
