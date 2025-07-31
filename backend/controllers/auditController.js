const asyncHandler = require('express-async-handler');
const Audit = require('../models/Audit');
const User = require('../models/User');
const Control = require('../models/Control');
const Risk = require('../models/Risk');
const Evidence = require('../models/Evidence');

// @desc    Get all audits
// @route   GET /api/audits
// @access  Private (e.g., all authenticated users can view, AuditManagers will manage)
const getAudits = asyncHandler(async (req, res) => {
  const audits = await Audit.find({})
    .populate('lead_auditor', 'username email role')
    .populate('audit_team', 'username email')
    .populate('findings.assigned_to', 'username email')
    .populate('findings.linked_controls', 'name')
    .populate('findings.linked_risks', 'name')
    .populate('findings.evidence_linked', 'title file_name')
    .sort({ planned_start_date: -1 });
  res.status(200).json(audits);
});

// @desc    Get single audit by ID
// @route   GET /api/audits/:id
// @access  Private
const getAuditById = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id)
    .populate('lead_auditor', 'username email role')
    .populate('audit_team', 'username email')
    .populate('findings.assigned_to', 'username email')
    .populate('findings.linked_controls', 'name')
    .populate('findings.linked_risks', 'name')
    .populate('findings.evidence_linked', 'title file_name');

  if (!audit) {
    res.status(404);
    throw new Error('Audit not found');
  }

  res.status(200).json(audit);
});

// @desc    Create new audit
// @route   POST /api/audits
// @access  Private/SuperAdmin, AuditManager
const createAudit = asyncHandler(async (req, res) => {
  const { name, type, description, scope, lead_auditor, audit_team, planned_start_date, planned_end_date, findings } = req.body;

  if (!name || !scope || !lead_auditor || !planned_start_date || !planned_end_date) {
    res.status(400);
    throw new Error('Please include all required fields: name, scope, lead_auditor, planned_start_date, planned_end_date');
  }

  // Validate lead auditor
  const leadAuditorExists = await User.findById(lead_auditor);
  if (!leadAuditorExists) {
    res.status(400);
    throw new Error('Provided lead auditor user ID does not exist');
  }

  // Validate audit team members
  if (audit_team && audit_team.length > 0) {
    const teamMembersExist = await User.find({ '_id': { $in: audit_team } });
    if (teamMembersExist.length !== audit_team.length) {
      res.status(400);
      throw new Error('One or more audit team member user IDs not found');
    }
  }

  // Validate linked entities within findings (e.g., controls, risks, evidence)
  if (findings && findings.length > 0) {
    for (const finding of findings) {
      if (finding.linked_controls && finding.linked_controls.length > 0) {
        const controlsExist = await Control.find({ '_id': { $in: finding.linked_controls } });
        if (controlsExist.length !== finding.linked_controls.length) {
          res.status(400);
          throw new Error('One or more linked controls in a finding not found');
        }
      }
      if (finding.linked_risks && finding.linked_risks.length > 0) {
        const risksExist = await Risk.find({ '_id': { $in: finding.linked_risks } });
        if (risksExist.length !== finding.linked_risks.length) {
          res.status(400);
          throw new Error('One or more linked risks in a finding not found');
        }
      }
      if (finding.evidence_linked && finding.evidence_linked.length > 0) {
        const evidenceExist = await Evidence.find({ '_id': { $in: finding.evidence_linked } });
        if (evidenceExist.length !== finding.evidence_linked.length) {
          res.status(400);
          throw new Error('One or more linked evidence in a finding not found');
        }
      }
    }
  }


  const audit = await Audit.create({
    name,
    type,
    description,
    scope,
    lead_auditor,
    audit_team,
    status: 'Planned', // New audits start as Planned
    planned_start_date,
    planned_end_date,
    findings,
  });

  if (audit) {
    const populatedAudit = await Audit.findById(audit._id)
      .populate('lead_auditor', 'username email role')
      .populate('audit_team', 'username email')
      .populate('findings.assigned_to', 'username email')
      .populate('findings.linked_controls', 'name')
      .populate('findings.linked_risks', 'name')
      .populate('findings.evidence_linked', 'title file_name');
    res.status(201).json(populatedAudit);
  } else {
    res.status(400);
    throw new Error('Invalid audit data');
  }
});

// @desc    Update audit
// @route   PUT /api/audits/:id
// @access  Private/SuperAdmin, AuditManager
const updateAudit = asyncHandler(async (req, res) => {
  const { name, type, description, scope, lead_auditor, audit_team, status, planned_start_date, planned_end_date, actual_start_date, actual_end_date, findings, report_url, rsm_updated } = req.body;

  const audit = await Audit.findById(req.params.id);

  if (!audit) {
    res.status(404);
    throw new Error('Audit not found');
  }

  // Validate new lead auditor if provided
  if (lead_auditor && !await User.findById(lead_auditor)) {
    res.status(400);
    throw new Error('Provided new lead auditor user ID does not exist');
  }

  // Validate audit team members if provided
  if (audit_team && audit_team.length > 0) {
    const teamMembersExist = await User.find({ '_id': { $in: audit_team } });
    if (teamMembersExist.length !== audit_team.length) {
      res.status(400);
      throw new Error('One or more audit team member user IDs not found');
    }
  }

  // Validate linked entities within findings if provided
  if (findings && findings.length > 0) {
    for (const finding of findings) {
      if (finding.assigned_to && !await User.findById(finding.assigned_to)) {
        res.status(400);
        throw new Error('One or more finding assigned_to user IDs not found');
      }
      if (finding.linked_controls && finding.linked_controls.length > 0) {
        const controlsExist = await Control.find({ '_id': { $in: finding.linked_controls } });
        if (controlsExist.length !== finding.linked_controls.length) {
          res.status(400);
          throw new Error('One or more linked controls in a finding not found');
        }
      }
      if (finding.linked_risks && finding.linked_risks.length > 0) {
        const risksExist = await Risk.find({ '_id': { $in: finding.linked_risks } });
        if (risksExist.length !== finding.linked_risks.length) {
          res.status(400);
          throw new Error('One or more linked risks in a finding not found');
        }
      }
      if (finding.evidence_linked && finding.evidence_linked.length > 0) {
        const evidenceExist = await Evidence.find({ '_id': { $in: finding.evidence_linked } });
        if (evidenceExist.length !== finding.evidence_linked.length) {
          res.status(400);
          throw new Error('One or more linked evidence in a finding not found');
        }
      }
    }
  }

  audit.name = name !== undefined ? name : audit.name;
  audit.type = type !== undefined ? type : audit.type;
  audit.description = description !== undefined ? description : audit.description;
  audit.scope = scope !== undefined ? scope : audit.scope;
  audit.lead_auditor = lead_auditor !== undefined ? lead_auditor : audit.lead_auditor;
  audit.audit_team = audit_team !== undefined ? audit_team : audit.audit_team;
  audit.status = status !== undefined ? status : audit.status;
  audit.planned_start_date = planned_start_date !== undefined ? planned_start_date : audit.planned_start_date;
  audit.planned_end_date = planned_end_date !== undefined ? planned_end_date : audit.planned_end_date;
  audit.actual_start_date = actual_start_date !== undefined ? actual_start_date : audit.actual_start_date;
  audit.actual_end_date = actual_end_date !== undefined ? actual_end_date : audit.actual_end_date;
  audit.findings = findings !== undefined ? findings : audit.findings;
  audit.report_url = report_url !== undefined ? report_url : audit.report_url;
  audit.rsm_updated = rsm_updated !== undefined ? rsm_updated : audit.rsm_updated;

  const updatedAudit = await audit.save();

  const populatedUpdatedAudit = await Audit.findById(updatedAudit._id)
    .populate('lead_auditor', 'username email role')
    .populate('audit_team', 'username email')
    .populate('findings.assigned_to', 'username email')
    .populate('findings.linked_controls', 'name')
    .populate('findings.linked_risks', 'name')
    .populate('findings.evidence_linked', 'title file_name');

  res.status(200).json(populatedUpdatedAudit);
});

// @desc    Delete audit
// @route   DELETE /api/audits/:id
// @access  Private/SuperAdmin, AuditManager
const deleteAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);

  if (!audit) {
    res.status(404);
    throw new Error('Audit not found');
  }

  await audit.deleteOne();

  res.status(200).json({ message: 'Audit removed successfully', id: req.params.id });
});

module.exports = {
  getAudits,
  getAuditById,
  createAudit,
  updateAudit,
  deleteAudit,
};
