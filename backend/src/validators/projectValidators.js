const { body } = require('express-validator');

const createProjectRules = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().isString(),
  body('start_date').optional().isISO8601().withMessage('start_date must be a valid date'),
  body('end_date').optional().isISO8601().withMessage('end_date must be a valid date'),
  body('end_date').custom((value, { req }) => {
    if (!value || !req.body.start_date) return true;
    if (new Date(value) <= new Date(req.body.start_date)) {
      throw new Error('End date must be greater than start date');
    }
    return true;
  }),
];

const updateProjectRules = [
  body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  body('start_date').optional().isISO8601().withMessage('start_date must be a valid date'),
  body('end_date').optional().isISO8601().withMessage('end_date must be a valid date'),
  body('start_date').custom((value, { req }) => {
    const currentEnd = req.body.end_date || req.project?.end_date;
    if (!value || !currentEnd) return true;
    if (new Date(currentEnd) <= new Date(value)) {
      throw new Error('Start date must be before end date');
    }
    return true;
  }),
  body('end_date').custom((value, { req }) => {
    const currentStart = req.body.start_date || req.project?.start_date;
    if (!value || !currentStart) return true;
    if (new Date(value) <= new Date(currentStart)) {
      throw new Error('End date must be greater than start date');
    }
    return true;
  }),
];

module.exports = { createProjectRules, updateProjectRules };