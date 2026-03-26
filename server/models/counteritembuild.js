'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CounterItemBuild extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CounterItemBuild.belongsTo(models.Hero, { foreignKey: 'heroId' });
      CounterItemBuild.belongsTo(models.Item, { foreignKey: 'itemId' });
    }
  }
  CounterItemBuild.init(
    {
      heroId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Heroes',
          key: 'id',
        },
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Items',
          key: 'id',
        },
      },
      slot: {
        type: DataTypes.INTEGER,
        validate: {
          min: { args: [1], msg: 'Slot minimum is 1' },
          max: { args: [6], msg: 'Slot maximum is 6' },
        },
      },
      situational: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      note: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'CounterItemBuild',
    }
  );
  return CounterItemBuild;
};
