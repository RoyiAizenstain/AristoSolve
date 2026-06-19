const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Message', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversationId: { type: DataTypes.INTEGER, allowNull: false },
  sequenceNumber: { type: DataTypes.INTEGER, allowNull: false },
  role:           { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
  content:        { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: 'messages',
  createdAt: 'createdAt',
  updatedAt: false,
});
