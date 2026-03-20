'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SavedStrategy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SavedStrategy.belongsTo(models.User, { foreignKey: 'userId' });
      SavedStrategy.hasMany(models.Vote, { foreignKey: 'savedStrategyId' });
    }
  }
  SavedStrategy.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Title is required' },
          notEmpty: { msg: 'Title is required' },
        },
      },
      enemyComp: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          notNull: { msg: 'Enemy composition is required' },
        },
      },
      recommendation: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Recommendation is required' },
          notEmpty: { msg: 'Recommendation is required' },
        },
      },
      itemBuild: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'SavedStrategy',
    }
  );
  return SavedStrategy;
};
