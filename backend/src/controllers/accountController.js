const SocialAccount = require('../models/SocialAccount');

const VALID_PLATFORMS = ['instagram', 'facebook', 'twitter', 'linkedin'];

// ---------- @route   GET /api/accounts ----------
// ---------- @access  Private ----------
const getAccounts = async (req, res, next) => {
  try {
    const accounts = await SocialAccount.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      count: accounts.length,
      accounts: accounts.map((a) => a.toSafeObject()),
    });
  } catch (error) {
    next(error);
  }
};

// ---------- @route   POST /api/accounts/connect ----------
// ---------- @access  Private ----------
// Body: { platform, username, accessToken }
// In real OAuth, this endpoint would receive a code from the frontend
// and exchange it for a real token. Here we accept a mock token.
const connectAccount = async (req, res, next) => {
  try {
    const { platform, username, accessToken, accountId } = req.body;

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: `Platform must be one of: ${VALID_PLATFORMS.join(', ')}`,
      });
    }

    if (!username || !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'username and accessToken are required',
      });
    }

    // Upsert: one account per platform per user
    let account = await SocialAccount.findOne({
      user: req.user._id,
      platform,
    });

    if (account) {
      // Update existing
      account.username = username;
      account.accessToken = accessToken;
      account.accountId = accountId || account.accountId;
      account.connectedAt = new Date();
      await account.save();
    } else {
      // Create new
      account = await SocialAccount.create({
        user: req.user._id,
        platform,
        username,
        accessToken,
        accountId: accountId || '',
        connectedAt: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: `${platform} connected successfully`,
      account: account.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// ---------- @route   DELETE /api/accounts/:platform ----------
// ---------- @access  Private ----------
const disconnectAccount = async (req, res, next) => {
  try {
    const { platform } = req.params;

    if (!VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: `Platform must be one of: ${VALID_PLATFORMS.join(', ')}`,
      });
    }

    const result = await SocialAccount.findOneAndDelete({
      user: req.user._id,
      platform,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `No ${platform} account connected`,
      });
    }

    res.status(200).json({
      success: true,
      message: `${platform} disconnected successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccounts,
  connectAccount,
  disconnectAccount,
};