const mongoose = require('mongoose');

const auditSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an audit name'],
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['Internal', 'External', 'Compliance', 'Financial', 'Operational', 'IT'],
      default: 'Internal',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    scope: {
      type: String,
      required: [true, 'Please define the audit scope'],
      trim: true,
      maxlength: 2000,
    },
    lead_auditor: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please assign a lead auditor'],
      ref: 'User',
    },
    audit_team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Planned', 'In Progress', 'Fieldwork', 'Reporting', 'Closed', 'Cancelled'],
      default: 'Planned',
    },
    planned_start_date: {
      type: Date,
      required: [true, 'Please add a planned start date'],
    },
    planned_end_date: {
      type: Date,
      required: [true, 'Please add a planned end date'],
    },
    actual_start_date: {
      type: Date,
    },
    actual_end_date: {
      type: Date,
    },
    findings: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low', 'Observation'], default: 'Medium' },
        recommendation: { type: String },
        status: { type: String, enum: ['Open', 'In Progress', 'Remediated', 'Closed'], default: 'Open' },
        assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        due_date: { type: Date },
        closed_date: { type: Date },
        linked_controls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Control' }],
        linked_risks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Risk' }],
        evidence_linked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' }],
      },
    ],
    report_url: { // Path to the final audit report PDF
      type: String,
      trim: true,
    },
    rsm_updated: { // Record of Controls Matrix (RCM) update status
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Audit', auditSchema);
