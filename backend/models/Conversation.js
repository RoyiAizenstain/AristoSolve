const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Conversation', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:    { type: DataTypes.INTEGER, allowNull: false },
  problemId: { type: DataTypes.INTEGER, allowNull: false },
  language:  { type: DataTypes.ENUM('python', 'java', 'javascript'), allowNull: false },
  startedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  endedAt:   { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'conversations',
  createdAt: 'startedAt',
  updatedAt: false,
});
