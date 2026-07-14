const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class ProjectMember extends Model {}

ProjectMember.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    project_role: {
      type: DataTypes.ENUM('manager', 'member'),
      allowNull: false,
      defaultValue: 'member',
    },
    professional_role: {
      type: DataTypes.ENUM(
        'designer',
        'frontend_developer',
        'backend_developer',
        'qa_engineer',
        'devops_engineer',
        'data_analyst',
        'product_manager',
        'business_analyst',
        'content_writer',
        'marketing_specialist',
        'other'
      ),
      allowNull: true,
      defaultValue: 'other',
    },
  },
  {
    sequelize,
    modelName: 'ProjectMember',
    tableName: 'project_members',
    indexes: [{ unique: true, fields: ['project_id', 'user_id'] }],
  }
);

module.exports = ProjectMember;
