const asyncHandler = require('express-async-handler');
const { Comment, Task, User } = require('../models');

// @desc List comments for a task
// @route GET /api/tasks/:taskId/comments
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.findAll({
    where: { task_id: req.params.taskId },
    include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
    order: [['created_at', 'ASC']],
  });
  res.json({ success: true, data: comments });
});

// @desc Add a comment to a task
// @route POST /api/tasks/:taskId/comments
const addComment = asyncHandler(async (req, res) => {
  const task = await Task.findByPk(req.params.taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (req.user.role === 'team_member' && task.assigned_to !== req.user.id) {
    res.status(403);
    throw new Error('You can only comment on tasks assigned to you');
  }

  const comment = await Comment.create({
    task_id: task.id,
    user_id: req.user.id,
    body: req.body.body,
  });

  const full = await Comment.findByPk(comment.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
  });

  res.status(201).json({ success: true, data: full });
});

// @desc Delete a comment (author or admin only)
// @route DELETE /api/comments/:id
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only delete your own comments');
  }
  await comment.destroy();
  res.json({ success: true, message: 'Comment deleted' });
});

module.exports = { getComments, addComment, deleteComment };