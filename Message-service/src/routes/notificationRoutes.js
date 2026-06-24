const { Router } = require('express');
const auth = require('../middleware/auth');
const { alertReads } = require('../middleware/rateLimiter');
const { paginationRules, handleValidation } = require('../middleware/validate');
const notificationController = require('../controllers/notificationController');

const router = Router();

router.get('/inbox', alertReads, auth, paginationRules, handleValidation, notificationController.getInbox);

router.patch('/:id/read', auth, notificationController.markRead);
router.patch('/:id/acknowledge', auth, notificationController.acknowledge);

router.post('/', auth, notificationController.createNotification);

module.exports = router;
