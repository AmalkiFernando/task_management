const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Project, ProjectMember, User, Task } = require('../models');
const logActivity = require('../utils/logActivity');

// @desc List projects visible to the current user
// @route GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  let where = {};
  let include = [
    { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
    { model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: ['project_role', 'professional_role'] } },
  ];

  if (req.query.search) {
    where.name = { [Op.like]: `%${req.query.search}%` };
  }
  if (req.query.status) {
    where.status = req.query.status;
  }

  if (req.user.role === 'admin') {
    // sees everything
  } else if (req.user.role === 'project_manager') {
    where[Op.and] = where[Op.and] || [];
  } else {
    // team_member: only projects they belong to
  }

  const { rows, count } = await Project.findAndCountAll({
    where,
    include,
    distinct: true,
    limit,
    offset: (page - 1) * limit,
    order: [['created_at', 'DESC']],
  });

  let filteredRows = rows;
  if (req.user.role === 'project_manager') {
    filteredRows = rows.filter(
      (p) => p.created_by === req.user.id || p.members.some((m) => m.id === req.user.id)
    );
  } else if (req.user.role === 'team_member') {
    filteredRows = rows.filter((p) => p.members.some((m) => m.id === req.user.id));
  }

  res.json({
    success: true,
    data: filteredRows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

// @desc Create a project
// @route POST /api/projects
// @access Admin, Project Manager
const createProject = asyncHandler(async (req, res) => {
  const { name, description, start_date, end_date } = req.body;

  const project = await Project.create({
    name,
    description,
    start_date,
    end_date,
    created_by: req.user.id,
  });

  // Creator is automatically a project manager on their own project
  await ProjectMember.create({ project_id: project.id, user_id: req.user.id, project_role: 'manager' });

  await logActivity({ userId: req.user.id, action: 'create_project', entityType: 'Project', entityId: project.id });

  const full = await Project.findByPk(project.id, {
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: ['project_role', 'professional_role'] } },
    ],
  });

  res.status(201).json({ success: true, data: full });
});

// @desc Get a single project (with members + task summary)
// @route GET /api/projects/:id
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id, {
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: ['project_role', 'professional_role'] } },
      { model: Task, as: 'tasks' },
    ],
  });

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.json({ success: true, data: project });
});

// @desc Update project details
// @route PUT /api/projects/:id
// @access Admin (any project), or Project Manager who owns/belongs to it
const updateProject = asyncHandler(async (req, res) => {
  const project = req.project; // set by loadProjectAndCheckAccess

  // Team members cannot edit any projects
  if (req.user.role === 'team_member') {
    res.status(403);
    throw new Error('Team members cannot edit project details');
  }

  // Project managers can only edit projects they created or belong to
  if (req.user.role === 'project_manager' && project.created_by !== req.user.id) {
    const isMember = req.membership && req.membership.project_role === 'manager';
    if (!isMember) {
      res.status(403);
      throw new Error('Only project creators or managers can edit this project');
    }
  }
  // Admins can edit any project (no additional checks needed)

  const { name, description, status, start_date, end_date } = req.body;
  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (status !== undefined) project.status = status;
  if (start_date !== undefined) project.start_date = start_date;
  if (end_date !== undefined) project.end_date = end_date;

  await project.save();
  await logActivity({ userId: req.user.id, action: 'update_project', entityType: 'Project', entityId: project.id });

  res.json({ success: true, data: project });
});

// @desc Delete a project
// @route DELETE /api/projects/:id
// @access Admin (any project), or Project Manager who owns/belongs to it
const deleteProject = asyncHandler(async (req, res) => {
  const project = req.project;

  // Team members cannot delete any projects
  if (req.user.role === 'team_member') {
    res.status(403);
    throw new Error('Team members cannot delete projects');
  }

  // Project managers can only delete projects they created or manage
  if (req.user.role === 'project_manager' && project.created_by !== req.user.id) {
    const isMember = req.membership && req.membership.project_role === 'manager';
    if (!isMember) {
      res.status(403);
      throw new Error('Only project creators or managers can delete this project');
    }
  }
  // Admins can delete any project (no additional checks needed)

  await project.destroy();
  await logActivity({ userId: req.user.id, action: 'delete_project', entityType: 'Project', entityId: req.params.id });

  res.json({ success: true, message: 'Project deleted' });
});

// @desc Add a member to a project
// @route POST /api/projects/:id/members
// @access Admin, Project Manager
const addMember = asyncHandler(async (req, res) => {
  const project = req.project;
  const { user_id, project_role, professional_role } = req.body;

  const user = await User.findByPk(user_id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const existing = await ProjectMember.findOne({ where: { project_id: project.id, user_id } });
  if (existing) {
    res.status(409);
    throw new Error('User is already a member of this project');
  }

  const membership = await ProjectMember.create({
    project_id: project.id,
    user_id,
    project_role: project_role || 'member',
    professional_role: professional_role || 'other',
  });

  await logActivity({
    userId: req.user.id,
    action: 'add_project_member',
    entityType: 'Project',
    entityId: project.id,
    metadata: { addedUserId: user_id, professionalRole: professional_role },
  });

  res.status(201).json({ success: true, data: membership });
});

// @desc Remove a member from a project
// @route DELETE /api/projects/:id/members/:userId
// @access Admin, Project Manager
const removeMember = asyncHandler(async (req, res) => {
  const project = req.project;
  const membership = await ProjectMember.findOne({
    where: { project_id: project.id, user_id: req.params.userId },
  });

  if (!membership) {
    res.status(404);
    throw new Error('Membership not found');
  }

  await membership.destroy();
  await logActivity({
    userId: req.user.id,
    action: 'remove_project_member',
    entityType: 'Project',
    entityId: project.id,
    metadata: { removedUserId: req.params.userId },
  });

  res.json({ success: true, message: 'Member removed' });
});

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
