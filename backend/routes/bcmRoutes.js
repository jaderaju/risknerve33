const express = require('express');
const router = express.Router();
const {
  getBCMPlans,
  getBCMPlanById,
  createBCMPlan,
  updateBCMPlan,
  deleteBCMPlan,
} = require('../controllers/bcmController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Define routes for BCM

// Get all BCM plans
// Access: Private (all authenticated users, but BCMManager/SuperAdmin will primarily manage)
router.get('/', protect, getBCMPlans);

// Get single BCM plan by ID
// Access: Private
router.get('/:id', protect, getBCMPlanById);

// Create new BCM plan
// Access: Private/SuperAdmin, BCMManager
router.post(
  '/',
  protect,
  authorizeRoles('SuperAdmin', 'BCMManager'),
  createBCMPlan
);

// Update BCM plan
// Access: Private/SuperAdmin, BCMManager
router.put(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'BCMManager'),
  updateBCMPlan
);

// Delete BCM plan
// Access: Private/SuperAdmin, BCMManager
router.delete(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'BCMManager'),
  deleteBCMPlan
);

module.exports = router;
