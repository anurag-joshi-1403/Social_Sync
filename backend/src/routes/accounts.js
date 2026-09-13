const express = require('express');
const router = express.Router();
const {
  getAccounts,
  connectAccount,
  disconnectAccount,
} = require('../controllers/accountController');
const { protect } = require('../middleware/auth');

// All account routes require authentication
router.use(protect);

router.route('/')
  .get(getAccounts)
  .post(connectAccount);

// Connect endpoint uses the same handler
router.post('/connect', connectAccount);

router.delete('/:platform', disconnectAccount);

module.exports = router;