const mongoose = require('mongoose');

const frameworkSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a framework name'],
      unique: true,
      trim: true,
      maxlength: 200,
    },
    version: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ['Regulatory', 'Industry Standard', 'Internal'],
      default: 'Industry Standard',
    },
    source: {
      type: String, // e.g., "ISO", "NIST", "Local Government"
      trim: true,
      maxlength: 100,
    },
    compliance_requirements: {
      type: String, // General text describing requirements
      trim: true,
      maxlength: 2000,
    },
    controls_mapped: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Control',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Framework', frameworkSchema);
