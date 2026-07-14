const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Project extends Model {}

Project.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false, validate: { notEmpty: true } },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'planning',
    },
    start_date: { type: DataTypes.DATEONLY, allowNull: true },
    end_date: { type: DataTypes.DATEONLY, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
  }
);

module.exports = Project;