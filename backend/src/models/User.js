const bcrypt = require('bcryptjs');
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class User extends Model {
  async comparePassword(plain) {
    return bcrypt.compare(plain, this.password);
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(120), allowNull: false, validate: { notEmpty: true } },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('admin', 'project_manager', 'team_member'),
      allowNull: false,
      defaultValue: 'team_member',
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: { attributes: { include: ['password'] } },
    },
  }
);

module.exports = User;