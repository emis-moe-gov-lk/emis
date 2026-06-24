const notificationService = require('../services/notificationService');

async function getInbox(req, res, next) {
  try {
    const userId = req.jwtPayload.sub;
    const page = parseInt(req.query.page, 10) || 1;
    const perPage = parseInt(req.query.per_page, 10) || 50;
    const data = await notificationService.getInbox(userId, page, perPage);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const userId = req.jwtPayload.sub;
    const id = parseInt(req.params.id, 10);
    const data = await notificationService.markRead(id, userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function acknowledge(req, res, next) {
  try {
    const userId = req.jwtPayload.sub;
    const id = parseInt(req.params.id, 10);
    const data = await notificationService.acknowledge(id, userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createNotification(req, res, next) {
  try {
    const userId = req.jwtPayload.sub;
    const senderRole = req.jwtPayload.role || null;
    const data = await notificationService.createNotification(userId, senderRole, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getInbox, markRead, acknowledge, createNotification };
