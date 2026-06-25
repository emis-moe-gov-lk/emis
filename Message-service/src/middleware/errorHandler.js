const config = require('../config');

module.exports = function errorHandler(err, req, res, next) {
  const requestId = req.id || 'unknown';

  console.error(`[error] requestId=${requestId} ${err.message}`, config.isProduction ? '' : err.stack);

  if (res.headersSent) return next(err);

  if (err.isAxiosError) {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied by upstream service.' },
      });
    }
    return res.status(502).json({
      success: false,
      error: { code: 'UPSTREAM_ERROR', message: 'Upstream service returned an unexpected error.' },
    });
  }

  if (err.status && err.code) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.isProduction ? 'An internal error occurred.' : err.message,
    },
  });
};
