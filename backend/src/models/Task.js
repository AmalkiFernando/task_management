const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Task extends Model {}

Task.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false, validate: { notEmpty: true } },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'in_review', 'done'),
      allowNull: false,
      defaultValue: 'todo',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
    },
    due_date: { type: DataTypes.DATEONLY, allowNull: true },
    assigned_to: { type: DataTypes.INTEGER, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
  }
);

module.exports = Task;