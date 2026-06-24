const pool = require('../db/connection');

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

module.exports = { getInbox, markRead, acknowledge, createNotification };
