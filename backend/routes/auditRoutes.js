const express = require('express');
const router = express.Router();
const {
  getAudits,
  getAuditById,
  createAudit,
  updateAudit,
  deleteAudit,
} = require('../controllers/auditController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Define routes for Audits

// Get all audits
// Access: Private (all authenticated users, but AuditManager will primarily manage)
router.get('/', protect, getAudits);

// Get single audit by ID
// Access: Private
router.get('/:id', protect, getAuditById);

// Create new audit
// Access: Private/SuperAdmin, AuditManager
router.post(
  '/',
  protect,
  authorizeRoles('SuperAdmin', 'AuditManager'),
  createAudit
);

// Update audit
// Access: Private/SuperAdmin, AuditManager
router.put(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'AuditManager'),
  updateAudit
);

// Delete audit
// Access: Private/SuperAdmin, AuditManager
router.delete(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'AuditManager'),
  deleteAudit
);

module.exports = router;
