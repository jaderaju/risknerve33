const mongoose = require('mongoose');

const bcmSchema = mongoose.Schema(
  {
    plan_name: {
      type: String,
      required: [true, 'Please add a BCM plan name'],
      unique: true,
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please assign a BCM plan owner'],
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Draft', 'Under Review', 'Approved', 'Active', 'Archived', 'Exercised'],
      default: 'Draft',
    },
    last_review_date: {
      type: Date,
    },
    next_review_date: {
      type: Date,
    },
    version: {
      type: String,
      default: '1.0',
      trim: true,
      maxlength: 50,
    },
    criticality_score: {
      type: Number, // e.g., 1 (Low) to 5 (Critical)
      min: 1,
      max: 5,
    },
    rto: { // Recovery Time Objective (in hours/days)
      type: String,
      trim: true,
      maxlength: 100,
    },
    rpo: { // Recovery Point Objective (in hours/days)
      type: String,
      trim: true,
      maxlength: 100,
    },
    dependencies: {
      type: [String], // List of dependent systems/processes
      default: [],
    },
    test_results: [
      {
        test_date: { type: Date, required: true },
        test_type: { type: String, enum: ['Tabletop', 'Functional', 'Full-Scale'], default: 'Tabletop' },
        outcome: { type: String, enum: ['Pass', 'Fail', 'Partial Pass'], required: true },
        comments: { type: String, maxlength: 1000 },
        tested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    related_assets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
      },
    ],
    related_risks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Risk',
      },
    ],
    document_url: { // Link to the actual BCM document (PDF, etc.)
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BCM', bcmSchema);
