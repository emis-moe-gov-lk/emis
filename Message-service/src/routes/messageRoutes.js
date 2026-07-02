const { Router } = require('express');
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

const router = Router();

// GET /api/messages/threads?q=...   → thread list for left panel
router.get('/threads', auth, messageController.getThreadList);

// GET /api/messages/threads/:senderUuid  → messages from one sender (auto-marks read)
router.get('/threads/:senderUuid', auth, messageController.getThreadMessages);

module.exports = router;
