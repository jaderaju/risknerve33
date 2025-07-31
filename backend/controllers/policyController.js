const asyncHandler = require('express-async-handler');
const Policy = require('../models/Policy');
const User = require('../models/User');
const Control = require('../models/Control');

// @desc    Get all policies
// @route   GET /api/policies
// @access  Private (all authenticated users can view, specific roles will manage)
const getPolicies = asyncHandler(async (req, res) => {
  const policies = await Policy.find({})
    .populate('owner', 'username email role department')
    .populate('approved_by', 'username')
    .populate('controls_linked', 'name description status')
    .populate('attestations.user', 'username email') // Populate user details in attestations
    .sort({ createdAt: -1 });
  res.status(200).json(policies);
});

// @desc    Get single policy by ID
// @route   GET /api/policies/:id
// @access  Private
const getPolicyById = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.params.id)
    .populate('owner', 'username email role department')
    .populate('approved_by', 'username')
    .populate('controls_linked', 'name description status')
    .populate('attestations.user', 'username email');

  if (!policy) {
    res.status(404);
    throw new Error('Policy not found');
  }

  res.status(200).json(policy);
});

// @desc    Create new policy
// @route   POST /api/policies
// @access  Private/SuperAdmin, ComplianceOfficer
const createPolicy = asyncHandler(async (req, res) => {
  const { title, version, content_url, owner, next_review_date, audience_groups, controls_linked, attestation_frequency_days } = req.body;

  if (!title || !version || !content_url || !owner || !next_review_date) {
    res.status(400);
    throw new Error('Please include all required fields: title, version, content_url, owner, next_review_date');
  }

  // Validate owner
  const ownerExists = await User.findById(owner);
  if (!ownerExists) {
    res.status(400);
    throw new Error('Provided owner user ID does not exist');
  }

  // Validate linked controls
  if (controls_linked && controls_linked.length > 0) {
    const controlsExist = await Control.find({ '_id': { $in: controls_linked } });
    if (controlsExist.length !== controls_linked.length) {
      res.status(400);
      throw new Error('One or more linked controls not found');
    }
  }

  const policy = await Policy.create({
    title,
    version,
    content_url,
    owner,
    status: 'Draft', // New policies start as Draft
    last_review_date: new Date(),
    next_review_date,
    audience_groups,
    controls_linked,
    attestation_frequency_days,
  });

  if (policy) {
    const populatedPolicy = await Policy.findById(policy._id)
      .populate('owner', 'username email role department')
      .populate('controls_linked', 'name description status');
    res.status(201).json(populatedPolicy);
  } else {
    res.status(400);
    throw new Error('Invalid policy data');
  }
});

// @desc    Update policy
// @route   PUT /api/policies/:id
// @access  Private/SuperAdmin, ComplianceOfficer (or Policy Owner)
const updatePolicy = asyncHandler(async (req, res) => {
  const { title, version, content_url, owner, status, last_review_date, next_review_date, approval_date, approved_by, audience_groups, controls_linked, attestation_frequency_days } = req.body;

  const policy = await Policy.findById(req.params.id);

  if (!policy) {
    res.status(404);
    throw new Error('Policy not found');
  }

  // Validate new owner if provided
  if (owner && !await User.findById(owner)) {
    res.status(400);
    throw new Error('Provided new owner user ID does not exist');
  }
  // Validate approved_by if provided
  if (approved_by && !await User.findById(approved_by)) {
    res.status(400);
    throw new Error('Provided approved_by user ID does not exist');
  }

  // Validate linked controls if provided
  if (controls_linked && controls_linked.length > 0) {
    const controlsExist = await Control.find({ '_id': { $in: controls_linked } });
    if (controlsExist.length !== controls_linked.length) {
      res.status(400);
      throw new Error('One or more linked controls not found');
    }
  }

  policy.title = title !== undefined ? title : policy.title;
  policy.version = version !== undefined ? version : policy.version;
  policy.content_url = content_url !== undefined ? content_url : policy.content_url;
  policy.owner = owner !== undefined ? owner : policy.owner;
  policy.status = status !== undefined ? status : policy.status;
  policy.last_review_date = last_review_date !== undefined ? last_review_date : policy.last_review_date;
  policy.next_review_date = next_review_date !== undefined ? next_review_date : policy.next_review_date;
  policy.approval_date = approval_date !== undefined ? approval_date : policy.approval_date;
  policy.approved_by = approved_by !== undefined ? approved_by : policy.approved_by;
  policy.audience_groups = audience_groups !== undefined ? audience_groups : policy.audience_groups;
  policy.controls_linked = controls_linked !== undefined ? controls_linked : policy.controls_linked;
  policy.attestation_frequency_days = attestation_frequency_days !== undefined ? attestation_frequency_days : policy.attestation_frequency_days;


  const updatedPolicy = await policy.save();

  const populatedUpdatedPolicy = await Policy.findById(updatedPolicy._id)
    .populate('owner', 'username email role department')
    .populate('approved_by', 'username')
    .populate('controls_linked', 'name description status')
    .populate('attestations.user', 'username email');

  res.status(200).json(populatedUpdatedPolicy);
});

// @desc    Delete policy
// @route   DELETE /api/policies/:id
// @access  Private/SuperAdmin, ComplianceOfficer
const deletePolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.params.id);

  if (!policy) {
    res.status(404);
    throw new Error('Policy not found');
  }

  await policy.deleteOne();

  res.status(200).json({ message: 'Policy removed successfully', id: req.params.id });
});


// @desc    User attests to a policy
// @route   POST /api/policies/:id/attest
// @access  Private (any authenticated user can attest to policies)
const attestToPolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.params.id);

  if (!policy) {
    res.status(404);
    throw new Error('Policy not found');
  }

  const userId = req.user._id; // User ID from the protect middleware

  // Check if user has already attested recently
  const existingAttestationIndex = policy.attestations.findIndex(
    (att) => att.user.toString() === userId.toString() &&
             (new Date() - att.attested_at) / (1000 * 60 * 60 * 24) < policy.attestation_frequency_days
  );

  if (existingAttestationIndex !== -1) {
    // Update existing attestation
    policy.attestations[existingAttestationIndex].attested_at = new Date();
    policy.attestations[existingAttestationIndex].is_attested = true;
    const updatedPolicy = await policy.save();
    res.status(200).json({ message: 'Policy re-attested successfully', policy: updatedPolicy });
  } else {
    // Add new attestation
    policy.attestations.push({
      user: userId,
      attested_at: new Date(),
      is_attested: true,
    });
    const updatedPolicy = await policy.save();
    res.status(200).json({ message: 'Policy attested successfully', policy: updatedPolicy });
  }
});


module.exports = {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  attestToPolicy,
};
