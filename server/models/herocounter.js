'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HeroCounter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      HeroCounter.belongsTo(models.Hero, { foreignKey: 'heroId', as: 'hero' });
      HeroCounter.belongsTo(models.Hero, { foreignKey: 'counterHeroId', as: 'counterHero' });
      HeroCounter.belongsTo(models.Hero, {
        foreignKey: 'weakAgainstHeroId',
        as: 'weakAgainstHero',
      });
    }
  }
  HeroCounter.init(
    {
      heroId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Heroes',
          key: 'id',
        },
      },
      counterHeroId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Heroes',
          key: 'id',
        },
      },
      weakAgainstHeroId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Heroes',
          key: 'id',
        },
      },
      synergy: DataTypes.FLOAT,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'HeroCounter',
    }
  );
  return HeroCounter;
};
