const mongoose = require('mongoose');

const riskSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a risk name'],
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ['Cybersecurity', 'Operational', 'Financial', 'Compliance', 'Strategic', 'Reputational', 'Other'],
      default: 'Operational',
    },
    impact: {
      type: Number,
      required: [true, 'Please add an impact score'],
      min: 1,
      max: 5, // e.g., 1 (Very Low) to 5 (Very High)
    },
    likelihood: {
      type: Number,
      required: [true, 'Please add a likelihood score'],
      min: 1,
      max: 5, // e.g., 1 (Very Low) to 5 (Very High)
    },
    inherent_score: {
      type: Number, // Calculated: impact * likelihood
      default: 0,
    },
    residual_score: {
      type: Number, // Calculated after controls/mitigation
      default: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please assign a risk owner'],
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Open', 'Mitigated', 'Accepted', 'Transferred', 'Closed', 'Under Review'],
      default: 'Open',
    },
    treatment_plan: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    mitigation_tasks: [
      {
        task: { type: String, required: true },
        due_date: { type: Date },
        status: { type: String, enum: ['Open', 'In Progress', 'Completed', 'Overdue'], default: 'Open' },
        assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        completed_date: { type: Date },
      },
    ],
    assets_linked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
      },
    ],
    controls_linked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Control', // We'll define Control next
      },
    ],
    last_review_date: {
      type: Date,
    },
    next_review_date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate inherent score
riskSchema.pre('save', function (next) {
  if (this.isModified('impact') || this.isModified('likelihood')) {
    this.inherent_score = this.impact * this.likelihood;
    // For simplicity, let's assume residual_score is initially inherent_score until controls are linked/assessed
    if (!this.residual_score || this.residual_score === 0) { // Only set if not already manually set
      this.residual_score = this.inherent_score;
    }
  }
  next();
});

module.exports = mongoose.model('Risk', riskSchema);
