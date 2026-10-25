const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['General', 'HR Updates', 'Events', 'Important Notices'],
      default: 'General',
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetDepartment: {
      type: String,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ isArchived: 1, publishedAt: -1 });
announcementSchema.index({ category: 1 });
announcementSchema.index({ targetDepartment: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
