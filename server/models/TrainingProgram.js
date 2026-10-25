const mongoose = require('mongoose');

const trainingProgramSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    trainer: {
      type: String,
      required: [true, 'Trainer name is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    location: {
      type: String,
      trim: true,
    },
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    status: {
      type: String,
      enum: ['Upcoming', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
  },
  {
    timestamps: true,
  }
);

trainingProgramSchema.index({ status: 1 });
trainingProgramSchema.index({ startDate: 1 });

module.exports = mongoose.model('TrainingProgram', trainingProgramSchema);
