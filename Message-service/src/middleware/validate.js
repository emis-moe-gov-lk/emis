const { query, body, validationResult } = require('express-validator');

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

const sendRules = [
  body('subject')
    .isString()
    .withMessage('subject must be a string')
    .notEmpty()
    .withMessage('subject is required')
    .isLength({ max: 255 })
    .withMessage('subject must be at most 255 characters'),
  body('body')
    .isString()
    .withMessage('body must be a string')
    .notEmpty()
    .withMessage('body is required'),
  body('senderName')
    .isString()
    .withMessage('senderName must be a string')
    .notEmpty()
    .withMessage('senderName is required'),
  body('senderRoleLabel')
    .optional()
    .isString()
    .withMessage('senderRoleLabel must be a string'),
  body('scope')
    .isObject()
    .withMessage('scope must be an object'),
  body('scope.type')
    .isIn(['all', 'province', 'zone', 'division', 'school'])
    .withMessage('scope.type must be one of: all, province, zone, division, school'),
  body('channels')
    .isArray({ min: 1 })
    .withMessage('channels must be a non-empty array'),
  body('isUrgent')
    .optional()
    .isBoolean()
    .withMessage('isUrgent must be a boolean'),
  body('requireAck')
    .optional()
    .isBoolean()
    .withMessage('requireAck must be a boolean'),
];

module.exports = { paginationRules, sendRules, handleValidation };
