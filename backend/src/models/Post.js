const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [2200, 'Post content too long'], // Twitter's limit
    },
    hashtags: {
      type: String,
      default: '',
    },
    platform: {
      type: String,
      required: true,
      enum: ['instagram', 'facebook', 'twitter', 'linkedin'],
    },
    tone: {
      type: String,
      enum: ['casual', 'professional', 'promotional', 'inspirational', 'humorous'],
      default: 'casual',
    },
    image: {
      type: String, // base64 or URL
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'failed'],
      default: 'draft',
      index: true,
    },
    scheduledTime: {
      type: Date,
      default: null,
      index: true,
    },
    publishedTime: {
      type: Date,
      default: null,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
    },
    failureReason: {
      type: String,
      default: '',
    },
    platformPostId: {
      type: String, // ID returned by platform after publishing
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index for scheduler: find due posts fast
postSchema.index({ status: 1, scheduledTime: 1 });

module.exports = mongoose.model('Post', postSchema);