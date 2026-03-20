'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Item.hasMany(models.CounterItemBuild, { foreignKey: 'itemId' });
    }
  }
  Item.init(
    {
      name: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.STRING,
      },
      price: {
        type: DataTypes.INTEGER,
      },
      imageUrl: DataTypes.STRING,
      description: DataTypes.TEXT,
      passive: DataTypes.TEXT,
      stats: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName: 'Item',
    }
  );
  return Item;
};
