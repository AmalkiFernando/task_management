const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Comment extends Model {}

Comment.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
  }
);

module.exports = Comment;