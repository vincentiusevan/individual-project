'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Hero extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Hero.hasMany(models.HeroCounter, { foreignKey: 'heroId' });
      Hero.hasMany(models.CounterItemBuild, { foreignKey: 'heroId' });
    }
  }
  Hero.init(
    {
      heroId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: 'Hero id from MLBB API is required' },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Hero name is required' },
          notEmpty: { msg: 'Hero name is required' },
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: 'Hero role is required',
          notEmpty: 'Hero role is required',
        },
      },
      specialty: DataTypes.STRING,
      imageUrl: DataTypes.STRING,
      lane: DataTypes.STRING,
      durability: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      offense: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      controlEffect: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      difficulty: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Hero',
    }
  );
  return Hero;
};
