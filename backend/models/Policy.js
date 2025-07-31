const mongoose = require('mongoose');

const policySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a policy title'],
      trim: true,
      maxlength: 500,
    },
    version: {
      type: String,
      required: [true, 'Please add a policy version'],
      trim: true,
      maxlength: 50,
    },
    content_url: { // Or path to file storage
      type: String,
      required: [true, 'Please provide content for the policy'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please assign a policy owner'],
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Draft', 'Under Review', 'Approved', 'Published', 'Archived', 'Superseded'],
      default: 'Draft',
    },
    last_review_date: {
      type: Date,
    },
    next_review_date: {
      type: Date,
      required: [true, 'Please set a next review date'],
    },
    approval_date: {
      type: Date,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    audience_groups: {
      type: [String], // e.g., ["All Employees", "IT Department", "Management"]
      default: [],
    },
    controls_linked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Control',
      },
    ],
    // Policy attestation tracking
    attestations: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        attested_at: { type: Date, default: Date.now },
        is_attested: { type: Boolean, default: false },
      },
    ],
    attestation_frequency_days: { // How often users need to re-attest
      type: Number,
      default: 365, // Default to annually
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Policy', policySchema);
