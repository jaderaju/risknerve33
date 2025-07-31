const mongoose = require('mongoose');

const controlSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a control name'],
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      required: [true, 'Please add a control description'],
      trim: true,
      maxlength: 2000,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please assign a control owner'],
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Implemented', 'Partially Implemented', 'Not Implemented', 'Under Review', 'Deficient'],
      default: 'Not Implemented',
    },
    effectiveness_score: {
      type: Number, // e.g., from 0-100% or 1-5 scale
      min: 0,
      max: 100,
      default: 0,
    },
    last_tested_date: {
      type: Date,
    },
    next_test_date: {
      type: Date,
    },
    frameworks_mapped: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Framework', // We'll define Framework next
      },
    ],
    risks_mitigated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Risk',
      },
    ],
    // Audit steps for this control
    audit_steps: [
      {
        step: { type: String, required: true },
        description: { type: String },
        expected_evidence: { type: String }, // e.g., "Configuration screenshot", "Policy document"
      },
    ],
    // Implementation evidence tasks
    implementation_evidence: [
      {
        task: { type: String, required: true },
        due_date: { type: Date },
        status: { type: String, enum: ['Open', 'In Progress', 'Completed', 'Overdue'], default: 'Open' },
        assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        completed_date: { type: Date },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Control', controlSchema);
