const { body } = require('express-validator');

const createTaskRules = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').optional().isString(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('due_date').optional().isISO8601().withMessage('due_date must be a valid date'),
  body('assigned_to').optional().isInt().withMessage('assigned_to must be a user id'),
  body('due_date').custom((value, { req }) => {
    if (!value) return true;
    const projectStart = req.project?.start_date;
    if (!projectStart) {
      throw new Error('Project start date is required before assigning a task due date');
    }
    if (new Date(value) <= new Date(projectStart)) {
      throw new Error('Task due date must be greater than the project start date');
    }
    return true;
  }),
];

const updateTaskRules = [
  body('title').optional().trim().notEmpty(),
  body('status').optional().isIn(['todo', 'in_progress', 'in_review', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('due_date').optional().isISO8601().withMessage('due_date must be a valid date'),
  body('assigned_to').optional().isInt(),
  body('due_date').custom(async (value, { req }) => {
    if (!value) return true;
    const { Task, Project } = require('../models');
    const task = await Task.findByPk(req.params.id);
    if (!task) return true;
    const project = await Project.findByPk(task.project_id);
    const projectStart = project?.start_date;
    if (!projectStart) {
      throw new Error('Project start date is required before assigning a task due date');
    }
    if (new Date(value) <= new Date(projectStart)) {
      throw new Error('Task due date must be greater than the project start date');
    }
    return true;
  }),
];

module.exports = { createTaskRules, updateTaskRules };