const asyncHandler = require('express-async-handler');
const { Task, Project, User, ProjectMember } = require('../models');
const logActivity = require('../utils/logActivity');

async function assertCanManageProjectTasks(req, project) {
  if (req.user.role === 'admin') return true;
  if (project.created_by === req.user.id) return true;
  const membership = await ProjectMember.findOne({
    where: { project_id: project.id, user_id: req.user.id, project_role: 'manager' },
  });
  return !!membership;
}

// @desc List tasks for a project (or all tasks assigned to current user if no project given)
// @route GET /api/projects/:projectId/tasks
const getProjectTasks = asyncHandler(async (req, res) => {
  const where = { project_id: req.project.id };
  if (req.query.status) where.status = req.query.status;
  if (req.query.assigned_to) where.assigned_to = req.query.assigned_to;

  // Team members only see tasks assigned to them within the project
  // Previously team members saw only tasks assigned to them.
  // Change: project members should be able to view all tasks for projects they belong to.

  const tasks = await Task.findAll({
    where,
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
    ],
    order: [['created_at', 'DESC']],
  });

  res.json({ success: true, data: tasks });
});

// @desc Get tasks assigned to the current user across all projects
// @route GET /api/tasks/my
const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.findAll({
    where: { assigned_to: req.user.id },
    include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'status'] }],
    order: [['due_date', 'ASC']],
  });
  res.json({ success: true, data: tasks });
});

// @desc Create a task within a project
// @route POST /api/projects/:projectId/tasks
// @access Admin, Project Manager (of that project)
const createTask = asyncHandler(async (req, res) => {
  const project = req.project;
  const allowed = await assertCanManageProjectTasks(req, project);
  if (!allowed) {
    res.status(403);
    throw new Error('Only the project manager or an admin can create tasks');
  }

  const { title, description, priority, due_date, assigned_to } = req.body;

  if (assigned_to) {
    const isMember = await ProjectMember.findOne({ where: { project_id: project.id, user_id: assigned_to } });
    if (!isMember) {
      res.status(400);
      throw new Error('Cannot assign a task to a user who is not a project member');
    }
  }

  const task = await Task.create({
    project_id: project.id,
    title,
    description,
    priority,
    due_date,
    assigned_to,
    created_by: req.user.id,
  });

  await logActivity({ userId: req.user.id, action: 'create_task', entityType: 'Task', entityId: task.id });

  res.status(201).json({ success: true, data: task });
});

// @desc Get single task
// @route GET /api/tasks/:id
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findByPk(req.params.id, {
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      { model: Project, as: 'project' },
    ],
  });
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Allow team members to view a task if they are a member of the task's project
  // or if the task is assigned to them. Admins and project managers/creators are allowed above.
  if (req.user.role === 'team_member') {
    const membership = await ProjectMember.findOne({ where: { project_id: task.project_id, user_id: req.user.id } });
    if (!membership && task.assigned_to !== req.user.id) {
      res.status(403);
      throw new Error('You can only view tasks assigned to you or tasks in projects you belong to');
    }
  }

  res.json({ success: true, data: task });
});

// @desc Update a task. Team members may only change status on their own tasks;
//       Admins/Managers can edit any field.
// @route PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const project = await Project.findByPk(task.project_id);
  const canManage = await assertCanManageProjectTasks(req, project);

  if (req.user.role === 'team_member') {
    if (task.assigned_to !== req.user.id) {
      res.status(403);
      throw new Error('You can only update tasks assigned to you');
    }
    // Team members can only update status (progress)
    if (req.body.status !== undefined) task.status = req.body.status;
  } else if (canManage) {
    const { title, description, status, priority, due_date, assigned_to } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (due_date !== undefined) task.due_date = due_date;
    if (assigned_to !== undefined) task.assigned_to = assigned_to;
  } else {
    res.status(403);
    throw new Error('You do not have permission to update this task');
  }

  await task.save();
  await logActivity({ userId: req.user.id, action: 'update_task', entityType: 'Task', entityId: task.id });

  res.json({ success: true, data: task });
});

// @desc Delete a task
// @route DELETE /api/tasks/:id
// @access Admin, Project Manager
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const project = await Project.findByPk(task.project_id);
  const canManage = await assertCanManageProjectTasks(req, project);
  if (!canManage) {
    res.status(403);
    throw new Error('Only the project manager or an admin can delete tasks');
  }

  await task.destroy();
  await logActivity({ userId: req.user.id, action: 'delete_task', entityType: 'Task', entityId: req.params.id });

  res.json({ success: true, message: 'Task deleted' });
});

module.exports = { getProjectTasks, getMyTasks, createTask, getTaskById, updateTask, deleteTask };