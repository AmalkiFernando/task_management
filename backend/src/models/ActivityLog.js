const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class ActivityLog extends Model {}

ActivityLog.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    action: { type: DataTypes.STRING(150), allowNull: false },
    entity_type: { type: DataTypes.STRING(50), allowNull: false },
    entity_id: { type: DataTypes.INTEGER, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
  },
  {
    sequelize,
    modelName: 'ActivityLog',
    tableName: 'activity_logs',
    updatedAt: false,
  }
);

module.exports = ActivityLog;