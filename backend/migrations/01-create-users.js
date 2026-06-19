'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      userId:     { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      firstName:  { type: Sequelize.STRING(100), allowNull: false },
      lastName:   { type: Sequelize.STRING(100), allowNull: false },
      email:      { type: Sequelize.STRING(255), allowNull: false, unique: true },
      password:   { type: Sequelize.STRING(255), allowNull: false },
      userRole:   { type: Sequelize.ENUM('admin', 'company', 'candidate'), allowNull: false },
      level:      { type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'), defaultValue: 'beginner' },
      createDate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updateDate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};
