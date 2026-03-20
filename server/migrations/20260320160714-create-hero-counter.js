'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HeroCounters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      heroId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Heroes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      counterHeroId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Heroes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      weakAgainstHeroId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Heroes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      synergy: {
        type: Sequelize.FLOAT,
      },
      description: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('HeroCounters');
  },
};
