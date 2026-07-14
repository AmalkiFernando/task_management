const sequelize = require('../config/db');
const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');
const Comment = require('./Comment');
const ActivityLog = require('./ActivityLog');

// User <-> Project (creator)
User.hasMany(Project, { foreignKey: 'created_by', as: 'createdProjects' });
Project.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Project <-> User (many-to-many through ProjectMember)
Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: 'project_id',
  otherKey: 'user_id',
  as: 'members',
});
User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: 'user_id',
  otherKey: 'project_id',
  as: 'projects',
});
Project.hasMany(ProjectMember, { foreignKey: 'project_id', as: 'memberships' });
ProjectMember.belongsTo(Project, { foreignKey: 'project_id' });
ProjectMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Project <-> Task
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Task <-> User (assignee, creator)
User.hasMany(Task, { foreignKey: 'assigned_to', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
User.hasMany(Task, { foreignKey: 'created_by', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Task <-> Comment
Task.hasMany(Comment, { foreignKey: 'task_id', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Task, { foreignKey: 'task_id' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });

// ActivityLog
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Project,
  ProjectMember,
  Task,
  Comment,
  ActivityLog,
};