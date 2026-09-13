const express = require('express');
const router = express.Router();
const { generate } = require('../controllers/contentController');
const { protect } = require('../middleware/auth');

// Protected — only logged-in users can generate content
router.post('/generate', protect, generate);

module.exports = router;