'use strict';

const { hashPassword } = require('../helpers/bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        username: 'admin',
        email: 'admin@mlstrategylab.com',
        password: hashPassword('admin123'),
        role: 'admin',
        googleId: null,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'user1',
        email: 'user1@mail.com',
        password: hashPassword('user123'),
        role: 'user',
        googleId: null,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
