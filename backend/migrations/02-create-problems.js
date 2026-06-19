'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('problems', {
      id:          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title:       { type: Sequelize.STRING(255), allowNull: false },
      difficulty:  { type: Sequelize.ENUM('easy', 'medium', 'hard'), allowNull: false },
      topic:       { type: Sequelize.STRING(100), allowNull: false },
      type:        { type: Sequelize.ENUM('algorithm', 'system-design', 'debugging'), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      constraints: { type: Sequelize.TEXT },
      examples:    { type: Sequelize.JSON },
      testCases:   { type: Sequelize.JSON },
      starterCode: { type: Sequelize.JSON },
      evalPrompt:  { type: Sequelize.TEXT },
      isPublic:    { type: Sequelize.BOOLEAN, defaultValue: true },
      createdBy:   { type: Sequelize.INTEGER, allowNull: false },
      createdAt:   { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('problems');
  },
};
