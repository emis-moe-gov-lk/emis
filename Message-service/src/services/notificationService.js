const pool = require('../db/connection');
const laravelClient = require('../lib/laravelClient');

async function getInbox(userId, page, perPage) {
  const offset = (page - 1) * perPage;

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM notification_recipients nr
     JOIN notifications n ON n.id = nr.notification_id
     WHERE nr.people_id = ? AND n.status = 'sent'`,
    [userId],
  );

  const [rows] = await pool.query(
    `SELECT n.id, n.subject, n.body, n.is_urgent, n.require_ack, n.sent_at,
            nr.read_at, nr.acknowledged_at
     FROM notification_recipients nr
     JOIN notifications n ON n.id = nr.notification_id
     WHERE nr.people_id = ? AND n.status = 'sent'
     ORDER BY n.is_urgent DESC, n.sent_at DESC
     LIMIT ? OFFSET ?`,
    [userId, perPage, offset],
  );

  const items = rows.map((row) => ({
    id: row.id,
    subject: row.subject,
    body: row.body,
    isUrgent: Boolean(row.is_urgent),
    requireAck: Boolean(row.require_ack),
    sentAt: row.sent_at,
    readAt: row.read_at,
    acknowledgedAt: row.acknowledged_at,
  }));

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

async function markRead(notificationId, userId) {
  const now = new Date();
  await pool.query(
    `UPDATE notification_recipients
     SET read_at = ?
     WHERE notification_id = ? AND people_id = ? AND read_at IS NULL`,
    [now, notificationId, userId],
  );
  return { readAt: now.toISOString() };
}

async function acknowledge(notificationId, userId) {
  const [[notif]] = await pool.query(
    'SELECT require_ack FROM notifications WHERE id = ? AND status = ?',
    [notificationId, 'sent'],
  );

  if (!notif) {
    const err = new Error('Notification not found.');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (!notif.require_ack) {
    const err = new Error('This notification does not require acknowledgement.');
    err.status = 422;
    err.code = 'NOT_REQUIRED';
    throw err;
  }

  const now = new Date();
  await pool.query(
    `UPDATE notification_recipients
     SET acknowledged_at = ?
     WHERE notification_id = ? AND people_id = ? AND acknowledged_at IS NULL`,
    [now, notificationId, userId],
  );
  return { acknowledgedAt: now.toISOString() };
}

async function createNotification(senderId, senderRole, payload) {
  const { subject, body, isUrgent = false, requireAck = false, channels, scope } = payload;

  const [result] = await pool.query(
    `INSERT INTO notifications
       (sender_id, sender_role, status, subject, body, is_urgent, require_ack, channels, scope)
     VALUES (?, ?, 'draft', ?, ?, ?, ?, ?, ?)`,
    [
      senderId,
      senderRole || null,
      subject,
      body,
      isUrgent ? 1 : 0,
      requireAck ? 1 : 0,
      JSON.stringify(channels),
      JSON.stringify(scope),
    ],
  );

  return { id: result.insertId, status: 'draft', subject };
}

async function sendNotification(senderId, senderName, senderRoleLabel, payload) {
  const { subject, body, isUrgent = false, requireAck = false, channels, scope } = payload;

  // 1. Resolve recipients from Laravel
  let uuids, recipientCount;
  try {
    const res = await laravelClient.post('/api/message-service/resolve-recipients', { scope });
    uuids = res.data.data.uuids;
    recipientCount = res.data.data.count;
  } catch (axiosErr) {
    const err = new Error('Failed to resolve recipients from Laravel backend.');
    err.status = 502;
    err.code = 'SCOPE_RESOLUTION_FAILED';
    throw err;
  }

  if (recipientCount === 0) {
    const err = new Error('No recipients found for the given scope.');
    err.status = 422;
    err.code = 'NO_RECIPIENTS';
    throw err;
  }

  // 2. Insert notification + recipients in a transaction
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const now = new Date();
    const [result] = await conn.query(
      `INSERT INTO notifications
         (sender_id, sender_name, sender_role_label, status, subject, body,
          is_urgent, require_ack, channels, scope, recipient_count, sent_at)
       VALUES (?, ?, ?, 'sent', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        senderId, senderName, senderRoleLabel,
        subject, body,
        isUrgent ? 1 : 0, requireAck ? 1 : 0,
        JSON.stringify(channels), JSON.stringify(scope),
        recipientCount, now,
      ],
    );

    const notificationId = result.insertId;

    // Batch insert recipients
    const rows = uuids.map((uuid) => [notificationId, uuid]);
    await conn.query(
      'INSERT INTO notification_recipients (notification_id, people_id) VALUES ?',
      [rows],
    );

    await conn.commit();
    return { id: notificationId, recipientCount, sentAt: now.toISOString() };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getSent(senderId, page, perPage) {
  const offset = (page - 1) * perPage;

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM notifications WHERE sender_id = ? AND status = 'sent'`,
    [senderId],
  );

  const [rows] = await pool.query(
    `SELECT id, subject, LEFT(body, 120) AS preview, is_urgent, require_ack,
            recipient_count, sent_at
     FROM notifications
     WHERE sender_id = ? AND status = 'sent'
     ORDER BY sent_at DESC
     LIMIT ? OFFSET ?`,
    [senderId, perPage, offset],
  );

  const items = rows.map((r) => ({
    id: r.id,
    subject: r.subject,
    preview: r.preview,
    isUrgent: Boolean(r.is_urgent),
    requireAck: Boolean(r.require_ack),
    recipientCount: r.recipient_count,
    sentAt: r.sent_at,
  }));

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

async function getSentById(notificationId, senderId) {
  const [[row]] = await pool.query(
    `SELECT id, subject, body, is_urgent, require_ack, recipient_count,
            sent_at, scope, channels
     FROM notifications
     WHERE id = ? AND sender_id = ? AND status = 'sent'`,
    [notificationId, senderId],
  );

  if (!row) {
    const err = new Error('Notification not found.');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  return {
    id: row.id,
    subject: row.subject,
    body: row.body,
    isUrgent: Boolean(row.is_urgent),
    requireAck: Boolean(row.require_ack),
    recipientCount: row.recipient_count,
    sentAt: row.sent_at,
    scope: typeof row.scope === 'string' ? JSON.parse(row.scope) : row.scope,
    channels: typeof row.channels === 'string' ? JSON.parse(row.channels) : row.channels,
  };
}

module.exports = { getInbox, markRead, acknowledge, createNotification, sendNotification, getSent, getSentById };
