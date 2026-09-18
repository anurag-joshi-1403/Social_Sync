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
      type: String, // base64 data URL or remote URL
      default: '',
      // ~2MB of base64 ≈ 2.8M characters. Keeps a single document well clear
      // of MongoDB's 16MB ceiling and matches the express.json body limit.
      maxlength: [2_800_000, 'Image is too large (2MB maximum)'],
    },
    // Lets list endpoints project `image` out while the UI still knows whether
    // to show a thumbnail placeholder.
    hasImage: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      // 'publishing' is a short-lived lock the scheduler claims a post with.
      enum: ['draft', 'scheduled', 'publishing', 'published', 'failed'],
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

// Keep `hasImage` in step with `image` however the document was modified.
postSchema.pre('save', function (next) {
  if (this.isModified('image')) {
    this.hasImage = Boolean(this.image);
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);