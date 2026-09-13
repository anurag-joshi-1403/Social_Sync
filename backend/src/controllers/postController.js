const Post = require('../models/Post');

// ---------- @route   POST /api/posts ----------
// ---------- @access  Private ----------
const createPost = async (req, res) => {
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
      status: status || 'draft',
      scheduledTime: parsedSchedule,
      aiGenerated: Boolean(aiGenerated),
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    console.error('createPost error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- @route   GET /api/posts ----------
// ---------- @access  Private ----------
const getPosts = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.platform) filter.platform = req.query.platform;

    const posts = await Post.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error('getPosts error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- @route   GET /api/posts/stats ----------
// ---------- @access  Private ----------
const getStats = async (req, res) => {
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
    console.error('getStats error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- @route   GET /api/posts/:id ----------
// ---------- @access  Private ----------
const getPostById = async (req, res) => {
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
    console.error('getPostById error:', error.message);
    if (error.kind === 'ObjectId') {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- @route   PUT /api/posts/:id ----------
// ---------- @access  Private ----------
const updatePost = async (req, res) => {
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

    const allowed = [
      'content',
      'hashtags',
      'platform',
      'tone',
      'image',
      'status',
      'scheduledTime',
      'engagement',
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

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
    console.error('updatePost error:', error.message);
    if (error.kind === 'ObjectId') {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- @route   DELETE /api/posts/:id ----------
// ---------- @access  Private ----------
const deletePost = async (req, res) => {
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
    console.error('deletePost error:', error.message);
    if (error.kind === 'ObjectId') {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }
    res.status(500).json({ success: false, message: error.message });
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