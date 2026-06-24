const pool = require('../db/connection');

async function getThreadList(userId, search) {
  const hasSearch = typeof search === 'string' && search.trim().length > 0;
  const q = hasSearch ? search.trim() : null;
  const like = q ? `%${q}%` : null;

  let whereClause = 'nr.people_id = ? AND n.status = ?';
  const baseParams = [userId, 'sent'];

  if (hasSearch) {
    whereClause += ` AND (
      n.sender_name LIKE ?
      OR n.sender_id LIKE ?
      OR n.sender_role_label LIKE ?
      OR MATCH(n.subject, n.body) AGAINST (? IN BOOLEAN MODE)
    )`;
    baseParams.push(like, like, like, `${q}*`);
  }

  const [rows] = await pool.query(
    `SELECT
       t.sender_id,
       t.sender_name,
       t.sender_role_label,
       t.latest_sent_at,
       t.unread_count,
       t.message_count,
       n.subject        AS latest_subject,
       LEFT(n.body, 120) AS latest_preview,
       n.is_urgent      AS latest_is_urgent
     FROM (
       SELECT
         n.sender_id,
         n.sender_name,
         n.sender_role_label,
         MAX(n.sent_at) AS latest_sent_at,
         MAX(n.id)      AS latest_id,
         SUM(CASE WHEN nr.read_at IS NULL THEN 1 ELSE 0 END) AS unread_count,
         COUNT(*)       AS message_count
       FROM notification_recipients nr
       JOIN notifications n ON n.id = nr.notification_id
       WHERE ${whereClause}
       GROUP BY n.sender_id, n.sender_name, n.sender_role_label
     ) t
     JOIN notifications n ON n.id = t.latest_id
     ORDER BY t.latest_sent_at DESC`,
    baseParams,
  );

  return rows.map((r) => ({
    senderId: r.sender_id,
    senderName: r.sender_name,
    senderRoleLabel: r.sender_role_label,
    latestSentAt: r.latest_sent_at,
    unreadCount: Number(r.unread_count),
    messageCount: Number(r.message_count),
    latestSubject: r.latest_subject,
    latestPreview: r.latest_preview,
    latestIsUrgent: Boolean(r.latest_is_urgent),
  }));
}

async function getThreadMessages(userId, senderUuid) {
  const [rows] = await pool.query(
    `SELECT
       n.id, n.sender_id, n.sender_name, n.sender_role_label,
       n.subject, n.body, n.is_urgent, n.require_ack, n.sent_at,
       nr.read_at, nr.acknowledged_at
     FROM notification_recipients nr
     JOIN notifications n ON n.id = nr.notification_id
     WHERE nr.people_id = ?
       AND n.sender_id = ?
       AND n.status = 'sent'
     ORDER BY n.sent_at ASC`,
    [userId, senderUuid],
  );

  if (rows.length === 0) return [];

  // Auto-mark all unread messages in this thread as read
  await pool.query(
    `UPDATE notification_recipients nr
     JOIN notifications n ON n.id = nr.notification_id
     SET nr.read_at = NOW()
     WHERE nr.people_id = ?
       AND n.sender_id = ?
       AND n.status = 'sent'
       AND nr.read_at IS NULL`,
    [userId, senderUuid],
  );

  return rows.map((r) => ({
    id: r.id,
    senderId: r.sender_id,
    senderName: r.sender_name,
    senderRoleLabel: r.sender_role_label,
    subject: r.subject,
    body: r.body,
    isUrgent: Boolean(r.is_urgent),
    requireAck: Boolean(r.require_ack),
    sentAt: r.sent_at,
    readAt: r.read_at,
    acknowledgedAt: r.acknowledged_at,
  }));
}

module.exports = { getThreadList, getThreadMessages };
