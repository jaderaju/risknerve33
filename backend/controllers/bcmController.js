const asyncHandler = require('express-async-handler');
const BCM = require('../models/BCM');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Risk = require('../models/Risk');

// @desc    Get all BCM plans
// @route   GET /api/bcm
// @access  Private (e.g., all authenticated users can view, BCMManager/SuperAdmin will manage)
const getBCMPlans = asyncHandler(async (req, res) => {
  const plans = await BCM.find({})
    .populate('owner', 'username email role')
    .populate('responsible_parties.user', 'username email')
    .populate('assets_covered', 'name type classification')
    .populate('linked_risks', 'name inherent_score residual_score')
    .sort({ last_updated_date: -1 });
  res.status(200).json(plans);
});

// @desc    Get single BCM plan by ID
// @route   GET /api/bcm/:id
// @access  Private
const getBCMPlanById = asyncHandler(async (req, res) => {
  const plan = await BCM.findById(req.params.id)
    .populate('owner', 'username email role')
    .populate('responsible_parties.user', 'username email')
    .populate('assets_covered', 'name type classification')
    .populate('linked_risks', 'name inherent_score residual_score');

  if (!plan) {
    res.status(404);
    throw new Error('BCM Plan not found');
  }

  res.status(200).json(plan);
});

// @desc    Create new BCM plan
// @route   POST /api/bcm
// @access  Private/SuperAdmin, BCMManager
const createBCMPlan = asyncHandler(async (req, res) => {
  const { name, version, description, owner, status, last_tested_date, next_test_date, recovery_time_objective, recovery_point_objective, responsible_parties, assets_covered, linked_risks, recovery_procedures, communication_plan, incident_response_plan_url } = req.body;

  if (!name || !version || !owner || !recovery_time_objective || !recovery_point_objective) {
    res.status(400);
    throw new Error('Please include all required fields: name, version, owner, recovery_time_objective, recovery_point_objective');
  }

  // Validate owner
  const ownerExists = await User.findById(owner);
  if (!ownerExists) {
    res.status(400);
    throw new Error('Provided owner user ID does not exist');
  }

  // Validate responsible parties
  if (responsible_parties && responsible_parties.length > 0) {
    for (const party of responsible_parties) {
      if (party.user && !await User.findById(party.user)) {
        res.status(400);
        throw new Error('One or more responsible party user IDs not found');
      }
    }
  }

  // Validate linked assets
  if (assets_covered && assets_covered.length > 0) {
    const assetsExist = await Asset.find({ '_id': { $in: assets_covered } });
    if (assetsExist.length !== assets_covered.length) {
      res.status(400);
      throw new Error('One or more linked assets not found');
    }
  }

  // Validate linked risks
  if (linked_risks && linked_risks.length > 0) {
    const risksExist = await Risk.find({ '_id': { $in: linked_risks } });
    if (risksExist.length !== linked_risks.length) {
      res.status(400);
      throw new Error('One or more linked risks not found');
    }
  }

  const bcmPlan = await BCM.create({
    name,
    version,
    description,
    owner,
    status: status || 'Draft', // Default to Draft
    last_updated_date: new Date(),
    last_tested_date,
    next_test_date,
    recovery_time_objective,
    recovery_point_objective,
    responsible_parties,
    assets_covered,
    linked_risks,
    recovery_procedures,
    communication_plan,
    incident_response_plan_url,
  });

  if (bcmPlan) {
    const populatedPlan = await BCM.findById(bcmPlan._id)
      .populate('owner', 'username email role')
      .populate('responsible_parties.user', 'username email')
      .populate('assets_covered', 'name type classification')
      .populate('linked_risks', 'name inherent_score residual_score');
    res.status(201).json(populatedPlan);
  } else {
    res.status(400);
    throw new Error('Invalid BCM plan data');
  }
});

// @desc    Update BCM plan
// @route   PUT /api/bcm/:id
// @access  Private/SuperAdmin, BCMManager (or BCM Plan Owner)
const updateBCMPlan = asyncHandler(async (req, res) => {
  const { name, version, description, owner, status, last_updated_date, last_tested_date, next_test_date, recovery_time_objective, recovery_point_objective, responsible_parties, assets_covered, linked_risks, recovery_procedures, communication_plan, incident_response_plan_url } = req.body;

  const bcmPlan = await BCM.findById(req.params.id);

  if (!bcmPlan) {
    res.status(404);
    throw new Error('BCM Plan not found');
  }

  // Validate new owner if provided
  if (owner && !await User.findById(owner)) {
    res.status(400);
    throw new Error('Provided new owner user ID does not exist');
  }

  // Validate responsible parties if provided
  if (responsible_parties && responsible_parties.length > 0) {
    for (const party of responsible_parties) {
      if (party.user && !await User.findById(party.user)) {
        res.status(400);
        throw new Error('One or more responsible party user IDs not found');
      }
    }
  }

  // Validate linked assets if provided
  if (assets_covered && assets_covered.length > 0) {
    const assetsExist = await Asset.find({ '_id': { $in: assets_covered } });
    if (assetsExist.length !== assets_covered.length) {
      res.status(400);
      throw new Error('One or more linked assets not found');
    }
  }

  // Validate linked risks if provided
  if (linked_risks && linked_risks.length > 0) {
    const risksExist = await Risk.find({ '_id': { $in: linked_risks } });
    if (risksExist.length !== linked_risks.length) {
      res.status(400);
      throw new Error('One or more linked risks not found');
    }
  }

  bcmPlan.name = name !== undefined ? name : bcmPlan.name;
  bcmPlan.version = version !== undefined ? version : bcmPlan.version;
  bcmPlan.description = description !== undefined ? description : bcmPlan.description;
  bcmPlan.owner = owner !== undefined ? owner : bcmPlan.owner;
  bcmPlan.status = status !== undefined ? status : bcmPlan.status;
  bcmPlan.last_updated_date = last_updated_date !== undefined ? last_updated_date : bcmPlan.last_updated_date;
  bcmPlan.last_tested_date = last_tested_date !== undefined ? last_tested_date : bcmPlan.last_tested_date;
  bcmPlan.next_test_date = next_test_date !== undefined ? next_test_date : bcmPlan.next_test_date;
  bcmPlan.recovery_time_objective = recovery_time_objective !== undefined ? recovery_time_objective : bcmPlan.recovery_time_objective;
  bcmPlan.recovery_point_objective = recovery_point_objective !== undefined ? recovery_point_objective : bcmPlan.recovery_point_objective;
  bcmPlan.responsible_parties = responsible_parties !== undefined ? responsible_parties : bcmPlan.responsible_parties;
  bcmPlan.assets_covered = assets_covered !== undefined ? assets_covered : bcmPlan.assets_covered;
  bcmPlan.linked_risks = linked_risks !== undefined ? linked_risks : bcmPlan.linked_risks;
  bcmPlan.recovery_procedures = recovery_procedures !== undefined ? recovery_procedures : bcmPlan.recovery_procedures;
  bcmPlan.communication_plan = communication_plan !== undefined ? communication_plan : bcmPlan.communication_plan;
  bcmPlan.incident_response_plan_url = incident_response_plan_url !== undefined ? incident_response_plan_url : bcmPlan.incident_response_plan_url;


  const updatedBCMPlan = await bcmPlan.save();

  const populatedUpdatedPlan = await BCM.findById(updatedBCMPlan._id)
    .populate('owner', 'username email role')
    .populate('responsible_parties.user', 'username email')
    .populate('assets_covered', 'name type classification')
    .populate('linked_risks', 'name inherent_score residual_score');

  res.status(200).json(populatedUpdatedPlan);
});

// @desc    Delete BCM plan
// @route   DELETE /api/bcm/:id
// @access  Private/SuperAdmin, BCMManager
const deleteBCMPlan = asyncHandler(async (req, res) => {
  const bcmPlan = await BCM.findById(req.params.id);

  if (!bcmPlan) {
    res.status(404);
    throw new Error('BCM Plan not found');
  }

  await bcmPlan.deleteOne();

  res.status(200).json({ message: 'BCM Plan removed successfully', id: req.params.id });
});

module.exports = {
  getBCMPlans,
  getBCMPlanById,
  createBCMPlan,
  updateBCMPlan,
  deleteBCMPlan,
};
