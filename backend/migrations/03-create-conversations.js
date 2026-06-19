'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('conversations', {
      id:        { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId:    { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'userId' } },
      problemId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'problems', key: 'id' } },
      language:  { type: Sequelize.ENUM('python', 'java', 'javascript'), allowNull: false },
      startedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      endedAt:   { type: Sequelize.DATE, allowNull: true },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('conversations');
  },
};
