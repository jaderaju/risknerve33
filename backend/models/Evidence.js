const mongoose = require('mongoose');

const evidenceSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an evidence title'],
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    file_name: { // Original file name
      type: String,
      required: [true, 'Please provide the file name'],
      trim: true,
    },
    file_path: { // Path where the file is stored (e.g., /uploads/evidence/...)
      type: String,
      required: [true, 'Please provide the file path'],
      trim: true,
    },
    file_mime_type: { // e.g., application/pdf, image/jpeg
      type: String,
      trim: true,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please specify who uploaded this evidence'],
      ref: 'User',
    },
    upload_date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Approved', 'Rejected', 'Expired'],
      default: 'Pending Review',
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    review_date: {
      type: Date,
    },
    review_comments: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    version: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String], // e.g., ["screenshot", "policy", "log"]
      default: [],
    },
    linked_controls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Control',
      },
    ],
    linked_audits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Audit', // We'll define Audit next
      },
    ],
    linked_risks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Risk',
      },
    ],
    expiration_date: {
      type: Date, // When the evidence might no longer be valid (e.g., annual reports)
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Evidence', evidenceSchema);
