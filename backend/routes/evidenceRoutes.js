const express = require('express');
const router = express.Router();
const {
  getAllEvidence,
  getEvidenceById,
  createEvidence,
  updateEvidence,
  deleteEvidence,
} = require('../controllers/evidenceController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Note on Multer for File Uploads:
// If you were handling actual file uploads, you'd integrate a middleware like `multer` here.
// Example:
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/evidence/' }); // Configure destination and file naming
// router.post('/', protect, upload.single('evidenceFile'), createEvidence); // For single file upload

// Define routes for Evidence

// Get all evidence records
// Access: Private (all authenticated users, but specific roles for review/management)
router.get('/', protect, getAllEvidence);

// Get single evidence record by ID
// Access: Private
router.get('/:id', protect, getEvidenceById);

// Create new evidence record (and optionally handle file upload)
// Access: Private (any authenticated user can upload evidence)
router.post(
  '/',
  protect,
  // Add upload.single('yourFieldName') or upload.array() here if using multer
  createEvidence
);

// Update evidence record (e.g., change status, add review comments)
// Access: Private/SuperAdmin, AuditManager, ComplianceOfficer
router.put(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'AuditManager', 'ComplianceOfficer'),
  updateEvidence
);

// Delete evidence record
// Access: Private/SuperAdmin, AuditManager, ComplianceOfficer
router.delete(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'AuditManager', 'ComplianceOfficer'),
  deleteEvidence
);

module.exports = router;
