const axios = require('axios');
const pool = require('../db/connection');
const config = require('../config');

const ALERT_TYPES = {
  'pending-verification': 'pending_verification',
  'revised': 'revised',
  'pending-confirmation': 'pending_confirmation',
  'rejected': 'rejected',
};

function buildClient(bearerToken) {
  return axios.create({
    baseURL: config.apim.baseUrl,
    headers: { Authorization: `Bearer ${bearerToken}` },
    timeout: 10000,
  });
}

function normalizeItem(raw, alertType) {
  const payload = {
    fullName: raw.full_name ?? raw.fullName ?? null,
    nameWithInitials: raw.name_with_initials ?? raw.nameWithInitials ?? null,
    appointmentDate: raw.appointment_date ?? raw.appointmentDate ?? null,
    school: {
      name: raw.school_name ?? raw.school?.name ?? null,
      censusNo: raw.census_no ?? raw.school?.censusNo ?? null,
    },
  };

  if (alertType === 'rejected') {
    payload.rejection = {
      reason: raw.rejection_reason ?? raw.rejection?.reason ?? null,
      rejectedAt: raw.rejected_at ?? raw.rejection?.rejectedAt ?? null,
    };
  }

  return {
    alert_type: ALERT_TYPES[alertType] ?? alertType,
    people_id: String(raw.people_id ?? raw.peopleId ?? ''),
    external_ref: String(raw.id ?? raw.people_id ?? raw.peopleId ?? ''),
    payload: JSON.stringify(payload),
  };
}

async function syncCounts(bearerToken) {
  const client = buildClient(bearerToken);
  const { data } = await client.get('/alerts/counts');

  const counts = data.data ?? data;
  const rows = [
    ['pending_verification', counts.pending_verification ?? counts.pendingVerification ?? 0],
    ['revised',              counts.revised ?? 0],
    ['pending_confirmation', counts.pending_confirmation ?? counts.pendingConfirmation ?? 0],
    ['rejected',             counts.rejected ?? 0],
  ];

  for (const [type, count] of rows) {
    await pool.query(
      'INSERT INTO alert_counts (alert_type, count) VALUES (?, ?) ON DUPLICATE KEY UPDATE count = VALUES(count)',
      [type, count]
    );
  }
}

async function syncList(alertType, bearerToken, page, perPage) {
  const client = buildClient(bearerToken);
  const { data } = await client.get(`/alerts/${alertType}`, {
    params: { page, per_page: perPage },
  });

  const items = (data.data?.items ?? data.data ?? data.items ?? []);

  for (const raw of items) {
    const row = normalizeItem(raw, alertType);
    await pool.query(
      `INSERT INTO alerts (alert_type, producer, people_id, external_ref, payload)
       VALUES (?, 'emis-hrm', ?, ?, ?)
       ON DUPLICATE KEY UPDATE payload = VALUES(payload), synced_at = NOW()`,
      [row.alert_type, row.people_id, row.external_ref, row.payload]
    );
  }
}

module.exports = { syncCounts, syncList };
