const asyncHandler = require('express-async-handler');
const { Project, Task, User, ProjectMember, ActivityLog } = require('../models');
const { Op } = require('sequelize');

// @desc Role-aware dashboard summary
// @route GET /api/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    const [userCount, projectCount, taskCount, tasksByStatus, recentActivity] = await Promise.all([
      User.count(),
      Project.count(),
      Task.count(),
      Task.findAll({ attributes: ['status', [Task.sequelize.fn('COUNT', 'id'), 'count']], group: ['status'] }),
      ActivityLog.findAll({
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
        order: [['created_at', 'DESC']],
        limit: 15,
      }),
    ]);

    return res.json({
      success: true,
      data: { userCount, projectCount, taskCount, tasksByStatus, recentActivity },
    });
  }

  if (req.user.role === 'project_manager') {
    const projects = await Project.findAll({ where: { created_by: req.user.id } });
    const projectIds = projects.map((p) => p.id);
    const taskCount = await Task.count({ where: { project_id: { [Op.in]: projectIds } } });
    const tasksByStatus = await Task.findAll({
      attributes: ['status', [Task.sequelize.fn('COUNT', 'id'), 'count']],
      where: { project_id: { [Op.in]: projectIds } },
      group: ['status'],
    });
    const overdueTasks = await Task.count({
      where: {
        project_id: { [Op.in]: projectIds },
        due_date: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'done' },
      },
    });

    return res.json({
      success: true,
      data: { projectCount: projects.length, taskCount, tasksByStatus, overdueTasks },
    });
  }

  // team_member
  const myTasks = await Task.findAll({ where: { assigned_to: req.user.id } });
  const tasksByStatus = myTasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});
  const overdueTasks = myTasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  ).length;
  const projectCount = await ProjectMember.count({ where: { user_id: req.user.id } });

  res.json({
    success: true,
    data: { myTaskCount: myTasks.length, tasksByStatus, overdueTasks, projectCount },
  });
});

module.exports = { getDashboard };