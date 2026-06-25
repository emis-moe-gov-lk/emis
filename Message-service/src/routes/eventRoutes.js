const { Router } = require('express');
const serviceAuth = require('../middleware/serviceAuth');

const router = Router();

// Phase 2 — producers publish alert events here using a service API key
router.post('/alert', serviceAuth, (req, res) => {
  res.status(501).json({
    success: false,
    error: { code: 'NOT_IMPLEMENTED', message: 'Event ingestion is not yet enabled (Phase 2).' },
  });
});

module.exports = router;
