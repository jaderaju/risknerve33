const express = require('express');
const router = express.Router();
const {
  getRisks,
  getRiskById,
  createRisk,
  updateRisk,
  deleteRisk,
} = require('../controllers/riskController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Define routes for Risks

// Get all risks
// Access: Private (all authenticated users, but RiskManager/ComplianceOfficer will manage them)
router.get('/', protect, getRisks);

// Get single risk by ID
// Access: Private
router.get('/:id', protect, getRiskById);

// Create new risk
// Access: Private/SuperAdmin, RiskManager, ComplianceOfficer
router.post(
  '/',
  protect,
  authorizeRoles('SuperAdmin', 'RiskManager', 'ComplianceOfficer'),
  createRisk
);

// Update risk
// Access: Private/SuperAdmin, RiskManager, ComplianceOfficer (or Risk Owner if specific logic applied)
router.put(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'RiskManager', 'ComplianceOfficer'),
  updateRisk
);

// Delete risk
// Access: Private/SuperAdmin, RiskManager
router.delete(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'RiskManager'),
  deleteRisk
);

module.exports = router;
