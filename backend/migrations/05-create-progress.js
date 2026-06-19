'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('progress', {
      id:            { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId:        { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'userId' } },
      problemId:     { type: Sequelize.INTEGER, allowNull: false, references: { model: 'problems', key: 'id' } },
      status:        { type: Sequelize.ENUM('in_progress', 'completed'), defaultValue: 'in_progress' },
      attempts:      { type: Sequelize.INTEGER, defaultValue: 1 },
      lastAttemptAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      deadline:      { type: Sequelize.DATE, allowNull: true },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('progress');
  },
};
