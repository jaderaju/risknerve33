const express = require('express');
const router = express.Router();
const {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  attestToPolicy,
} = require('../controllers/policyController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Define routes for Policies

// Get all policies
// Access: Private (all authenticated users can view policies relevant to them)
router.get('/', protect, getPolicies);

// Get single policy by ID
// Access: Private
router.get('/:id', protect, getPolicyById);

// Create new policy
// Access: Private/SuperAdmin, ComplianceOfficer
router.post(
  '/',
  protect,
  authorizeRoles('SuperAdmin', 'ComplianceOfficer'),
  createPolicy
);

// Update policy
// Access: Private/SuperAdmin, ComplianceOfficer
router.put(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'ComplianceOfficer'),
  updatePolicy
);

// Delete policy
// Access: Private/SuperAdmin, ComplianceOfficer
router.delete(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'ComplianceOfficer'),
  deletePolicy
);

// User attests to a policy
// Access: Private (any authenticated user)
router.post(
  '/:id/attest',
  protect,
  attestToPolicy
);

module.exports = router;
