const pool = require('../db/connection');

async function getCounts() {
  const [rows] = await pool.query('SELECT alert_type, count FROM alert_counts');

  const result = {
    pendingVerification: 0,
    revised: 0,
    pendingConfirmation: 0,
    rejected: 0,
  };

  for (const row of rows) {
    if (row.alert_type === 'pending_verification') result.pendingVerification = row.count;
    else if (row.alert_type === 'revised')             result.revised = row.count;
    else if (row.alert_type === 'pending_confirmation') result.pendingConfirmation = row.count;
    else if (row.alert_type === 'rejected')            result.rejected = row.count;
  }

  return result;
}

async function getList(alertType, page, perPage) {
  const offset = (page - 1) * perPage;

  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM alerts WHERE alert_type = ? AND status = ?',
    [alertType, 'active']
  );

  const [rows] = await pool.query(
    'SELECT people_id, payload FROM alerts WHERE alert_type = ? AND status = ? ORDER BY synced_at DESC LIMIT ? OFFSET ?',
    [alertType, 'active', perPage, offset]
  );

  const items = rows.map((row) => {
    const p = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    return { peopleId: row.people_id, ...p };
  });

  return {
    items,
    pagination: {
      currentPage: page,
      lastPage: Math.ceil(total / perPage) || 1,
      perPage,
      total,
    },
  };
}

module.exports = { getCounts, getList };
