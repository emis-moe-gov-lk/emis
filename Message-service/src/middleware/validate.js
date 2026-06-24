const { query, validationResult } = require('express-validator');

const paginationRules = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('page must be an integer between 1 and 10000')
    .toInt(),
  query('per_page')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('per_page must be an integer between 1 and 100')
    .toInt(),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: errors.array()[0].msg,
      },
    });
  }
  next();
}

module.exports = { paginationRules, handleValidation };
