const asyncHandler = require('express-async-handler');
const Risk = require('../models/Risk');
const User = require('../models/User');
const Asset = require('../models/Asset'); // To link risks to assets
const Control = require('../models/Control'); // To link risks to controls

// Helper function to calculate inherent and residual score (can be externalized if needed)
const calculateScores = (risk) => {
  risk.inherent_score = risk.impact * risk.likelihood;
  // For simplicity, initially set residual to inherent, or calculate based on linked controls' effectiveness
  // A more advanced approach would factor in control effectiveness here
  if (!risk.residual_score || risk.residual_score === 0) { // Only set if not already manually set
    risk.residual_score = risk.inherent_score;
  }
};

// @desc    Get all risks
// @route   GET /api/risks
// @access  Private (e.g., all authenticated users can view, but specific roles might see more detail)
const getRisks = asyncHandler(async (req, res) => {
  // Implement pagination, sorting, and advanced filtering later
  const risks = await Risk.find({})
    .populate('owner', 'username email role department')
    .populate('assets_linked', 'name type classification')
    .populate('controls_linked', 'name description status')
    .populate('mitigation_tasks.assigned_to', 'username') // Populate assigned user for mitigation tasks
    .sort({ createdAt: -1 });
  res.status(200).json(risks);
});

// @desc    Get single risk by ID
// @route   GET /api/risks/:id
// @access  Private
const getRiskById = asyncHandler(async (req, res) => {
  const risk = await Risk.findById(req.params.id)
    .populate('owner', 'username email role department')
    .populate('assets_linked', 'name type classification')
    .populate('controls_linked', 'name description status')
    .populate('mitigation_tasks.assigned_to', 'username');

  if (!risk) {
    res.status(404);
    throw new Error('Risk not found');
  }

  res.status(200).json(risk);
});

// @desc    Create new risk
// @route   POST /api/risks
// @access  Private/SuperAdmin, RiskManager, ComplianceOfficer
const createRisk = asyncHandler(async (req, res) => {
  const { name, description, category, impact, likelihood, owner, treatment_plan, assets_linked, controls_linked, mitigation_tasks } = req.body;

  if (!name || !impact || !likelihood || !owner) {
    res.status(400);
    throw new Error('Please include all required fields: name, impact, likelihood, owner');
  }

  // Validate owner
  const ownerExists = await User.findById(owner);
  if (!ownerExists) {
    res.status(400);
    throw new Error('Provided owner user ID does not exist');
  }

  // Validate linked assets
  if (assets_linked && assets_linked.length > 0) {
    const assetsExist = await Asset.find({ '_id': { $in: assets_linked } });
    if (assetsExist.length !== assets_linked.length) {
      res.status(400);
      throw new Error('One or more linked assets not found');
    }
  }

  // Validate linked controls
  if (controls_linked && controls_linked.length > 0) {
    const controlsExist = await Control.find({ '_id': { $in: controls_linked } });
    if (controlsExist.length !== controls_linked.length) {
      res.status(400);
      throw new Error('One or more linked controls not found');
    }
  }

  const riskData = {
    name,
    description,
    category,
    impact,
    likelihood,
    owner,
    treatment_plan,
    assets_linked,
    controls_linked,
    mitigation_tasks,
    last_review_date: new Date(),
    next_review_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default to annual review
  };

  const risk = await Risk.create(riskData);

  if (risk) {
    // Populate immediately after creation for the response
    const populatedRisk = await Risk.findById(risk._id)
      .populate('owner', 'username email role department')
      .populate('assets_linked', 'name type classification')
      .populate('controls_linked', 'name description status')
      .populate('mitigation_tasks.assigned_to', 'username');
    res.status(201).json(populatedRisk);
  } else {
    res.status(400);
    throw new Error('Invalid risk data');
  }
});

// @desc    Update risk
// @route   PUT /api/risks/:id
// @access  Private/SuperAdmin, RiskManager, ComplianceOfficer (or Risk Owner)
const updateRisk = asyncHandler(async (req, res) => {
  const { name, description, category, impact, likelihood, owner, status, treatment_plan, assets_linked, controls_linked, mitigation_tasks, last_review_date, next_review_date } = req.body;

  const risk = await Risk.findById(req.params.id);

  if (!risk) {
    res.status(404);
    throw new Error('Risk not found');
  }

  // Validate new owner if provided
  if (owner && !await User.findById(owner)) {
    res.status(400);
    throw new Error('Provided new owner user ID does not exist');
  }

  // Validate linked assets if provided
  if (assets_linked && assets_linked.length > 0) {
    const assetsExist = await Asset.find({ '_id': { $in: assets_linked } });
    if (assetsExist.length !== assets_linked.length) {
      res.status(400);
      throw new Error('One or more linked assets not found');
    }
  }

  // Validate linked controls if provided
  if (controls_linked && controls_linked.length > 0) {
    const controlsExist = await Control.find({ '_id': { $in: controls_linked } });
    if (controlsExist.length !== controls_linked.length) {
      res.status(400);
      throw new Error('One or more linked controls not found');
    }
  }

  risk.name = name !== undefined ? name : risk.name;
  risk.description = description !== undefined ? description : risk.description;
  risk.category = category !== undefined ? category : risk.category;
  risk.impact = impact !== undefined ? impact : risk.impact;
  risk.likelihood = likelihood !== undefined ? likelihood : risk.likelihood;
  risk.owner = owner !== undefined ? owner : risk.owner;
  risk.status = status !== undefined ? status : risk.status;
  risk.treatment_plan = treatment_plan !== undefined ? treatment_plan : risk.treatment_plan;
  risk.assets_linked = assets_linked !== undefined ? assets_linked : risk.assets_linked;
  risk.controls_linked = controls_linked !== undefined ? controls_linked : risk.controls_linked;
  risk.mitigation_tasks = mitigation_tasks !== undefined ? mitigation_tasks : risk.mitigation_tasks;
  risk.last_review_date = last_review_date !== undefined ? last_review_date : risk.last_review_date;
  risk.next_review_date = next_review_date !== undefined ? next_review_date : risk.next_review_date;

  // Re-calculate scores if impact or likelihood changed
  if (impact !== undefined || likelihood !== undefined) {
    calculateScores(risk);
  }

  const updatedRisk = await risk.save();

  // Populate the updated risk for the response
  const populatedUpdatedRisk = await Risk.findById(updatedRisk._id)
    .populate('owner', 'username email role department')
    .populate('assets_linked', 'name type classification')
    .populate('controls_linked', 'name description status')
    .populate('mitigation_tasks.assigned_to', 'username');

  res.status(200).json(populatedUpdatedRisk);
});

// @desc    Delete risk
// @route   DELETE /api/risks/:id
// @access  Private/SuperAdmin, RiskManager
const deleteRisk = asyncHandler(async (req, res) => {
  const risk = await Risk.findById(req.params.id);

  if (!risk) {
    res.status(404);
    throw new Error('Risk not found');
  }

  await risk.deleteOne();

  res.status(200).json({ message: 'Risk removed successfully', id: req.params.id });
});

module.exports = {
  getRisks,
  getRiskById,
  createRisk,
  updateRisk,
  deleteRisk,
};
