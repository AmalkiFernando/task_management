const asyncHandler = require('express-async-handler');
const { Project, ProjectMember } = require('../models');

/**
 * Loads the project referenced by :projectId (or :id) onto req.project,
 * and enforces that team members can only access projects they belong to.
 * Admins and the project's manager/creator always have access.
 */
const loadProjectAndCheckAccess = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const project = await Project.findByPk(projectId);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (req.user.role === 'admin' || project.created_by === req.user.id) {
    req.project = project;
    return next();
  }

  const membership = await ProjectMember.findOne({
    where: { project_id: project.id, user_id: req.user.id },
  });

  if (!membership) {
    res.status(403);
    throw new Error('You are not a member of this project');
  }

  req.project = project;
  req.membership = membership;
  next();
});

module.exports = { loadProjectAndCheckAccess };