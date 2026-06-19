'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      id:             { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      conversationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'conversations', key: 'id' } },
      sequenceNumber: { type: Sequelize.INTEGER, allowNull: false },
      role:           { type: Sequelize.ENUM('user', 'assistant'), allowNull: false },
      content:        { type: Sequelize.TEXT, allowNull: false },
      createdAt:      { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('messages');
  },
};
