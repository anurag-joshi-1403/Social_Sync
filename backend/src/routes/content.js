const express = require('express');
const router = express.Router();
const { generate } = require('../controllers/contentController');
const { protect } = require('../middleware/auth');
const { contentLimiter } = require('../middleware/rateLimit');

// Protected — only logged-in users can generate content.
// The limiter runs after `protect` so it can key on the user id.
router.post('/generate', protect, contentLimiter, generate);

module.exports = router;