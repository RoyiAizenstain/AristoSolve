'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('evaluations', {
      id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId:           { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'userId' } },
      problemId:        { type: Sequelize.INTEGER, allowNull: false, references: { model: 'problems', key: 'id' } },
      conversationId:   { type: Sequelize.INTEGER, allowNull: false, references: { model: 'conversations', key: 'id' } },
      companyId:        { type: Sequelize.INTEGER, allowNull: false },
      score:            { type: Sequelize.INTEGER },
      feedback:         { type: Sequelize.TEXT },
      thinkingAnalysis: { type: Sequelize.TEXT },
      dimensions:       { type: Sequelize.JSON },
      createdAt:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('evaluations');
  },
};
