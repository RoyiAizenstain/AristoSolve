'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('admins', {
      id:           { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId:       { type: Sequelize.INTEGER, allowNull: false, unique: true,
                      references: { model: 'users', key: 'userId' },
                      onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      isSuperAdmin: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('admins');
  },
};
