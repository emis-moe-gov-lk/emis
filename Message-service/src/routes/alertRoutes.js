const { Router } = require('express');
const auth = require('../middleware/auth');
const { alertReads } = require('../middleware/rateLimiter');
const { paginationRules, handleValidation } = require('../middleware/validate');
const alertController = require('../controllers/alertController');

const router = Router();

router.get('/counts', alertReads, auth, alertController.getCounts);

router.get(
  '/:type(pending-verification|revised|pending-confirmation|rejected)',
  alertReads,
  auth,
  paginationRules,
  handleValidation,
  alertController.getList
);

module.exports = router;
