const asyncHandler = require('express-async-handler');
const Control = require('../models/Control');
const User = require('../models/User');
const Framework = require('../models/Framework');
const Risk = require('../models/Risk');

// @desc    Get all controls
// @route   GET /api/controls
// @access  Private (e.g., all authenticated users can view, but specific roles will manage them)
const getControls = asyncHandler(async (req, res) => {
  // Implement pagination, sorting, and advanced filtering later
  const controls = await Control.find({})
    .populate('owner', 'username email role department')
    .populate('frameworks_mapped', 'name version')
    .populate('risks_mitigated', 'name description inherent_score residual_score')
    .populate('implementation_evidence.assigned_to', 'username') // Populate assigned user for implementation tasks
    .sort({ createdAt: -1 });
  res.status(200).json(controls);
});

// @desc    Get single control by ID
// @route   GET /api/controls/:id
// @access  Private
const getControlById = asyncHandler(async (req, res) => {
  const control = await Control.findById(req.params.id)
    .populate('owner', 'username email role department')
    .populate('frameworks_mapped', 'name version')
    .populate('risks_mitigated', 'name description inherent_score residual_score')
    .populate('implementation_evidence.assigned_to', 'username');

  if (!control) {
    res.status(404);
    throw new Error('Control not found');
  }

  res.status(200).json(control);
});

// @desc    Create new control
// @route   POST /api/controls
// @access  Private/SuperAdmin, ComplianceOfficer, ControlOwner
const createControl = asyncHandler(async (req, res) => {
  const { name, description, owner, status, effectiveness_score, frameworks_mapped, risks_mitigated, audit_steps, implementation_evidence } = req.body;

  if (!name || !description || !owner) {
    res.status(400);
    throw new Error('Please include all required fields: name, description, owner');
  }

  // Validate owner
  const ownerExists = await User.findById(owner);
  if (!ownerExists) {
    res.status(400);
    throw new Error('Provided owner user ID does not exist');
  }

  // Validate linked frameworks
  if (frameworks_mapped && frameworks_mapped.length > 0) {
    const frameworksExist = await Framework.find({ '_id': { $in: frameworks_mapped } });
    if (frameworksExist.length !== frameworks_mapped.length) {
      res.status(400);
      throw new Error('One or more linked frameworks not found');
    }
  }

  // Validate linked risks
  if (risks_mitigated && risks_mitigated.length > 0) {
    const risksExist = await Risk.find({ '_id': { $in: risks_mitigated } });
    if (risksExist.length !== risks_mitigated.length) {
      res.status(400);
      throw new Error('One or more linked risks not found');
    }
  }

  const control = await Control.create({
    name,
    description,
    owner,
    status,
    effectiveness_score,
    last_tested_date: new Date(),
    next_test_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default to annual test
    frameworks_mapped,
    risks_mitigated,
    audit_steps,
    implementation_evidence,
  });

  if (control) {
    // Populate immediately after creation for the response
    const populatedControl = await Control.findById(control._id)
      .populate('owner', 'username email role department')
      .populate('frameworks_mapped', 'name version')
      .populate('risks_mitigated', 'name description inherent_score residual_score')
      .populate('implementation_evidence.assigned_to', 'username');
    res.status(201).json(populatedControl);
  } else {
    res.status(400);
    throw new Error('Invalid control data');
  }
});

// @desc    Update control
// @route   PUT /api/controls/:id
// @access  Private/SuperAdmin, ComplianceOfficer, ControlOwner (or the Control Owner if specific logic applied)
const updateControl = asyncHandler(async (req, res) => {
  const { name, description, owner, status, effectiveness_score, last_tested_date, next_test_date, frameworks_mapped, risks_mitigated, audit_steps, implementation_evidence } = req.body;

  const control = await Control.findById(req.params.id);

  if (!control) {
    res.status(404);
    throw new Error('Control not found');
  }

  // Validate new owner if provided
  if (owner && !await User.findById(owner)) {
    res.status(400);
    throw new Error('Provided new owner user ID does not exist');
  }

  // Validate linked frameworks if provided
  if (frameworks_mapped && frameworks_mapped.length > 0) {
    const frameworksExist = await Framework.find({ '_id': { $in: frameworks_mapped } });
    if (frameworksExist.length !== frameworks_mapped.length) {
      res.status(400);
      throw new Error('One or more linked frameworks not found');
    }
  }

  // Validate linked risks if provided
  if (risks_mitigated && risks_mitigated.length > 0) {
    const risksExist = await Risk.find({ '_id': { $in: risks_mitigated } });
    if (risksExist.length !== risks_mitigated.length) {
      res.status(400);
      throw new Error('One or more linked risks not found');
    }
  }

  control.name = name !== undefined ? name : control.name;
  control.description = description !== undefined ? description : control.description;
  control.owner = owner !== undefined ? owner : control.owner;
  control.status = status !== undefined ? status : control.status;
  control.effectiveness_score = effectiveness_score !== undefined ? effectiveness_score : control.effectiveness_score;
  control.last_tested_date = last_tested_date !== undefined ? last_tested_date : control.last_tested_date;
  control.next_test_date = next_test_date !== undefined ? next_test_date : control.next_test_date;
  control.frameworks_mapped = frameworks_mapped !== undefined ? frameworks_mapped : control.frameworks_mapped;
  control.risks_mitigated = risks_mitigated !== undefined ? risks_mitigated : control.risks_mitigated;
  control.audit_steps = audit_steps !== undefined ? audit_steps : control.audit_steps;
  control.implementation_evidence = implementation_evidence !== undefined ? implementation_evidence : control.implementation_evidence;


  const updatedControl = await control.save();

  // Populate the updated control for the response
  const populatedUpdatedControl = await Control.findById(updatedControl._id)
    .populate('owner', 'username email role department')
    .populate('frameworks_mapped', 'name version')
    .populate('risks_mitigated', 'name description inherent_score residual_score')
    .populate('implementation_evidence.assigned_to', 'username');

  res.status(200).json(populatedUpdatedControl);
});

// @desc    Delete control
// @route   DELETE /api/controls/:id
// @access  Private/SuperAdmin, ComplianceOfficer
const deleteControl = asyncHandler(async (req, res) => {
  const control = await Control.findById(req.params.id);

  if (!control) {
    res.status(404);
    throw new Error('Control not found');
  }

  await control.deleteOne();

  res.status(200).json({ message: 'Control removed successfully', id: req.params.id });
});

module.exports = {
  getControls,
  getControlById,
  createControl,
  updateControl,
  deleteControl,
};
