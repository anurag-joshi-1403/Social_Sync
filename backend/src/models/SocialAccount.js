const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ['instagram', 'facebook', 'twitter', 'linkedin'],
    },
    username: {
      type: String,
      required: true,
    },
    accountId: {
      type: String, // platform-side user/page id
      default: '',
    },
    accessToken: {
      type: String,
      required: true,
      // In production, encrypt this at rest
    },
    refreshToken: {
      type: String,
      default: '',
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One account per platform per user
socialAccountSchema.index({ user: 1, platform: 1 }, { unique: true });

// Never expose tokens in API responses
socialAccountSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    platform: this.platform,
    username: this.username,
    accountId: this.accountId,
    connectedAt: this.connectedAt,
  };
};

module.exports = mongoose.model('SocialAccount', socialAccountSchema);