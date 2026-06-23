const cors = require('cors');
const config = require('../config');

module.exports = cors({
  origin: config.cors.origin,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
  optionsSuccessStatus: 204,
});
