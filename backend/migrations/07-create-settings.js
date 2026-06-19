'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('settings', {
      id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId:             { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'users', key: 'userId' } },
      displayName:        { type: Sequelize.STRING(200) },
      email:              { type: Sequelize.STRING(255) },
      theme:              { type: Sequelize.ENUM('dark', 'light'), defaultValue: 'dark' },
      emailNotifications: { type: Sequelize.BOOLEAN, defaultValue: true },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('settings');
  },
};
