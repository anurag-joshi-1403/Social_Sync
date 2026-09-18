const Post = require('../models/Post');

// ---------- @route   POST /api/posts ----------
// ---------- @access  Private ----------
const createPost = async (req, res, next) => {
  try {
    const {
      content,
      hashtags,
      platform,
      tone,
      image,
      status,
      scheduledTime,
      aiGenerated,
    } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'Post content is required' });
    }

    if (!platform) {
      return res
        .status(400)
        .json({ success: false, message: 'Platform is required' });
    }

    // A new post can only start as a draft or a scheduled post; 'published'
    // and 'failed' are set by the publisher, never by the client.
    const requestedStatus = status || 'draft';
    if (!['draft', 'scheduled'].includes(requestedStatus)) {
      return res.status(400).json({
        success: false,
        message: "status must be either 'draft' or 'scheduled'",
      });
    }

    let parsedSchedule = null;
    if (status === 'scheduled') {
      if (!scheduledTime) {
        return res.status(400).json({
          success: false,
          message: 'scheduledTime is required when status is scheduled',
        });
      }
      parsedSchedule = new Date(scheduledTime);
      if (isNaN(parsedSchedule.getTime())) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid scheduledTime format' });
      }
      if (parsedSchedule <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'scheduledTime must be in the future',
        });
      }
    }

    const post = await Post.create({
      user: req.user._id,
      content: content.trim(),
      hashtags: hashtags || '',
      platform,
      tone: tone || 'casual',
      image: image || '',
      status: requestedStatus,
      scheduledTime: parsedSchedule,
      aiGenerated: Boolean(aiGenerated),
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- @route   GET /api/posts ----------
// ---------- @access  Private ----------
const getPosts = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.platform) filter.platform = req.query.platform;

    // `image` holds base64 payloads — excluded here so list views stay small.
    // Clients read the full image from GET /api/posts/:id when they need it.
    const posts = await Post.find(filter)
      .select('-image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- @route   GET /api/posts/stats ----------
// ---------- @access  Private ----------
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [total, scheduled, published, drafts, failed] = await Promise.all([
      Post.countDocuments({ user: userId }),
      Post.countDocuments({ user: userId, status: 'scheduled' }),
      Post.countDocuments({ user: userId, status: 'published' }),
      Post.countDocuments({ user: userId, status: 'draft' }),
      Post.countDocuments({ user: userId, status: 'failed' }),
    ]);

    res.status(200).json({
      success: true,
      stats: { total, scheduled, published, drafts, failed },
    });
  } catch (error) {
    next(error);
  }
};

// ---------- @route   GET /api/posts/:id ----------
// ---------- @access  Private ----------
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({ success: true, post });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }
    next(error);
  }
};

// ---------- @route   PUT /api/posts/:id ----------
// ---------- @access  Private ----------
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }

    // `status` is handled separately below and `engagement` is owned by the
    // publisher — neither may be set directly by a client.
    const allowed = [
      'content',
      'hashtags',
      'platform',
      'tone',
      'image',
      'scheduledTime',
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    // Only these transitions are a user's to make. Reaching 'published' or
    // 'failed' is the publisher's job, so both are rejected here.
    const ALLOWED_TRANSITIONS = {
      draft: ['draft', 'scheduled'],
      scheduled: ['scheduled', 'draft'],
      failed: ['failed', 'scheduled'],
      published: ['published'],
    };

    if (req.body.status !== undefined && req.body.status !== post.status) {
      const permitted = ALLOWED_TRANSITIONS[post.status] || [];
      if (!permitted.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status from '${post.status}' to '${req.body.status}'`,
        });
      }
      post.status = req.body.status;
    }

    if (post.status === 'scheduled') {
      if (!post.scheduledTime) {
        return res.status(400).json({
          success: false,
          message: 'scheduledTime required for scheduled posts',
        });
      }
      if (new Date(post.scheduledTime) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'scheduledTime must be in the future',
        });
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }
    next(error);
  }
};

// ---------- @route   DELETE /api/posts/:id ----------
// ---------- @access  Private ----------
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }
    next(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  getStats,
  getPostById,
  updatePost,
  deletePost,
};