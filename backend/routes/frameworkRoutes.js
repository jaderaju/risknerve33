const express = require('express');
const router = express.Router();
const {
  getFrameworks,
  getFrameworkById,
  createFramework,
  updateFramework,
  deleteFramework,
} = require('../controllers/frameworkController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Define routes for Frameworks

// Get all frameworks
// Access: Private (all authenticated users can view)
router.get('/', protect, getFrameworks);

// Get single framework by ID
// Access: Private
router.get('/:id', protect, getFrameworkById);

// Create new framework
// Access: Private/SuperAdmin, ComplianceOfficer
router.post(
  '/',
  protect,
  authorizeRoles('SuperAdmin', 'ComplianceOfficer'),
  createFramework
);

// Update framework
// Access: Private/SuperAdmin, ComplianceOfficer
router.put(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'ComplianceOfficer'),
  updateFramework
);

// Delete framework
// Access: Private/SuperAdmin, ComplianceOfficer
router.delete(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'ComplianceOfficer'),
  deleteFramework
);

module.exports = router;
