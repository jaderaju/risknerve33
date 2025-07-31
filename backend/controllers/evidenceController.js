const asyncHandler = require('express-async-handler');
const Evidence = require('../models/Evidence');
const User = require('../models/User');
const Control = require('../models/Control');
const Audit = require('../models/Audit');
const Risk = require('../models/Risk');

// @desc    Get all evidence
// @route   GET /api/evidence
// @access  Private (all authenticated users can view, specific roles will manage)
const getAllEvidence = asyncHandler(async (req, res) => {
  const evidence = await Evidence.find({})
    .populate('uploaded_by', 'username email role')
    .populate('reviewed_by', 'username email')
    .populate('linked_controls', 'name description')
    .populate('linked_audits', 'name type')
    .populate('linked_risks', 'name inherent_score')
    .sort({ upload_date: -1 });
  res.status(200).json(evidence);
});

// @desc    Get single evidence by ID
// @route   GET /api/evidence/:id
// @access  Private
const getEvidenceById = asyncHandler(async (req, res) => {
  const evidence = await Evidence.findById(req.params.id)
    .populate('uploaded_by', 'username email role')
    .populate('reviewed_by', 'username email')
    .populate('linked_controls', 'name description')
    .populate('linked_audits', 'name type')
    .populate('linked_risks', 'name inherent_score');

  if (!evidence) {
    res.status(404);
    throw new Error('Evidence not found');
  }

  res.status(200).json(evidence);
});

// @desc    Create new evidence
// @route   POST /api/evidence
// @access  Private (any authenticated user can upload, but roles manage review)
const createEvidence = asyncHandler(async (req, res) => {
  const { title, description, file_name, file_path, file_mime_type, linked_controls, linked_audits, linked_risks, tags, expiration_date } = req.body;

  // For actual file uploads, 'file_name', 'file_path', 'file_mime_type' would come from `req.file` after using `multer`
  // and handling storage (e.g., S3 upload, local server path).
  // For now, we assume these are passed in the body.
  if (!title || !file_name || !file_path) {
    res.status(400);
    throw new Error('Please include all required fields: title, file_name, file_path');
  }

  // Validate linked entities if provided
  if (linked_controls && linked_controls.length > 0) {
    const controlsExist = await Control.find({ '_id': { $in: linked_controls } });
    if (controlsExist.length !== linked_controls.length) {
      res.status(400);
      throw new Error('One or more linked controls not found');
    }
  }
  if (linked_audits && linked_audits.length > 0) {
    const auditsExist = await Audit.find({ '_id': { $in: linked_audits } });
    if (auditsExist.length !== linked_audits.length) {
      res.status(400);
      throw new Error('One or more linked audits not found');
    }
  }
  if (linked_risks && linked_risks.length > 0) {
    const risksExist = await Risk.find({ '_id': { $in: linked_risks } });
    if (risksExist.length !== linked_risks.length) {
      res.status(400);
      throw new Error('One or more linked risks not found');
    }
  }

  const evidence = await Evidence.create({
    title,
    description,
    file_name,
    file_path,
    file_mime_type,
    uploaded_by: req.user._id, // User uploading the evidence is the logged-in user
    upload_date: new Date(),
    status: 'Pending Review', // New evidence starts as pending review
    linked_controls,
    linked_audits,
    linked_risks,
    tags,
    expiration_date,
  });

  if (evidence) {
    const populatedEvidence = await Evidence.findById(evidence._id)
      .populate('uploaded_by', 'username email role')
      .populate('linked_controls', 'name description')
      .populate('linked_audits', 'name type')
      .populate('linked_risks', 'name inherent_score');
    res.status(201).json(populatedEvidence);
  } else {
    res.status(400);
    throw new Error('Invalid evidence data');
  }
});

// @desc    Update evidence (e.g., status, links, review comments)
// @route   PUT /api/evidence/:id
// @access  Private/SuperAdmin, AuditManager, ComplianceOfficer (for reviewing)
const updateEvidence = asyncHandler(async (req, res) => {
  const { title, description, status, reviewed_by, review_comments, linked_controls, linked_audits, linked_risks, tags, expiration_date } = req.body;

  const evidence = await Evidence.findById(req.params.id);

  if (!evidence) {
    res.status(404);
    throw new Error('Evidence not found');
  }

  // Only allow specific roles (or the uploader) to update certain fields, for review flow
  // For simplicity, we are handling update by specific roles here, not general users.
  // The `file_path` and `file_name` generally should NOT be updated directly via PUT here,
  // as it would imply a new file upload which should be a separate process (or versioning).

  // Validate new reviewer if provided
  if (reviewed_by && !await User.findById(reviewed_by)) {
    res.status(400);
    throw new Error('Provided reviewer user ID does not exist');
  }

  // Validate linked entities if provided
  if (linked_controls && linked_controls.length > 0) {
    const controlsExist = await Control.find({ '_id': { $in: linked_controls } });
    if (controlsExist.length !== linked_controls.length) {
      res.status(400);
      throw new Error('One or more linked controls not found');
    }
  }
  if (linked_audits && linked_audits.length > 0) {
    const auditsExist = await Audit.find({ '_id': { $in: linked_audits } });
    if (auditsExist.length !== linked_audits.length) {
      res.status(400);
      throw new Error('One or more linked audits not found');
    }
  }
  if (linked_risks && linked_risks.length > 0) {
    const risksExist = await Risk.find({ '_id': { $in: linked_risks } });
    if (risksExist.length !== linked_risks.length) {
      res.status(400);
      throw new Error('One or more linked risks not found');
    }
  }

  evidence.title = title !== undefined ? title : evidence.title;
  evidence.description = description !== undefined ? description : evidence.description;
  evidence.status = status !== undefined ? status : evidence.status;
  evidence.reviewed_by = reviewed_by !== undefined ? reviewed_by : evidence.reviewed_by;
  evidence.review_comments = review_comments !== undefined ? review_comments : evidence.review_comments;
  evidence.linked_controls = linked_controls !== undefined ? linked_controls : evidence.linked_controls;
  evidence.linked_audits = linked_audits !== undefined ? linked_audits : evidence.linked_audits;
  evidence.linked_risks = linked_risks !== undefined ? linked_risks : evidence.linked_risks;
  evidence.tags = tags !== undefined ? tags : evidence.tags;
  evidence.expiration_date = expiration_date !== undefined ? expiration_date : evidence.expiration_date;

  // If status is changed to Approved/Rejected, update review_date
  if (status && ['Approved', 'Rejected'].includes(status) && !evidence.review_date) {
    evidence.review_date = new Date();
  }
  // If a reviewer is explicitly set or changed, set review_date if not already set
  if (reviewed_by && !evidence.review_date) {
    evidence.review_date = new Date();
  }


  const updatedEvidence = await evidence.save();

  const populatedUpdatedEvidence = await Evidence.findById(updatedEvidence._id)
    .populate('uploaded_by', 'username email role')
    .populate('reviewed_by', 'username email')
    .populate('linked_controls', 'name description')
    .populate('linked_audits', 'name type')
    .populate('linked_risks', 'name inherent_score');

  res.status(200).json(populatedUpdatedEvidence);
});

// @desc    Delete evidence
// @route   DELETE /api/evidence/:id
// @access  Private/SuperAdmin, AuditManager, ComplianceOfficer
const deleteEvidence = asyncHandler(async (req, res) => {
  const evidence = await Evidence.findById(req.params.id);

  if (!evidence) {
    res.status(404);
    throw new Error('Evidence not found');
  }

  // TODO: Implement file deletion from storage here if applicable
  // fs.unlinkSync(evidence.file_path); // Example for local storage, be careful!

  await evidence.deleteOne();

  res.status(200).json({ message: 'Evidence removed successfully', id: req.params.id });
});

module.exports = {
  getAllEvidence,
  getEvidenceById,
  createEvidence,
  updateEvidence,
  deleteEvidence,
};
