const { Router } = require('express');
const auth = require('../middleware/auth');
const { alertReads, sendLimit } = require('../middleware/rateLimiter');
const { paginationRules, sendRules, handleValidation } = require('../middleware/validate');
const notificationController = require('../controllers/notificationController');

const router = Router();

router.get('/inbox', alertReads, auth, paginationRules, handleValidation, notificationController.getInbox);
router.get('/sent', auth, notificationController.getSent);
router.get('/sent/:id', auth, notificationController.getSentById);

router.post('/send', sendLimit, auth, sendRules, handleValidation, notificationController.send);
router.post('/', auth, notificationController.createNotification);

router.patch('/:id/read', auth, notificationController.markRead);
router.patch('/:id/acknowledge', auth, notificationController.acknowledge);

module.exports = router;
