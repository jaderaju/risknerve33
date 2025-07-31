const asyncHandler = require('express-async-handler');
const Framework = require('../models/Framework');
const Control = require('../models/Control'); // To link frameworks to controls

// @desc    Get all frameworks
// @route   GET /api/frameworks
// @access  Private (all authenticated users can view)
const getFrameworks = asyncHandler(async (req, res) => {
  const frameworks = await Framework.find({})
    .populate('controls_mapped', 'name description status') // Populate controls linked to framework
    .sort({ name: 1 }); // Sort by name alphabetically
  res.status(200).json(frameworks);
});

// @desc    Get single framework by ID
// @route   GET /api/frameworks/:id
// @access  Private
const getFrameworkById = asyncHandler(async (req, res) => {
  const framework = await Framework.findById(req.params.id)
    .populate('controls_mapped', 'name description status');

  if (!framework) {
    res.status(404);
    throw new Error('Framework not found');
  }

  res.status(200).json(framework);
});

// @desc    Create new framework
// @route   POST /api/frameworks
// @access  Private/SuperAdmin, ComplianceOfficer
const createFramework = asyncHandler(async (req, res) => {
  const { name, version, description, type, source, compliance_requirements, controls_mapped } = req.body;

  if (!name || !version || !type) {
    res.status(400);
    throw new Error('Please include all required fields: name, version, type');
  }

  // Check if framework with this name and version already exists (optional: unique constraint in schema)
  const frameworkExists = await Framework.findOne({ name, version });
  if (frameworkExists) {
    res.status(400);
    throw new Error(`Framework with name '${name}' and version '${version}' already exists`);
  }

  // Validate linked controls if provided
  if (controls_mapped && controls_mapped.length > 0) {
    const controlsExist = await Control.find({ '_id': { $in: controls_mapped } });
    if (controlsExist.length !== controls_mapped.length) {
      res.status(400);
      throw new Error('One or more linked controls not found');
    }
  }

  const framework = await Framework.create({
    name,
    version,
    description,
    type,
    source,
    compliance_requirements,
    controls_mapped,
  });

  if (framework) {
    // Populate immediately after creation for the response
    const populatedFramework = await Framework.findById(framework._id)
      .populate('controls_mapped', 'name description status');
    res.status(201).json(populatedFramework);
  } else {
    res.status(400);
    throw new Error('Invalid framework data');
  }
});

// @desc    Update framework
// @route   PUT /api/frameworks/:id
// @access  Private/SuperAdmin, ComplianceOfficer
const updateFramework = asyncHandler(async (req, res) => {
  const { name, version, description, type, source, compliance_requirements, controls_mapped } = req.body;

  const framework = await Framework.findById(req.params.id);

  if (!framework) {
    res.status(404);
    throw new Error('Framework not found');
  }

  // Validate linked controls if provided
  if (controls_mapped && controls_mapped.length > 0) {
    const controlsExist = await Control.find({ '_id': { $in: controls_mapped } });
    if (controlsExist.length !== controls_mapped.length) {
      res.status(400);
      throw new Error('One or more linked controls not found');
    }
  }

  framework.name = name !== undefined ? name : framework.name;
  framework.version = version !== undefined ? version : framework.version;
  framework.description = description !== undefined ? description : framework.description;
  framework.type = type !== undefined ? type : framework.type;
  framework.source = source !== undefined ? source : framework.source;
  framework.compliance_requirements = compliance_requirements !== undefined ? compliance_requirements : framework.compliance_requirements;
  framework.controls_mapped = controls_mapped !== undefined ? controls_mapped : framework.controls_mapped;


  const updatedFramework = await framework.save();

  // Populate the updated framework for the response
  const populatedUpdatedFramework = await Framework.findById(updatedFramework._id)
    .populate('controls_mapped', 'name description status');

  res.status(200).json(populatedUpdatedFramework);
});

// @desc    Delete framework
// @route   DELETE /api/frameworks/:id
// @access  Private/SuperAdmin, ComplianceOfficer
const deleteFramework = asyncHandler(async (req, res) => {
  const framework = await Framework.findById(req.params.id);

  if (!framework) {
    res.status(404);
    throw new Error('Framework not found');
  }

  // Optional: Prevent deletion if controls are still mapped to this framework
  // const controlsUsingFramework = await Control.countDocuments({ frameworks_mapped: framework._id });
  // if (controlsUsingFramework > 0) {
  //   res.status(400);
  //   throw new Error(`Cannot delete framework as it is mapped to ${controlsUsingFramework} control(s).`);
  // }

  await framework.deleteOne();

  res.status(200).json({ message: 'Framework removed successfully', id: req.params.id });
});

module.exports = {
  getFrameworks,
  getFrameworkById,
  createFramework,
  updateFramework,
  deleteFramework,
};
