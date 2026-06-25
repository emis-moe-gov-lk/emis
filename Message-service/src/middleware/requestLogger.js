const crypto = require('crypto');
const morgan = require('morgan');

morgan.token('id', (req) => req.id);

module.exports = [
  (req, res, next) => {
    req.id = crypto.randomUUID();
    next();
  },
  morgan(':id :method :url :status :response-time ms - :remote-addr'),
];
