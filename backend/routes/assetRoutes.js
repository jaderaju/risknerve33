const express = require('express');
const router = express.Router();
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} = require('../controllers/assetController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Define routes for Assets

// Get all assets
// Access: Private (all authenticated users can view, but specific roles might be better for enterprise)
router.get('/', protect, getAssets);

// Get single asset by ID
// Access: Private
router.get('/:id', protect, getAssetById);

// Create new asset
// Access: Private/SuperAdmin, ITManager, SecurityOfficer (assuming these roles manage assets)
router.post(
  '/',
  protect,
  authorizeRoles('SuperAdmin', 'ITManager', 'SecurityOfficer'),
  createAsset
);

// Update asset
// Access: Private/SuperAdmin, ITManager, SecurityOfficer (or the asset owner)
// For asset owner to update, additional logic would be needed in controller or a specific route
router.put(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'ITManager', 'SecurityOfficer'),
  updateAsset
);

// Delete asset
// Access: Private/SuperAdmin, ITManager, SecurityOfficer
router.delete(
  '/:id',
  protect,
  authorizeRoles('SuperAdmin', 'ITManager', 'SecurityOfficer'),
  deleteAsset
);

module.exports = router;
