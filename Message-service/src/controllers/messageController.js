const messageService = require('../services/messageService');

async function getThreadList(req, res, next) {
  try {
    const userId = req.jwtPayload.sub;
    const search = req.query.q ?? '';
    const data = await messageService.getThreadList(userId, search);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getThreadMessages(req, res, next) {
  try {
    const userId = req.jwtPayload.sub;
    const { senderUuid } = req.params;
    const data = await messageService.getThreadMessages(userId, senderUuid);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getThreadList, getThreadMessages };
