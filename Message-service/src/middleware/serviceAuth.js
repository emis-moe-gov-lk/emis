const crypto = require('crypto');
const pool = require('../db/connection');

module.exports = async function serviceAuth(req, res, next) {
  const rawKey = req.headers['x-service-key'];
  if (!rawKey) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Service key is missing.' },
    });
  }

  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  try {
    const [rows] = await pool.query(
      'SELECT id, service_name FROM service_keys WHERE key_hash = ? AND active = 1',
      [keyHash]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or revoked service key.' },
      });
    }

    await pool.query('UPDATE service_keys SET last_used_at = NOW() WHERE id = ?', [rows[0].id]);
    req.serviceName = rows[0].service_name;
    next();
  } catch (err) {
    next(err);
  }
};
