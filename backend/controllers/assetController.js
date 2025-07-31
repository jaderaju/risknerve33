const asyncHandler = require('express-async-handler');
const Asset = require('../models/Asset');
const User = require('../models/User'); // To populate owner details

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private (e.g., all authenticated users can view assets)
const getAssets = asyncHandler(async (req, res) => {
  // Implement pagination and filtering later for large datasets
  const assets = await Asset.find({})
    .populate('owner', 'username email role department') // Populate owner details
    .sort({ createdAt: -1 }); // Sort by creation date, newest first
  res.status(200).json(assets);
});

// @desc    Get single asset by ID
// @route   GET /api/assets/:id
// @access  Private
const getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id).populate('owner', 'username email role department');

  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  res.status(200).json(asset);
});

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private/SuperAdmin, ITManager, SecurityOfficer
const createAsset = asyncHandler(async (req, res) => {
  const { name, type, description, owner, classification, location, tags } = req.body;

  if (!name || !type || !owner || !classification) {
    res.status(400);
    throw new Error('Please include all required fields: name, type, owner, classification');
  }

  // Check if owner exists
  const ownerExists = await User.findById(owner);
  if (!ownerExists) {
    res.status(400);
    throw new Error('Provided owner user ID does not exist');
  }

  const asset = await Asset.create({
    name,
    type,
    description,
    owner,
    classification,
    location,
    tags,
    last_review_date: new Date(), // Set initial review date
  });

  if (asset) {
    // Populate the owner to return a richer object immediately
    const populatedAsset = await Asset.findById(asset._id).populate('owner', 'username email role department');
    res.status(201).json(populatedAsset);
  } else {
    res.status(400);
    throw new Error('Invalid asset data');
  }
});

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private/SuperAdmin, ITManager, SecurityOfficer (or Asset Owner if permitted)
const updateAsset = asyncHandler(async (req, res) => {
  const { name, type, description, owner, classification, location, status, tags, last_review_date, cmdb_id } = req.body;

  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  // Check if the requesting user is allowed to update (e.g., SuperAdmin, or the asset owner, or specific roles)
  // For simplicity here, we'll rely on the route's `authorizeRoles` middleware.
  // Additional logic could be: if (req.user._id.toString() !== asset.owner.toString() && req.user.role !== 'SuperAdmin') { throw new Error('Not authorized'); }

  if (owner && !await User.findById(owner)) {
    res.status(400);
    throw new Error('Provided new owner user ID does not exist');
  }

  asset.name = name || asset.name;
  asset.type = type || asset.type;
  asset.description = description || asset.description;
  asset.owner = owner || asset.owner;
  asset.classification = classification || asset.classification;
  asset.location = location || asset.location;
  asset.status = status || asset.status;
  asset.tags = tags || asset.tags;
  asset.last_review_date = last_review_date || asset.last_review_date;
  asset.cmdb_id = cmdb_id || asset.cmdb_id; // Update CMDB ID

  const updatedAsset = await asset.save();

  // Populate the owner to return a richer object
  const populatedUpdatedAsset = await Asset.findById(updatedAsset._id).populate('owner', 'username email role department');

  res.status(200).json(populatedUpdatedAsset);
});

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private/SuperAdmin, ITManager, SecurityOfficer
const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  await asset.deleteOne(); // Use deleteOne() for Mongoose 6+

  res.status(200).json({ message: 'Asset removed successfully', id: req.params.id });
});

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
};
