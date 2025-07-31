const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import both middlewares

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin, AuditManager, ComplianceOfficer
router.get(
  '/',
  protect,
  authorizeRoles('SuperAdmin', 'AuditManager', 'ComplianceOfficer'), // Only these roles can view all users
  asyncHandler(async (req, res) => {
    // Implement pagination and filtering later for large datasets
    const users = await User.find({}).select('-password'); // Exclude passwords
    res.json(users);
  })
);

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/SuperAdmin, AuditManager, ComplianceOfficer (or self for profile)
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Allow user to get their own profile, or specific roles to get any user's profile
    if (req.user._id.toString() === user._id.toString() || req.user.role === 'SuperAdmin' || req.user.role === 'AuditManager' || req.user.role === 'ComplianceOfficer') {
      res.json(user);
    } else {
      res.status(403);
      throw new Error('Not authorized to view this user profile');
    }
  })
);

// @desc    Update user profile (self update)
// @route   PUT /api/users/profile
// @access  Private
router.put(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.department = req.body.department || user.department;

      // Allow updating password
      if (req.body.password) {
        user.password = req.body.password; // Pre-save hook will hash this
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);


// @desc    Update user by ID (for admins)
// @route   PUT /api/users/:id
// @access  Private/SuperAdmin
router.put(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin'), // Only SuperAdmin can update other users
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role; // Admin can update role
      user.department = req.body.department || user.department;
      user.status = req.body.status || user.status;

      // Allow admin to update password if provided
      if (req.body.password) {
        user.password = req.body.password; // Pre-save hook will hash this
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        status: updatedUser.status,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

// @desc    Delete user by ID
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
router.delete(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin'), // Only SuperAdmin can delete users
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne(); // Use deleteOne() instead of remove() for Mongoose 6+
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

module.exports = router;
