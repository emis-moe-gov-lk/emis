const syncService = require('../services/syncService');
const alertService = require('../services/alertService');

const TYPE_MAP = {
  'pending-verification': 'pending_verification',
  'revised':              'revised',
  'pending-confirmation': 'pending_confirmation',
  'rejected':             'rejected',
};

async function trySync(fn) {
  try {
    await fn();
  } catch (err) {
    console.warn('[sync] Upstream unavailable, serving from DB cache:', err.message);
  }
}

async function getCounts(req, res, next) {
  try {
    await trySync(() => syncService.syncCounts(req.bearerToken));
    const data = await alertService.getCounts();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getList(req, res, next) {
  try {
    const routeType = req.params.type;
    const dbType = TYPE_MAP[routeType];

    if (!dbType) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Unknown alert type.' } });
    }

    const page    = req.query.page     ?? 1;
    const perPage = req.query.per_page ?? 20;

    await trySync(() => syncService.syncList(routeType, req.bearerToken, page, perPage));
    const data = await alertService.getList(dbType, page, perPage);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCounts, getList };
