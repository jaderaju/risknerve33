const mongoose = require('mongoose');

const assetSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an asset name'],
      unique: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ['System', 'Application', 'Database', 'Network Device', 'Physical Asset', 'Information Asset', 'Other'],
      default: 'System',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please assign an asset owner'],
      ref: 'User',
    },
    classification: {
      type: String,
      enum: ['Confidential', 'Restricted', 'Internal', 'Public'],
      default: 'Internal',
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ['Active', 'Decommissioned', 'Under Maintenance'],
      default: 'Active',
    },
    tags: {
      type: [String], // Array of strings for flexible categorization
      default: [],
    },
    last_review_date: {
      type: Date,
    },
    // Optional: Fields for integration with CMDB
    cmdb_id: {
      type: String,
      unique: true, // Assuming CMDB IDs are unique
      sparse: true, // Allows null values but enforces uniqueness for non-null values
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Asset', assetSchema);
