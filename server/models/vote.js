'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Vote.belongsTo(models.User, { foreignKey: 'userId' });
      Vote.belongsTo(models.SavedStrategy, { foreignKey: 'savedStrategyId' });
    }
  }
  Vote.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      savedStrategyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'SavedStrategies',
          key: 'id',
        },
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Vote type is required' },
          isIn: {
            args: [['up', 'down']],
            msg: 'Vote type must be up or down',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Vote',
      tableName: 'Votes',
    }
  );
  return Vote;
};
