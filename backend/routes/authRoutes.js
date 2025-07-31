const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { username, email, password, role, department } = req.body;

    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please enter all required fields: username, email, password');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'Employee', // Default to 'Employee' if no role is provided
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
// @route   POST /api/auth/login
// @access  Public
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Update lastLogin timestamp
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
// @route   GET /api/auth/profile
// @access  Private
router.get(
  '/profile',
  protect, // This route is protected
  asyncHandler(async (req, res) => {
    // req.user is available here from the protect middleware
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
