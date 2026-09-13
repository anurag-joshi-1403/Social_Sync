const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getStats,
  getPostById,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// All post routes require authentication
router.use(protect);

// IMPORTANT: /stats must be BEFORE /:id
router.get('/stats', getStats);

router.route('/')
  .get(getPosts)
  .post(createPost);

router.route('/:id')
  .get(getPostById)
  .put(updatePost)
  .delete(deletePost);

module.exports = router;