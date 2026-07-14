const express = require('express');
const router = express.Router();
const { getMyTasks, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');
const { getComments, addComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { updateTaskRules } = require('../validators/taskValidators');
const validate = require('../middleware/validate');
const { body } = require('express-validator');

router.use(protect);

router.get('/my', getMyTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTaskRules, validate, updateTask);
router.delete('/:id', deleteTask);

router.get('/:taskId/comments', getComments);
router.post('/:taskId/comments', body('body').trim().notEmpty().withMessage('Comment cannot be empty'), validate, addComment);

module.exports = router;