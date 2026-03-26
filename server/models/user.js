'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.SavedStrategy, { foreignKey: 'userId' });
      User.hasMany(models.Vote, { foreignKey: 'userId' });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Username is required' },
          notEmpty: { msg: 'Username is required' },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Email already exists' },
        validate: {
          notNull: { msg: 'Email is required' },
          notEmpty: { msg: 'Email is required' },
          isEmail: { msg: 'Invalid email format' },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Password is required' },
          notEmpty: { msg: 'Password is required' },
          len: {
            args: [6],
            msg: 'Password must be at least 6 characters',
          },
        },
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'user',
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      hooks: {
        beforeCreate(user) {
          if (user.password) {
            const { hashPassword } = require('../helpers/bcrypt');
            user.password = hashPassword(user.password);
          }
        },
      },
    }
  );
  return User;
};
